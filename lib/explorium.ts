/**
 * Explorium AgentSource B2B Intelligence Service
 * Server-side only integration for business data enrichment.
 * 
 * Complies with strict security policies:
 * - Reads EXPLORIUM_API_KEY from environment on the server only.
 * - Never exposes the API key to client bundles or in console/audit logs.
 * - Enforces credit protection: requires explicit authorization before making credit-consuming calls.
 * - In-memory cache protects against accidental duplicate requests and quota drains.
 * - Implements official AgentSource v2 endpoints:
 *   * Match: POST https://api.explorium.ai/v2/businesses/match
 *   * Firmographics: POST https://api.explorium.ai/v2/businesses/firmographics/enrich
 *   * Technographics: POST https://api.explorium.ai/v2/businesses/technographics/enrich
 */

import type {
  BusinessEnrichmentData,
  EnrichmentRequest,
  EnrichmentResponse,
  ExploriumStatus,
} from "./types";

const EXPLORIUM_BASE_URL = "https://api.explorium.ai/v2";
const REQUEST_TIMEOUT_MS = 12000; // 12-second timeout protection
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache to prevent duplicate credit consumption

// In-memory cache for live enrichments
interface CachedEnrichment {
  data: BusinessEnrichmentData;
  timestamp: number;
}
const enrichmentCache = new Map<string, CachedEnrichment>();

/**
 * Retrieves the server-side Explorium API key without logging or leaking.
 */
function getServerApiKey(): string | undefined {
  const key = process.env.EXPLORIUM_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

/**
 * Returns public configuration status for client health checks.
 * NEVER exposes the actual key string or fragments.
 */
export function getExploriumStatus(): ExploriumStatus {
  const hasKey = Boolean(getServerApiKey());
  return {
    isConfigured: hasKey,
    provider: "Explorium AgentSource v2",
    apiVersion: "2.0 (REST & MCP)",
    creditProtectionActive: true,
    requiresCreditConfirmation: true,
  };
}

/**
 * Strips sensitive keys or authorization strings from any error before logging.
 */
function sanitizeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const key = getServerApiKey();
  if (key && key.length > 4) {
    return raw.split(key).join("[REDACTED_API_KEY]");
  }
  return raw;
}

/**
 * Matches a business domain or name using Explorium AgentSource v2 Match API.
 * Endpoint: POST https://api.explorium.ai/v2/businesses/match
 */
