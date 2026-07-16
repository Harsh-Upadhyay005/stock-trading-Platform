// ============================================================
// app/api/webhooks/clerk/route.ts — Clerk webhook handler
// Syncs Clerk user events to our database
// ============================================================
import { type NextRequest } from "next/server"
import { headers } from "next/headers"
import { Webhook } from "svix"
import { applyRateLimit } from "@/utils/rate-limit-middleware"
import { db } from "@/lib/db"
import { logger } from "@/utils/logger"
import { ok, badRequest, serverError } from "@/utils/response"

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

if (!webhookSecret) {
  throw new Error("CLERK_WEBHOOK_SECRET is not set")
}

type ClerkWebhookEvent = {
  type: string
  data: {
    id: string
    email_addresses?: Array<{ email_address: string; id: string }>
    phone_numbers?: Array<{ phone_number: string; id: string }>
    first_name?: string
    last_name?: string
    image_url?: string
    created_at?: number
    updated_at?: number
  }
}

export async function POST(req: NextRequest) {
  // Apply rate limit for webhook endpoint (moderate to prevent abuse)
  const rateLimitResult = await applyRateLimit(req, "public")
  
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }

  try {
    // Get webhook headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return badRequest("Missing svix headers")
    }

    // Get the body
    const payload = await req.text()

    // Verify the webhook
    const wh = new Webhook(webhookSecret)
    let evt: ClerkWebhookEvent

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ClerkWebhookEvent
    } catch (err) {
      logger.error({ err }, "Webhook verification failed")
      return badRequest("Invalid signature")
    }

    const { type, data } = evt

    logger.info({ type, clerkId: data.id }, "Clerk webhook received")

    // Handle different event types
    switch (type) {
      case "user.created": {
        const email =
          data.email_addresses?.find((e) => e.id === data.email_addresses?.[0]?.id)
            ?.email_address ?? ""
        const phone = data.phone_numbers?.[0]?.phone_number ?? null

        await db.user.create({
          data: {
            clerkId: data.id,
            email,
            phone,
            firstName: data.first_name ?? "",
            lastName: data.last_name ?? "",
            avatarUrl: data.image_url,
            status: "ONBOARDING",
            role: "INVESTOR",
          },
        })

        logger.info({ clerkId: data.id, email }, "User created in database")
        break
      }

      case "user.updated": {
        const email =
          data.email_addresses?.find((e) => e.id === data.email_addresses?.[0]?.id)
            ?.email_address ?? ""
        const phone = data.phone_numbers?.[0]?.phone_number ?? null

        await db.user.update({
          where: { clerkId: data.id },
          data: {
            email,
            phone,
            firstName: data.first_name ?? "",
            lastName: data.last_name ?? "",
            avatarUrl: data.image_url,
          },
        })

        logger.info({ clerkId: data.id }, "User updated in database")
        break
      }

      case "user.deleted": {
        await db.user.update({
          where: { clerkId: data.id },
          data: {
            deletedAt: new Date(),
            status: "DEACTIVATED",
          },
        })

        logger.info({ clerkId: data.id }, "User soft-deleted in database")
        break
      }

      default:
        logger.debug({ type }, "Unhandled webhook event type")
    }

    return ok({ received: true })
  } catch (err) {
    logger.error({ err }, "Webhook processing error")
    return serverError()
  }
}
