import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

export default defineCloudflareConfig({
  // "Professional" Setup: Use R2 + Regional Memory
  // This is better than 'staticAssetsIncrementalCache' for a Tools site because
  // it allows you to update/regenerate tool pages (ISR) without redeploying.
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived", // Keeps hot pages in memory for 30mins+
    shouldLazilyUpdateOnCacheHit: true, // "Stale-While-Revalidate" behavior
    bypassTagCacheOnCacheHit: true, // Speed optimization
  }),
});