export async function matchBusinessWithExplorium(params: {
  domain?: string;
  name?: string;
  url?: string;
  linkedinUrl?: string;
  apiKey: string;
}): Promise<{
  businessId: string | null;
  matchedName: string;
  domain: string;
  matchConfidence: number;
  rawResponse?: Record<string, unknown>;
}> {
  const { domain, name, url, linkedinUrl, apiKey } = params;

  const requestBody = {
    businesses_to_match: [
      {
        ...(name ? { name: name.trim() } : {}),
        ...(domain ? { domain: domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "") } : {}),
        ...(url ? { url: url.trim() } : {}),
        ...(linkedinUrl ? { linkedin_url: linkedinUrl.trim() } : {}),
      },
    ],
  };

  const response = await fetch(`${EXPLORIUM_BASE_URL}/businesses/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_key: apiKey,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const status = response.status;
    let errorDetail = "";
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }

    if (status === 401 || status === 403) {
      throw new Error("AUTH_ERROR: Invalid or unauthorized Explorium AgentSource API key.");
    }
    if (status === 402 || errorDetail.toLowerCase().includes("credit") || errorDetail.toLowerCase().includes("quota")) {
      throw new Error("EXHAUSTED_CREDITS: Explorium account credits exhausted. Please top up your balance at admin.explorium.ai.");
    }
    if (status === 429) {
      throw new Error("RATE_LIMITED: Explorium API rate limit reached. Please wait before retrying.");
    }
    if (status >= 500) {
      throw new Error(`SERVICE_UNAVAILABLE: Explorium AgentSource service temporarily unavailable (status ${status}).`);
    }
    throw new Error(`EXPLORIUM_API_ERROR (${status}): ${sanitizeErrorMessage(errorDetail)}`);
  }

  const result = await response.json();
  const matchedList = result?.data || [];
  if (!Array.isArray(matchedList) || matchedList.length === 0 || !matchedList[0]?.business_id) {
    return {
      businessId: null,
      matchedName: name || domain || "Unknown Business",
      domain: domain || "",
      matchConfidence: 0,
      rawResponse: result,
    };
  }

  const match = matchedList[0];
  return {
    businessId: match.business_id,
    matchedName: match.matched_name || name || match.domain || "Matched Business",
    domain: match.domain || domain || "",
    matchConfidence: typeof match.match_confidence === "number" ? match.match_confidence : 0.95,
    rawResponse: result,
  };
}

/**
 * Enriches firmographic data using Explorium AgentSource v2 Firmographics API.
 * Endpoint: POST https://api.explorium.ai/v2/businesses/firmographics/enrich
 */
export async function enrichFirmographicsWithExplorium(params: {
  businessId: string;
  apiKey: string;
}): Promise<Record<string, unknown>> {
  const { businessId, apiKey } = params;

  const response = await fetch(`${EXPLORIUM_BASE_URL}/businesses/firmographics/enrich`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_key: apiKey,
    },
    body: JSON.stringify({
      business_ids: [businessId],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 401 || status === 403) {
      throw new Error("AUTH_ERROR: Unauthorized Explorium API key during firmographics enrichment.");
    }
    if (status === 402) {
      throw new Error("EXHAUSTED_CREDITS: Explorium account credits exhausted during firmographics enrichment.");
    }
    if (status === 429) {
      throw new Error("RATE_LIMITED: Explorium rate limit exceeded.");
    }
    if (status >= 500) {
      throw new Error(`SERVICE_UNAVAILABLE: Explorium firmographics service temporarily unavailable (status ${status}).`);
    }
    throw new Error(`FIRMOGRAPHICS_ERROR (${status}): Failed to fetch firmographic data.`);
  }

  const result = await response.json();
  const dataList = result?.data || [];
  return (Array.isArray(dataList) && dataList[0]) ? dataList[0] : (result || {});
}

/**
 * Enriches technographic data using Explorium AgentSource v2 Technographics API.
 * Endpoint: POST https://api.explorium.ai/v2/businesses/technographics/enrich
 */
export async function enrichTechnographicsWithExplorium(params: {
  businessId: string;
  apiKey: string;
}): Promise<string[]> {
  const { businessId, apiKey } = params;

  try {
    const response = await fetch(`${EXPLORIUM_BASE_URL}/businesses/technographics/enrich`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: apiKey,
      },
      body: JSON.stringify({
        business_ids: [businessId],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    const dataList = result?.data || [];
    const item = Array.isArray(dataList) ? dataList[0] : null;
    if (item && Array.isArray(item.technologies)) {
      return item.technologies.map((t: unknown) => (typeof t === "string" ? t : (t as Record<string, string>)?.name || ""));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Generates a realistic mock enrichment preview for zero-credit testing.
 * Strictly preserves credit quota while validating data schemas.
 */
function generateMockPreviewData(params: {
  domain?: string;
  name?: string;
  enrichmentType?: string;
}): BusinessEnrichmentData {
  const cleanDomain = (params.domain || "example.com")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

  const brandName = params.name?.trim() || cleanDomain.split(".")[0].toUpperCase();

  return {
    businessId: `exp_${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
    matchedName: brandName,
    domain: cleanDomain,
    matchConfidence: 0.98,
    companyName: `${brandName} Technologies Inc.`,
    legalName: `${brandName} Global Holdings LLC`,
    industry: "Information Technology & Enterprise Cloud",
    subIndustry: "Autonomous AI & SaaS Platforms",
    companySize: "1,001 - 5,000 employees",
    employeeCount: 2450,
    revenue: "$100M - $250M",
    revenueRange: "$100M - $250M ARR",
    headquartersLocation: "San Francisco, California, United States",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    foundedYear: 2018,
    companyType: "Private (Venture-Backed)",
    websiteUrl: `https://${cleanDomain}`,
    linkedinUrl: `https://linkedin.com/company/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
    description: `${brandName} is a high-growth market leader delivering resilient cloud infrastructure, predictive workflow automation, and enterprise B2B data intelligence.`,
    technologies: [
      "Next.js",
      "React 19",
      "PostgreSQL",
      "Prisma ORM",
      "Tailwind CSS",
      "Docker",
      "Kubernetes",
      "Cloudflare",
      "AWS S3",
      "Fastly CDN",
    ],
    isMockPreview: true,
    enrichedAt: new Date().toISOString(),
  };
}

/**
 * Main Business Enrichment Orchestration Handler.
 * Executes the complete waterfall: Match -> Firmographics -> Technographics
 * 
 * Enforces credit-protection:
 * - If authorizeCreditUsage !== true, returns zero-credit preview.
 * - If authorizeCreditUsage === true, requires EXPLORIUM_API_KEY and calls live APIs.
 * - Caches results to prevent duplicate credit consumption.
 */
export async function executeBusinessEnrichment(
  req: EnrichmentRequest
): Promise<EnrichmentResponse> {
  const { domain, name, url, linkedinUrl, enrichmentType = "comprehensive", authorizeCreditUsage = false } = req;

  if (!domain && !name && !url && !linkedinUrl) {
    return {
      success: false,
      error: "Please provide a company domain (e.g. stripe.com) or business name to enrich.",
      code: "INVALID_INPUT",
      provider: "Explorium AgentSource v2",
    };
  }

  const cleanDomain = domain ? domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "";
  const cleanName = name ? name.trim() : "";
  const cacheKey = `${cleanDomain}:${cleanName}:${enrichmentType}`;

  const apiKey = getServerApiKey();

  // CREDIT PROTECTION CHECK:
  // If the user did not explicitly authorize live credit consumption, provide a safe preview
  // without hitting Explorium's credit-consuming endpoints.
  if (!authorizeCreditUsage) {
    const previewData = generateMockPreviewData({ domain: cleanDomain, name: cleanName, enrichmentType });
    return {
      success: true,
      creditsUsed: false,
      provider: "Explorium AgentSource v2 (Zero-Credit Preview Mode)",
      message: apiKey
        ? "Credit protection active. Preview generated at zero credit cost. To execute live enrichment against Explorium's database, enable credit authorization."
        : "Credit protection active. Preview generated. Add your EXPLORIUM_API_KEY in .env.local to enable live AgentSource B2B intelligence.",
      data: previewData,
    };
  }

  // LIVE CREDIT-CONSUMING EXECUTION
  if (!apiKey) {
    return {
      success: false,
      error: "EXPLORIUM_API_KEY is not configured in .env.local. Add your API key to perform live enrichment.",
      code: "MISSING_API_KEY",
      provider: "Explorium AgentSource v2",
    };
  }

  // DUPLICATE REQUEST PROTECTION (Check in-memory cache)
  const cached = enrichmentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      success: true,
      creditsUsed: false,
      provider: "Explorium AgentSource v2 (Cached Intelligence)",
      data: cached.data,
      message: `Retrieved verified intelligence for ${cached.data.matchedName} from local cache (0 additional credits consumed).`,
    };
  }

  try {
    // 1. Match company to get canonical business_id
    const match = await matchBusinessWithExplorium({
      domain: cleanDomain,
      name: cleanName,
      url,
      linkedinUrl,
      apiKey,
    });

    if (!match.businessId) {
      return {
        success: false,
        error: `No matching business entity found in Explorium directory for '${name || domain}'. Please verify the company domain.`,
        code: "NO_MATCH",
        provider: "Explorium AgentSource v2",
      };
    }

    // 2. Fetch Firmographics
    let firmographics: Record<string, unknown> = {};
    try {
      firmographics = await enrichFirmographicsWithExplorium({
        businessId: match.businessId,
        apiKey,
      });
    } catch (firmoErr) {
      console.warn("[Explorium AgentSource] Firmographics fetch error:", sanitizeErrorMessage(firmoErr));
    }

    // 3. Fetch Technographics if requested
    let technologies: string[] = [];
    if (enrichmentType === "technographics" || enrichmentType === "comprehensive") {
      try {
        technologies = await enrichTechnographicsWithExplorium({
          businessId: match.businessId,
          apiKey,
        });
      } catch {
        technologies = [];
      }
    }

    // 4. Construct normalized business data
    const enrichedData: BusinessEnrichmentData = {
      businessId: match.businessId,
      matchedName: match.matchedName || String(firmographics.company_name || name || match.domain),
      domain: match.domain || String(firmographics.website_url || cleanDomain || ""),
      matchConfidence: match.matchConfidence,
      companyName: String(firmographics.company_name || match.matchedName || ""),
      legalName: String(firmographics.legal_name || ""),
      industry: String(firmographics.industry || "Technology"),
      subIndustry: String(firmographics.sub_industry || ""),
      companySize: String(firmographics.company_size || ""),
      employeeCount: (firmographics.employee_count as number | string) || (firmographics.company_size as string) || "N/A",
      revenue: (firmographics.revenue as number | string) || "N/A",
      revenueRange: String(firmographics.revenue_range || firmographics.revenue || "N/A"),
      headquartersLocation: String(firmographics.headquarters_location || ""),
      city: String(firmographics.city || ""),
      state: String(firmographics.state || ""),
      country: String(firmographics.country || ""),
      foundedYear: (firmographics.founded_year as number | string) || "N/A",
      companyType: String(firmographics.company_type || "Private"),
      websiteUrl: String(firmographics.website_url || (match.domain ? `https://${match.domain}` : "")),
      linkedinUrl: String(firmographics.linkedin_url || linkedinUrl || ""),
      description: String(firmographics.description || ""),
      technologies: technologies.length > 0 ? technologies : undefined,
      isMockPreview: false,
      enrichedAt: new Date().toISOString(),
      rawResponse: { match: match.rawResponse, firmographics },
    };

    // Store in duplicate protection cache
    enrichmentCache.set(cacheKey, { data: enrichedData, timestamp: Date.now() });

    return {
      success: true,
      creditsUsed: true,
      provider: "Explorium AgentSource v2 (Live Production Data)",
      data: enrichedData,
      message: `Successfully enriched business intelligence for ${enrichedData.matchedName} using Explorium AgentSource.`,
    };
  } catch (err: unknown) {
    const errorMsg = sanitizeErrorMessage(err);
    console.error("[Explorium AgentSource] Enrichment error:", errorMsg);

    const isTimeout = errorMsg.toLowerCase().includes("timeout") || errorMsg.toLowerCase().includes("aborted");
    const isExhausted = errorMsg.includes("EXHAUSTED_CREDITS");
    const isServiceDown = errorMsg.includes("SERVICE_UNAVAILABLE");
    const isAuth = errorMsg.includes("AUTH_ERROR");
    const isRateLimit = errorMsg.includes("RATE_LIMITED");

    const code = isTimeout
      ? "TIMEOUT"
      : isExhausted
      ? "EXHAUSTED_CREDITS"
      : isServiceDown
      ? "SERVICE_UNAVAILABLE"
      : isAuth
      ? "AUTH_ERROR"
      : isRateLimit
      ? "RATE_LIMITED"
      : "API_FAILURE";

    return {
      success: false,
      error: errorMsg.replace(/^(AUTH_ERROR|RATE_LIMITED|EXHAUSTED_CREDITS|SERVICE_UNAVAILABLE|EXPLORIUM_API_ERROR.*):\s*/, ""),
      code,
      provider: "Explorium AgentSource v2",
    };
  }
}
