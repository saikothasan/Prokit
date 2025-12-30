import type { ImageLoaderProps } from "next/image";
 
const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};
 
export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  // Default params: auto-format (webp/avif) and width
  const params = [`width=${width}`, `format=auto`];
  
  if (quality) {
    params.push(`quality=${quality}`);
  }

  const paramsString = params.join(",");
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;

  if (process.env.NODE_ENV === "development") {
    // Serve the original image when using `next dev`
    return `${src}?width=${width}`;
  }

  if (r2Domain) {
    // SCENARIO: R2 Custom Domain
    // We use the Zone's image resizing (/cdn-cgi/image/) to fetch and optimize 
    // the image from the external R2 domain.
    // NOTE: You must enable "Resize images from any origin" in Cloudflare Dashboard.
    return `/cdn-cgi/image/${paramsString}/https://${r2Domain}/${normalizeSrc(src)}`;
  }

  // SCENARIO: Local/Standard Assets
  return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
}
