import type { ImageLoaderProps } from "next/image";

const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`width=${width}`];
  
  // Cloudflare allows specific quality control, standard is usually 75
  if (quality) {
    params.push(`quality=${quality}`);
  }
  
  // Best practice: Auto-format to WebP/AVIF based on browser support
  params.push("format=auto");

  if (process.env.NODE_ENV === "development") {
    // Serve the original image when using `next dev`
    // We join with '&' for standard query params in dev
    return `${src}?${params.join("&")}`;
  }

  // Production: Use Cloudflare Image Resizing
  // We join with ',' for Cloudflare's specific URL syntax
  return `/cdn-cgi/image/${params.join(",")}/${normalizeSrc(src)}`;
}
