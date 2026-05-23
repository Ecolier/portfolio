import type { GlobalAfterChangeHook } from 'payload'

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000'
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || ''

export function revalidateGlobal(...paths: string[]): GlobalAfterChangeHook {
  return async ({ doc, global }) => {
    try {
      const res = await fetch(`${WEB_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: REVALIDATE_SECRET, paths }),
      })

      if (!res.ok) {
        console.error(`[revalidate] Failed for global ${global.slug}:`, res.status)
      } else {
        console.log(`[revalidate] Revalidated global ${global.slug}, paths: ${paths.join(', ')}`)
      }
    } catch (err) {
      console.error('[revalidate] Error calling web revalidation:', err)
    }

    return doc
  }
}
