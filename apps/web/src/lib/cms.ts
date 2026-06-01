export const CMS_URL = process.env.CMS_URL || "http://localhost:3001";
const CMS_PUBLIC_URL = process.env.CMS_PUBLIC_URL || CMS_URL;

export function absoluteCMSUrl(url?: string | null) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `${CMS_PUBLIC_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}
