import { getDb } from "./db";
import { analyticsEvents, analyticsDaily, InsertAnalyticsEvent, AnalyticsDaily } from "../drizzle/schema";
import { eq, gte, lte, sql } from "drizzle-orm";

/**
 * Log an analytics event for tracking user actions
 */
export async function logAnalyticsEvent(
  userId: number | null,
  eventType: string,
  eventName: string,
  metadata?: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return;
  }

  try {
    await db.insert(analyticsEvents).values({
      userId,
      eventType,
      eventName,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error("[Analytics] Failed to log event:", error);
  }
}

/**
 * Get overall analytics stats
 */
export async function getOverallStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return null;
  }

  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT u.id) as totalUsers,
        COUNT(DISTINCT c.id) as totalConversations,
        COUNT(DISTINCT m.id) as totalMessages,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'microphone_used') as microphoneUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'speaker_used') as speakerUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'projects') as projectsUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'documents') as documentsUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'search') as searchUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'code') as codeUsage
      FROM users u
      LEFT JOIN conversations c ON u.id = c.userId
      LEFT JOIN messages m ON c.id = m.conversationId
    `) as any;

    return result?.[0] || null;
  } catch (error) {
    console.error("[Analytics] Failed to get overall stats:", error);
    return null;
  }
}

/**
 * Get daily analytics stats for a specific date
 */
export async function getDailyStats(date: string): Promise<AnalyticsDaily | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(analyticsDaily)
      .where(eq(analyticsDaily.date, date))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Analytics] Failed to get daily stats:", error);
    return null;
  }
}

/**
 * Get analytics stats for a date range
 */
export async function getDateRangeStats(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(analyticsDaily)
      .where(
        sql`${analyticsDaily.date} >= ${startDate} AND ${analyticsDaily.date} <= ${endDate}`
      )
      .orderBy(analyticsDaily.date);

    return result;
  } catch (error) {
    console.error("[Analytics] Failed to get date range stats:", error);
    return [];
  }
}

/**
 * Get feature usage breakdown
 */
export async function getFeatureUsageBreakdown() {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return null;
  }

  try {
    const result = await db.execute(sql`
      SELECT 
        eventName,
        COUNT(*) as usageCount
      FROM analyticsEvents
      WHERE eventType = 'tool_used'
      GROUP BY eventName
      ORDER BY usageCount DESC
    `) as any;

    return result || [];
  } catch (error) {
    console.error("[Analytics] Failed to get feature usage breakdown:", error);
    return [];
  }
}

/**
 * Get listening/speaking feature adoption
 */
export async function getSpeechFeatureStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return null;
  }

  try {
    const result = await db.execute(sql`
      SELECT 
        'microphone' as feature,
        COUNT(*) as usageCount,
        COUNT(DISTINCT userId) as uniqueUsers
      FROM analyticsEvents
      WHERE eventType = 'microphone_used'
      UNION ALL
      SELECT 
        'speaker' as feature,
        COUNT(*) as usageCount,
        COUNT(DISTINCT userId) as uniqueUsers
      FROM analyticsEvents
      WHERE eventType = 'speaker_used'
    `) as any;

    return result || [];
  } catch (error) {
    console.error("[Analytics] Failed to get speech feature stats:", error);
    return [];
  }
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics() {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return null;
  }

  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT u.id) as activeUsers,
        AVG(messageCount) as avgMessagesPerConversation,
        MAX(messageCount) as maxMessagesInConversation,
        COUNT(DISTINCT c.id) as totalConversations
      FROM users u
      LEFT JOIN conversations c ON u.id = c.userId
      LEFT JOIN (
        SELECT conversationId, COUNT(*) as messageCount
        FROM messages
        GROUP BY conversationId
      ) m ON c.id = m.conversationId
    `) as any;

    return result?.[0] || null;
  } catch (error) {
    console.error("[Analytics] Failed to get user engagement metrics:", error);
    return null;
  }
}

/**
 * Update daily analytics stats (typically run once per day)
 */
export async function updateDailyStats(date: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available");
    return;
  }

  try {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT u.id) as totalUsers,
        COUNT(DISTINCT c.id) as totalConversations,
        COUNT(DISTINCT m.id) as totalMessages,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'microphone_used' AND DATE(createdAt) = ${date}) as microphoneUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'speaker_used' AND DATE(createdAt) = ${date}) as speakerUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'projects' AND DATE(createdAt) = ${date}) as projectsUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'documents' AND DATE(createdAt) = ${date}) as documentsUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'search' AND DATE(createdAt) = ${date}) as searchUsage,
        (SELECT COUNT(*) FROM analyticsEvents WHERE eventType = 'tool_used' AND eventName = 'code' AND DATE(createdAt) = ${date}) as codeUsage
      FROM users u
      LEFT JOIN conversations c ON u.id = c.userId AND DATE(c.createdAt) = ${date}
      LEFT JOIN messages m ON c.id = m.conversationId AND DATE(m.createdAt) = ${date}
    `) as any;

    const data = stats?.[0] as any;

    await db
      .insert(analyticsDaily)
      .values({
        date,
        totalUsers: data?.totalUsers || 0,
        totalConversations: data?.totalConversations || 0,
        totalMessages: data?.totalMessages || 0,
        microphoneUsage: data?.microphoneUsage || 0,
        speakerUsage: data?.speakerUsage || 0,
        projectsToolUsage: data?.projectsUsage || 0,
        documentsToolUsage: data?.documentsUsage || 0,
        searchToolUsage: data?.searchUsage || 0,
        codeToolUsage: data?.codeUsage || 0,
      })
      .onDuplicateKeyUpdate({
        set: {
          totalUsers: data?.totalUsers || 0,
          totalConversations: data?.totalConversations || 0,
          totalMessages: data?.totalMessages || 0,
          microphoneUsage: data?.microphoneUsage || 0,
          speakerUsage: data?.speakerUsage || 0,
          projectsToolUsage: data?.projectsUsage || 0,
          documentsToolUsage: data?.documentsUsage || 0,
          searchToolUsage: data?.searchUsage || 0,
          codeToolUsage: data?.codeUsage || 0,
        },
      });
  } catch (error) {
    console.error("[Analytics] Failed to update daily stats:", error);
  }
}
