import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

let stripe: Stripe | null = null

function getStripe(): Stripe | null {
  if (!stripeSecretKey) return null
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey)
  }
  return stripe
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

  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: params.customerId ? undefined : params.email,
    customer: params.customerId || undefined,
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl || 'https://streamsync.dev/success',
    cancel_url: params.cancelUrl || 'https://streamsync.dev/cancel'
  })

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
