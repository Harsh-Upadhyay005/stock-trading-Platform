// ============================================================
// workers/alert.worker.ts — BullMQ alert processor
// Run with: npm run worker:alerts
// ============================================================
import { Worker, type Job } from "bullmq"
import { redis } from "@/lib/redis"
import { alertService } from "@/services/alert.service"
import { QUEUE_NAMES, type AlertJobData } from "@/lib/queue"
import { logger } from "@/utils/logger"

const worker = new Worker<AlertJobData>(
  QUEUE_NAMES.ALERTS,
  async (job: Job<AlertJobData>) => {
    const { symbolId, ticker, lastPrice, volume } = job.data

    logger.debug(
      { symbolId, ticker, lastPrice, jobId: job.id },
      "Evaluating alerts for symbol"
    )

    try {
      await alertService.evaluateAlerts(symbolId, lastPrice, volume)
    } catch (err) {
      logger.error({ err, symbolId, ticker }, "Alert evaluation failed")
      throw err
    }
  },
  {
    connection: redis as any,
    concurrency: 20, // Process multiple symbols concurrently
  }
)

worker.on("completed", (job) => {
  logger.debug({ jobId: job.id, ticker: job.data.ticker }, "Alert job completed")
})

worker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, ticker: job?.data.ticker, err },
    "Alert job failed"
  )
})

worker.on("error", (err) => {
  logger.error({ err }, "Alert worker error")
})

logger.info("Alert worker started")

export { worker as alertWorker }
