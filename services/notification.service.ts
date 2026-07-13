// ============================================================
// services/notification.service.ts
// ============================================================
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import type { NotificationJobData } from "@/lib/queue"

export class NotificationService {
  async send(data: NotificationJobData): Promise<void> {
    // 1. Check user preferences
    const pref = await db.notificationPreference.findUnique({
      where: {
        userId_type_channel: {
          userId: data.userId,
          type: data.type as never,
          channel: data.channel,
        },
      },
    })

    if (pref && !pref.enabled) {
      logger.debug({ userId: data.userId, type: data.type }, "Notification suppressed by user preference")
      return
    }

    // 2. Persist in-app notification
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type as never,
        channel: data.channel,
        title: data.title,
        body: data.body,
        data: data.data as never,
      },
    })

    // 3. Dispatch to channel (stub — integrate with your providers)
    try {
      switch (data.channel) {
        case "EMAIL":
          await this.sendEmail(data)
          break
        case "SMS":
          await this.sendSMS(data)
          break
        case "PUSH":
          await this.sendPush(data)
          break
        case "IN_APP":
        default:
          // Already stored — real-time via Socket.io
          break
      }

      await db.notification.update({
        where: { id: notification.id },
        data: { sentAt: new Date() },
      })
    } catch (err) {
      await db.notification.update({
        where: { id: notification.id },
        data: { failedAt: new Date() },
      })
      logger.error({ err, notificationId: notification.id }, "Notification send failed")
      throw err
    }
  }

  private async sendEmail(data: NotificationJobData): Promise<void> {
    // Integrate: Resend / SendGrid / AWS SES
    logger.info({ userId: data.userId, title: data.title }, "[EMAIL] Sending")
  }

  private async sendSMS(data: NotificationJobData): Promise<void> {
    // Integrate: Twilio / AWS SNS
    logger.info({ userId: data.userId }, "[SMS] Sending")
  }

  private async sendPush(data: NotificationJobData): Promise<void> {
    // Integrate: Firebase FCM / Expo
    logger.info({ userId: data.userId }, "[PUSH] Sending")
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [notifications, total, unread] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
    ])
    return { notifications, total, unread }
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async markAllRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
  }
}

export const notificationService = new NotificationService()