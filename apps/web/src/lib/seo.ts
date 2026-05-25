import { SITE_URL } from "@/lib/locale";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_OG_IMAGE_WIDTH = "1200";
export const DEFAULT_OG_IMAGE_HEIGHT = "630";
export const SITE_NAME = "Evan Gruère";

export function cleanMetaContent(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function socialImageMeta(
  image = DEFAULT_OG_IMAGE,
  alt = SITE_NAME,
  dimensions?: { width?: number | null; height?: number | null },
) {
  const width =
    dimensions?.width?.toString() ||
    (image === DEFAULT_OG_IMAGE ? DEFAULT_OG_IMAGE_WIDTH : undefined);
  const height =
    dimensions?.height?.toString() ||
    (image === DEFAULT_OG_IMAGE ? DEFAULT_OG_IMAGE_HEIGHT : undefined);

  return [
    { property: "og:image", content: image },
    { property: "og:image:alt", content: cleanMetaContent(alt) },
    ...(width ? [{ property: "og:image:width", content: width }] : []),
    ...(height ? [{ property: "og:image:height", content: height }] : []),
    { name: "twitter:image", content: image },
  ];
}
