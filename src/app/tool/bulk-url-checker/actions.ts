"use server";

import { domainToASCII } from "node:url";

export type UrlCheckResult = {
  url: string;
  status: "up" | "down" | "error";
  statusCode?: number;
  responseTime?: number; // in ms
  error?: string;
};

export async function checkBulkUrls(urls: string[]): Promise<UrlCheckResult[]> {
  const results: UrlCheckResult[] = [];

  // Limit concurrency to avoid hitting resource limits if the list is massive,
  // though Cloudflare Workers handle high concurrency well.
  // We'll process in chunks of 50.
  const CHUNK_SIZE = 50;

  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    const chunk = urls.slice(i, i + CHUNK_SIZE);

    const promises = chunk.map(async (inputUrl) => {
      let urlToCheck = inputUrl.trim();
      if (!urlToCheck) return null;

      if (!urlToCheck.startsWith("http://") && !urlToCheck.startsWith("https://")) {
        urlToCheck = "https://" + urlToCheck;
      }

      // Handle IDNs
      try {
        const u = new URL(urlToCheck);
        // Explicitly use domainToASCII for the hostname part if needed,
        // though URL constructor usually handles punycode.
        // We do this to ensure we are using the node:url API as requested.
        const asciiHostname = domainToASCII(u.hostname);
        u.hostname = asciiHostname;
        urlToCheck = u.toString();
      } catch {
        return {
          url: inputUrl,
          status: "error",
          error: "Invalid URL",
        } as UrlCheckResult;
      }

      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(urlToCheck, {
          method: "GET",
          headers: {
            "User-Agent": "BulkUrlChecker/1.0 (Cloudflare Workers)",
          },
          signal: controller.signal,
          redirect: "follow", // Follow redirects
        });

        clearTimeout(timeoutId);
        const end = performance.now();

        return {
          url: inputUrl,
          status: response.ok ? "up" : "down", // Consider 200-299 as UP, others potentially DOWN or just status codes
          statusCode: response.status,
          responseTime: Math.round(end - start),
        } as UrlCheckResult;

      } catch (err: unknown) {
        const end = performance.now();
        const errorMessage =
          err instanceof Error
            ? err.name === "AbortError"
              ? "Timeout"
              : err.message
            : "Unknown error";

        return {
          url: inputUrl,
          status: "error",
          error: errorMessage,
          responseTime: Math.round(end - start),
        } as UrlCheckResult;
      }
    });

    const chunkResults = await Promise.all(promises);
    results.push(...(chunkResults.filter((r) => r !== null) as UrlCheckResult[]));
  }

  return results;
}
