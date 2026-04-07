import { shell } from 'electron'
import { store } from './store'

export interface ShopifyConnection {
  shop: string
  accessToken: string
  shopName: string
  connectedAt: number
}

export interface ShopifyProduct {
  id: string
  title: string
  price: number
  description: string
  image: string
  handle: string
  url: string
  variants: { id: string; title: string; price: number; sku: string }[]
}

export interface ShopifyOrder {
  id: string
  orderNumber: number
  totalPrice: number
  currency: string
  createdAt: string
  lineItems: { title: string; quantity: number; price: number }[]
}

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || ''
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || ''
const REDIRECT_URI = 'https://streamsync.dev/shopify/callback'
const SCOPES = 'read_products,read_orders'

export function getShopifyAuthUrl(shop: string): string {
  return `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${Date.now()}`
}

export async function exchangeCodeForToken(shop: string, code: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code
      })
    })
    const data = await res.json()
    return data.access_token || null
  } catch {
    return null
  }
}

export async function fetchShopifyProducts(connection: ShopifyConnection): Promise<ShopifyProduct[]> {
  try {
    const res = await fetch(
      `https://${connection.shop}/admin/api/2024-01/products.json?limit=50`,
      {
        headers: { 'X-Shopify-Access-Token': connection.accessToken }
      }
    )
    const data = await res.json()
    return (data.products || []).map(
      (p: {
        id: number
        title: string
        body_html?: string
        handle: string
        image?: { src: string }
        variants?: { id: number; title: string; price: string; sku?: string }[]
      }) => ({
        id: String(p.id),
        title: p.title,
        price: parseFloat(p.variants?.[0]?.price || '0'),
        description: p.body_html?.replace(/<[^>]*>/g, '') || '',
        image: p.image?.src || '',
        handle: p.handle,
        url: `https://${connection.shop}/products/${p.handle}`,
        variants: (p.variants || []).map((v) => ({
          id: String(v.id),
          title: v.title,
          price: parseFloat(v.price || '0'),
          sku: v.sku || ''
        }))
      })
    )
  } catch {
    return []
  }
}

export async function fetchShopifyOrders(
  connection: ShopifyConnection,
  since?: string
): Promise<ShopifyOrder[]> {
  try {
    let url = `https://${connection.shop}/admin/api/2024-01/orders.json?limit=50&status=any`
    if (since) url += `&created_at_min=${since}`
    const res = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': connection.accessToken }
    })
    const data = await res.json()
    return (data.orders || []).map(
      (o: {
        id: number
        order_number: number
        total_price: string
        currency: string
        created_at: string
        line_items?: { title: string; quantity: number; price: string }[]
      }) => ({
        id: String(o.id),
        orderNumber: o.order_number,
        totalPrice: parseFloat(o.total_price || '0'),
        currency: o.currency,
        createdAt: o.created_at,
        lineItems: (o.line_items || []).map((li) => ({
          title: li.title,
          quantity: li.quantity,
          price: parseFloat(li.price || '0')
        }))
      })
    )
  } catch {
    return []
  }
}

export function openShopifyAuth(shop: string): void {
  const url = getShopifyAuthUrl(shop)
  shell.openExternal(url)
}

export function getShopifyConnection(): ShopifyConnection | null {
  return (store.get('shopifyConnection') as ShopifyConnection | null) || null
}

export function saveShopifyConnection(conn: ShopifyConnection): void {
  store.set('shopifyConnection', conn)
}

export function disconnectShopify(): void {
  store.delete('shopifyConnection' as never)
}
