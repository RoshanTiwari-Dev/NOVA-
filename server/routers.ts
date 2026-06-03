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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getUserByEmail, upsertUser } = await import("./db");
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }

        // In a real app, hash the password!
        const openId = `manual-${Math.random().toString(36).substring(2, 15)}`;
        await upsertUser({
          openId,
          email: input.email,
          name: input.name,
          password: input.password, // SHOULD BE HASHED
          loginMethod: "manual",
        });

        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(openId);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getUserByEmail } = await import("./db");
        const user = await getUserByEmail(input.email);
        
        if (!user || user.password !== input.password) { // SHOULD CHECK HASH
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(user.openId);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
          const { createProject } = await import("./db");
          const result = await createProject(ctx.user.id, input.name, input.description);
          return {
            id: (result as any)[0].insertId,
            name: input.name,
            description: input.description || "",
            createdAt: new Date(),
            userId: ctx.user.id,
          };
        }),

      deleteProject: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const { deleteProject } = await import("./db");
          await deleteProject(input.id, ctx.user.id);
          return { success: true };
        }),

      listProjects: protectedProcedure.query(async ({ ctx }) => {
        const { getUserProjects } = await import("./db");
        return await getUserProjects(ctx.user.id);
      }),

      // Documents Tool
      uploadDocument: protectedProcedure
        .input(z.object({ filename: z.string(), content: z.string(), size: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const { createTool } = await import("./db");
          const result = await createTool(
            ctx.user.id,
            input.filename,
            "document",
            `Size: ${input.size}`,
            JSON.stringify({ content: input.content, size: input.size })
          );
          return {
            id: (result as any)[0].insertId,
            filename: input.filename,
            size: input.size,
            uploadedAt: new Date(),
            userId: ctx.user.id,
          };
        }),

      deleteDocument: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const { deleteTool } = await import("./db");
          await deleteTool(input.id, ctx.user.id);
          return { success: true };
        }),

      listDocuments: protectedProcedure.query(async ({ ctx }) => {
        const { getUserTools } = await import("./db");
        const tools = await getUserTools(ctx.user.id, "document");
        return tools.map(t => {
          let size = "Unknown";
          try {
            if (t.data) {
              const data = JSON.parse(t.data);
              size = typeof data.size === 'number' ? (data.size / 1024 / 1024).toFixed(2) + " MB" : data.size;
            }
          } catch (e) {}
          return {
            id: t.id,
            name: t.name,
            size: size,
            uploadedAt: t.createdAt,
          };
        });
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
});

export type AppRouter = typeof appRouter;
