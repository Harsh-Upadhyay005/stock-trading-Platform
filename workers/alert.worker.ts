// ============================================================
// workers/alert.worker.ts — BullMQ alert processor
// ============================================================
import { Worker, type Job } from "bullmq"
import { redis } from "@/lib/redis"
import { QUEUE_NAMES, type AlertJobData } from "@/lib/queue"
import { alertService } from "@/services/alert.service"
import { logger } from "@/utils/logger"

const worker = new Worker<AlertJobData>(
  QUEUE_NAMES.ALERTS,
  async (job: Job<AlertJobData>) => {
    const { symbolId, ticker, lastPrice, volume } = job.data
    logger.debug({ symbolId, ticker, lastPrice }, "Evaluating alerts")
    await alertService.evaluateAlerts(symbolId, lastPrice, volume)
  },
  {
    connection: redis,
    concurrency: 20, // high concurrency — fast reads
  }
)

worker.on("completed", (job) => {
  logger.debug({ jobId: job.id }, "Alert evaluation complete")
})

worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Alert job failed")
})

export { worker as alertWorker }