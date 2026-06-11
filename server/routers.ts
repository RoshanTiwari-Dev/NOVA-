import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import {
  createConversation,
  getConversationMessages,
  addMessage,
  deleteConversationMessages,
  getUserConversations,
  deleteConversation,
} from "./db";
import {
  logAnalyticsEvent,
  getOverallStats,
  getDailyStats,
  getDateRangeStats,
  getFeatureUsageBreakdown,
  getSpeechFeatureStats,
  getUserEngagementMetrics,
} from "./analytics";
import { hashPassword, verifyPassword, createToken } from "./auth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    signup: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existingUser.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email already registered" });
        }

        // Create user
        const passwordHash = hashPassword(input.password);
        const result = await db.insert(users).values({
          email: input.email,
          passwordHash,
          name: input.name || input.email.split("@")[0],
          loginMethod: "email",
        });

        const userId = (result as any).insertId;
        const token = createToken(userId);

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, userId };
      }),

    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Find user
        const user = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (user.length === 0 || !user[0].passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        // Verify password
        if (!verifyPassword(input.password, user[0].passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const token = createToken(user[0].id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, userId: user[0].id };
      }),
  }),

  chat: router({
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { conversationId, message } = input;

        // Verify conversation belongs to the user
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { conversations } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const conv = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);

          if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Conversation not found",
            });
          }
        }

        // Add user message to database
        await addMessage(conversationId, "user", message);

        // Get conversation history (last 10 messages for context)
        const allMessages = await getConversationMessages(conversationId);
        const contextMessages = allMessages.slice(-10);

        // Prepare messages for LLM
        const llmMessages: any[] = [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant. Answer questions clearly and concisely. If you don't know something, say so honestly.",
          },
          ...contextMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ];

        // Call LLM
        const response = await invokeLLM({
          messages: llmMessages,
        });

        const messageContent = response.choices[0]?.message?.content;
        const assistantReply =
          typeof messageContent === "string" ? messageContent : "I couldn't generate a response.";

        // Add assistant response to database
        await addMessage(conversationId, "assistant", assistantReply);

        return { reply: assistantReply };
      }),

    getHistory: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify conversation belongs to the user
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { conversations } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const conv = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, input.conversationId))
            .limit(1);

          if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Conversation not found",
            });
          }
        }

        const messages = await getConversationMessages(input.conversationId);
        return messages;
      }),

    createConversation: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await createConversation(ctx.user.id);
      return { conversationId: (result as any).insertId };
    }),

    resetConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { conversations } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const conv = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, input.conversationId))
            .limit(1);

          if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Conversation not found",
            });
          }
        }

        await deleteConversationMessages(input.conversationId);
        return { success: true };
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await getUserConversations(ctx.user.id);
      return conversations;
    }),

    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteConversation(input.conversationId, ctx.user.id);
        return { success: true };
      }),

    searchConversations: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const conversations = await getUserConversations(ctx.user.id);
        const query = input.query.toLowerCase();
        return conversations.filter(
          (conv: any) =>
            conv.title.toLowerCase().includes(query)
        );
      }),

    generateTitle: protectedProcedure
      .input(z.object({ conversationId: z.number(), firstMessage: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Generate a short, descriptive title (max 50 characters) for a chat conversation based on the first user message. Return only the title, no quotes or explanation.",
              },
              { role: "user", content: input.firstMessage },
            ],
          });

          const title = (response.choices[0]?.message?.content as string)?.trim().substring(0, 50) || "New Chat";

          const db = await import("./db").then((m) => m.getDb());
          if (db) {
            const { conversations } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            await db
              .update(conversations)
              .set({ title })
              .where(eq(conversations.id, input.conversationId));
          }

          return { title };
        } catch (error) {
          console.error("Error generating title:", error);
          return { title: "New Chat" };
        }
      }),

    generateShareLink: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { conversations } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const conv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, input.conversationId))
          .limit(1);

        if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        await db
          .update(conversations)
          .set({ shareToken, isPublic: "true" })
          .where(eq(conversations.id, input.conversationId));

        return { shareToken, shareUrl: `/share/${shareToken}` };
      }),

    exportConversation: protectedProcedure
      .input(z.object({ conversationId: z.number(), format: z.enum(["markdown", "json"]) }))
      .query(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { conversations } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const conv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, input.conversationId))
          .limit(1);

        if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const messages = await getConversationMessages(input.conversationId);

        if (input.format === "markdown") {
          let markdown = `# ${conv[0].title}\n\n`;
          markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
          messages.forEach((msg) => {
            const prefix = msg.role === "user" ? "**You:**" : "**Nova:**";
            markdown += `${prefix}\n${msg.content}\n\n`;
          });
          return { content: markdown, filename: `${conv[0].title}.md` };
        } else {
          const json = {
            title: conv[0].title,
            exportedAt: new Date().toISOString(),
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.createdAt,
            })),
          };
          return { content: JSON.stringify(json, null, 2), filename: `${conv[0].title}.json` };
        }
      }),

    renameConversation: protectedProcedure
      .input(z.object({ conversationId: z.number(), newTitle: z.string().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { conversations } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const conv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, input.conversationId))
          .limit(1);

        if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        await db
          .update(conversations)
          .set({ title: input.newTitle })
          .where(eq(conversations.id, input.conversationId));

        return { success: true };
      }),

    // Tools Router
    tools: router({
      // Projects Tool
      createProject: protectedProcedure
        .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
        const projectId = Math.random().toString(36).substring(2, 15);
        return {
          id: projectId,
          name: input.name,
          description: input.description || "",
          createdAt: new Date(),
          userId: ctx.user.id,
        };
      }),

      listProjects: protectedProcedure.query(async ({ ctx }) => {
      // Return sample projects for demo
      return [
        {
          id: "proj-1",
          name: "Web Development",
          description: "Frontend and backend projects",
          createdAt: new Date(),
        },
        {
          id: "proj-2",
          name: "Data Analysis",
          description: "Analytics and visualization projects",
          createdAt: new Date(),
        },
      ];
      }),

      // Documents Tool
      uploadDocument: protectedProcedure
      .input(z.object({ filename: z.string(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const docId = Math.random().toString(36).substring(2, 15);
        return {
          id: docId,
          filename: input.filename,
          size: input.content.length,
          uploadedAt: new Date(),
          userId: ctx.user.id,
        };
      }),

      listDocuments: protectedProcedure.query(async ({ ctx }) => {
      return [
        {
          id: "doc-1",
          filename: "project-proposal.pdf",
          size: 245000,
          uploadedAt: new Date(Date.now() - 86400000),
        },
        {
          id: "doc-2",
          filename: "meeting-notes.md",
          size: 15000,
          uploadedAt: new Date(Date.now() - 172800000),
        },
      ];
      }),

      searchWeb: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        try {
          const response = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(input.query)}&format=json&no_html=1&skip_disambig=1`
          );
          const data = await response.json() as any;
          const results = data.Results?.slice(0, 5).map((result: any) => ({
            title: result.Text,
            url: result.FirstURL,
            snippet: result.Text,
          })) || [];
          if (results.length === 0 && data.RelatedTopics) {
            return data.RelatedTopics.slice(0, 5).map((topic: any) => ({
              title: topic.Text?.split(' - ')[0] || 'Related Topic',
              url: topic.FirstURL || '#',
              snippet: topic.Text || 'Related search topic',
            }));
          }
          return results;
        } catch (error) {
          console.error('Search error:', error);
          return [];
        }
      }),

      // Code Interpreter Tool
      executeCode: protectedProcedure
      .input(z.object({ code: z.string(), language: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // This would execute code in a sandboxed environment
          // For now, return a mock response
          return {
            success: true,
            output: "Code execution completed successfully.",
            language: input.language,
          };
        } catch (error) {
          return {
            success: false,
            error: "Code execution failed",
          };
        }
      }),
    }),
  }),

  analytics: router({
    logEvent: protectedProcedure
      .input(
        z.object({
          eventType: z.string(),
          eventName: z.string(),
          metadata: z.record(z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await logAnalyticsEvent(ctx.user.id, input.eventType, input.eventName, input.metadata);
        return { success: true };
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getOverallStats();
      return stats;
    }),

    getDailyStats: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getDailyStats();
      return stats;
    }),

    getDateRangeStats: protectedProcedure
      .input(z.object({ startDate: z.string(), endDate: z.string() }))
      .query(async ({ ctx, input }) => {
        const stats = await getDateRangeStats(input.startDate, input.endDate);
        return stats;
      }),

    getFeatureUsage: protectedProcedure.query(async ({ ctx }) => {
      const usage = await getFeatureUsageBreakdown();
      return usage;
    }),

    getSpeechStats: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getSpeechFeatureStats();
      return stats;
    }),

    getUserEngagement: protectedProcedure.query(async ({ ctx }) => {
      const metrics = await getUserEngagementMetrics();
      return metrics;
    }),
  }),
});

export type AppRouter = typeof appRouter;
