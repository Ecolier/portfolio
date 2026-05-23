import type { CollectionAfterChangeHook } from 'payload'

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000'
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || ''

export const revalidateProject: CollectionAfterChangeHook = async ({ doc, operation }) => {
  const paths = ['/', `/projects/${doc.Slug || doc.id}`]

  try {
    const res = await fetch(`${WEB_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: REVALIDATE_SECRET, paths }),
    })

    if (!res.ok) {
      console.error(`[revalidate] Failed to revalidate after ${operation}:`, res.status)
    } else {
      console.log(`[revalidate] Successfully revalidated after ${operation} on project ${doc.id}`)
    }
  } catch (err) {
    console.error('[revalidate] Error calling web revalidation:', err)
  }

  return doc
}
