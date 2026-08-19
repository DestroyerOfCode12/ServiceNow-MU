import { SourceTier } from "@prisma/client";

/**
 * A source is only ever citable as "official" if its hostname is on this
 * allowlist (section 63 of the platform spec). Nothing outside this list may
 * be stored as a DocumentationSource with tier TIER1/TIER2 — arbitrary URLs
 * are never trusted just because an admin or an AI pass suggests them.
 *
 * Tiering follows the platform's documented source hierarchy:
 *   Tier 1 — ServiceNow product documentation, official CSA blueprint, Now Learning
 *   Tier 2 — ServiceNow Developer docs, official ServiceNow Community, Now Support KBs
 *   Tier 3 — anything else, supplementary context only, never authoritative
 */
export const ALLOWED_SOURCE_HOSTS: { host: string; tier: SourceTier }[] = [
  { host: "www.servicenow.com", tier: SourceTier.TIER1 }, // /docs paths are Tier 1 product docs; /community paths are downgraded at classify-time
  { host: "servicenow.com", tier: SourceTier.TIER1 },
  { host: "docs.servicenow.com", tier: SourceTier.TIER1 },
  { host: "nowlearning.servicenow.com", tier: SourceTier.TIER1 },
  { host: "learning.servicenow.com", tier: SourceTier.TIER1 },
  { host: "developer.servicenow.com", tier: SourceTier.TIER2 },
  { host: "support.servicenow.com", tier: SourceTier.TIER2 },
];

export interface HostClassification {
  isAllowed: boolean;
  tier: SourceTier | null;
  host: string;
}

/** Classify a URL's hostname against the allowlist, downgrading community/support paths to Tier 2. */
export function classifySourceUrl(url: string): HostClassification {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return { isAllowed: false, tier: null, host: "" };
  }

  const match = ALLOWED_SOURCE_HOSTS.find((h) => host === h.host || host.endsWith(`.${h.host}`));
  if (!match) return { isAllowed: false, tier: null, host };

  // Community forum / blog paths on servicenow.com are official but not
  // canonical product documentation — treat as Tier 2 regardless of host tier.
  const isCommunityPath = /\/community\//.test(url);
  const tier = isCommunityPath && match.tier === SourceTier.TIER1 ? SourceTier.TIER2 : match.tier;

  return { isAllowed: true, tier, host };
}

export function isOfficialSource(url: string): boolean {
  return classifySourceUrl(url).isAllowed;
}
