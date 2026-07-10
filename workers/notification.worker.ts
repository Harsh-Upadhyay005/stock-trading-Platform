// ============================================================
// workers/notification.worker.ts — BullMQ notification processor
// Run with: npm run worker:notifications
// ============================================================
import { Worker, type Job } from "bullmq"
import { redis } from "@/lib/redis"
import { db } from "@/lib/db"
import { emitNotification } from "@/lib/socket"
import { QUEUE_NAMES, type NotificationJobData } from "@/lib/queue"
import { logger } from "@/utils/logger"

const worker = new Worker<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job<NotificationJobData>) => {
    const { userId, type, channel, title, body, data } = job.data

    logger.debug(
      { userId, type, channel, jobId: job.id },
      "Processing notification"
    )

    try {
      // Check if user has this notification preference enabled
      const preference = await db.notificationPreference.findUnique({
        where: {
          userId_type_channel: {
            userId,
            type: type as any,
            channel: channel as any,
          },
        },
      })

      // If preference exists and is disabled, skip
      if (preference && !preference.enabled) {
        logger.debug(
          { userId, type, channel },
          "Notification skipped (user preference disabled)"
        )
        return
      }

      // Create notification record
      const notification = await db.notification.create({
        data: {
          userId,
          type: type as any,
          channel: channel as any,
          title,
          body,
          data: data ?? {},
          sentAt: new Date(),
        },
      })

      // Send via appropriate channel
      switch (channel) {
        case "IN_APP":
          // Emit via WebSocket
          emitNotification(userId, {
            id: notification.id,
            type,
            title,
            body,
            data,
            createdAt: notification.createdAt,
          })
          break

        case "EMAIL":
          // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
          logger.info({ userId, type, title }, "Email notification (not implemented)")
          break

        case "SMS":
          // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
          logger.info({ userId, type, title }, "SMS notification (not implemented)")
          break

        case "PUSH":
          // TODO: Integrate with push notification service (FCM, APNS, etc.)
          logger.info({ userId, type, title }, "Push notification (not implemented)")
          break

        default:
          logger.warn({ channel }, "Unknown notification channel")
      }

      logger.info(
        { userId, type, channel, notificationId: notification.id },
        "Notification sent"
      )
    } catch (err) {
      logger.error({ err, userId, type, channel }, "Notification processing failed")
      throw err
    }
  },
  {
    connection: redis as any,
    concurrency: 10,
  }
)

worker.on("completed", (job) => {
  logger.debug(
    { jobId: job.id, userId: job.data.userId, type: job.data.type },
    "Notification job completed"
  )
})

worker.on("failed", (job, err) => {
  logger.error(
    {
      jobId: job?.id,
      userId: job?.data.userId,
      type: job?.data.type,
      err,
    },
    "Notification job failed"
  )
})

worker.on("error", (err) => {
  logger.error({ err }, "Notification worker error")
})

logger.info("Notification worker started")

export { worker as notificationWorker }
