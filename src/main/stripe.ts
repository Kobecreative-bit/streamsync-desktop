import Stripe from 'stripe'
import { createServer, type IncomingMessage, type ServerResponse } from 'http'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

let stripe: Stripe | null = null
let webhookServer: ReturnType<typeof createServer> | null = null
let planUpdateCallback: ((userId: string, plan: string, stripeCustomerId: string) => void) | null = null

function getStripe(): Stripe | null {
  if (!stripeSecretKey) return null
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey)
  }
  return stripe
}

export function setPlanUpdateCallback(cb: (userId: string, plan: string, stripeCustomerId: string) => void): void {
  planUpdateCallback = cb
}

// Map Stripe price IDs to plan tiers
const PRICE_TO_PLAN: Record<string, string> = {
  price_1TIiWCARUnydmSgWShLWNzCo: 'starter',
  price_1TIiWEARUnydmSgW0RzPA5xQ: 'starter',
  price_1TIiWFARUnydmSgWwougM5qb: 'pro',
  price_1TIiWHARUnydmSgWg9fK5bYN: 'pro',
  price_1TIiWIARUnydmSgWjwTpdQ95: 'enterprise',
  price_1TIiWKARUnydmSgWwXANk60q: 'enterprise'
}

export async function createCheckoutSession(params: {
  priceId: string
  customerId?: string
  email: string
  successUrl?: string
  cancelUrl?: string
}): Promise<string | null> {
  const s = getStripe()
  if (!s) return null

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl || 'https://streamsync.dev/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: params.cancelUrl || 'https://streamsync.dev/cancel',
    metadata: { email: params.email }
  }

  if (params.customerId) {
    sessionParams.customer = params.customerId
  } else {
    sessionParams.customer_email = params.email
  }

  const session = await s.checkout.sessions.create(sessionParams)
  return session.url
}

export async function createBillingPortalSession(customerId: string): Promise<string | null> {
  const s = getStripe()
  if (!s) return null

  const session = await s.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://streamsync.dev'
  })

  return session.url
}

function handleWebhookEvent(event: Stripe.Event): void {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const email = session.customer_email || session.metadata?.email || ''
      const subscriptionId = session.subscription as string

      // Look up the plan from the subscription
      if (stripe && subscriptionId) {
        stripe.subscriptions.retrieve(subscriptionId).then((sub) => {
          const priceId = sub.items.data[0]?.price.id || ''
          const plan = PRICE_TO_PLAN[priceId] || 'starter'
          if (planUpdateCallback) {
            planUpdateCallback(email, plan, customerId)
          }
        }).catch(console.error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const priceId = sub.items.data[0]?.price.id || ''
      const plan = PRICE_TO_PLAN[priceId] || 'starter'

      if (planUpdateCallback) {
        planUpdateCallback(customerId, plan, customerId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      if (planUpdateCallback) {
        planUpdateCallback(customerId, 'starter', customerId)
      }
      break
    }
  }
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export function startWebhookServer(port = 4242): void {
  if (webhookServer) return

  const s = getStripe()
  if (!s) {
    console.warn('Stripe not configured — webhook server not started')
    return
  }

  webhookServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'POST' && req.url === '/webhook') {
      try {
        const body = await readBody(req)
        const sig = req.headers['stripe-signature'] as string

        let event: Stripe.Event
        if (stripeWebhookSecret) {
          event = s.webhooks.constructEvent(body, sig, stripeWebhookSecret)
        } else {
          event = JSON.parse(body.toString()) as Stripe.Event
        }

        handleWebhookEvent(event)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ received: true }))
      } catch (err) {
        console.error('Webhook error:', err)
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Webhook error' }))
      }
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  webhookServer.listen(port, '127.0.0.1', () => {
    console.log(`Stripe webhook server listening on port ${port}`)
  })
}

export function stopWebhookServer(): void {
  if (webhookServer) {
    webhookServer.close()
    webhookServer = null
  }
}
