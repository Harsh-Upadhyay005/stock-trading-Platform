import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return new Response('No webhook secret', { status: 500 })

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any
  try {
    evt = wh.verify(body, { 'svix-id': svix_id, 'svix-timestamp': svix_timestamp, 'svix-signature': svix_signature })
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const { id: clerkId, email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data
  const email = email_addresses?.[0]?.email_address
  const phone = phone_numbers?.[0]?.phone_number

  if (evt.type === 'user.created') {
    await db.user.create({
      data: {
        clerkId, email: email!, firstName: first_name ?? '', lastName: last_name ?? '',
        avatarUrl: image_url, phone, status: 'ONBOARDING', role: 'INVESTOR',
      },
    })
  } else if (evt.type === 'user.updated') {
    await db.user.update({
      where: { clerkId },
      data: { email: email!, firstName: first_name ?? '', lastName: last_name ?? '', avatarUrl: image_url, phone },
    })
  } else if (evt.type === 'user.deleted') {
    await db.user.update({ where: { clerkId }, data: { deletedAt: new Date() } })
  }

  return new Response('OK', { status: 200 })
}