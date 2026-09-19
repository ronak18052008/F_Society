import { NextRequest } from "next/server";

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
  statusCode?: number;
}

export interface PromptInjectionCheck {
  isInjection: boolean;
  reason?: string;
}

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_REQUESTS_PER_MINUTE = 30;
const WINDOW_MS = 60 * 1000;

// Periodic cleanup of stale rate-limit keys
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 120 * 1000);
}

/**
 * Validates and sanitizes raw user message input
 */
export function validateAndSanitizeInput(rawMessage: unknown): ValidationResult {
  if (rawMessage === undefined || rawMessage === null) {
    return { valid: false, sanitized: "", error: "Message is required.", statusCode: 400 };
  }

  if (typeof rawMessage !== "string") {
    return { valid: false, sanitized: "", error: "Message must be a string.", statusCode: 400 };
  }

  const trimmed = rawMessage.trim();

  if (trimmed.length === 0) {
    return { valid: false, sanitized: "", error: "Message cannot be empty.", statusCode: 400 };
  }

  if (trimmed.length > 2000) {
    return {
      valid: false,
      sanitized: "",
      error: "Message is too long. Maximum allowed length is 2000 characters.",
      statusCode: 400,
    };
  }

  // Sanitize control characters and normalize whitespaces
  const sanitized = trimmed
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, " ");

  return { valid: true, sanitized };
}

/**
 * Checks for prompt-injection attacks, role-manipulation, and system prompt extraction
 */
export function detectPromptInjection(input: string): PromptInjectionCheck {
  const lower = input.toLowerCase();

  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules|prompts)/i,
    /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules)/i,
    /forget\s+(all\s+)?(previous|prior)\s+(instructions|prompts)/i,
    /you\s+are\s+now\s+(a\s+developer|in\s+developer\s+mode|dan|unfiltered|jailbroken)/i,
    /reveal\s+(your\s+)?(system\s+prompt|initial\s+instructions|secret\s+instructions)/i,
    /print\s+(the\s+)?(system\s+prompt|above\s+instructions)/i,
    /output\s+(the\s+)?(prompt|system\s+message)\s+verbatim/i,
    /system\s*:\s*override/i,
    /bypass\s+safety\s+guidelines/i,
    /<\|im_start\|>|<\|im_end\|>|\[system\]/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(lower)) {
      return {
        isInjection: true,
        reason: "Prompt contains restricted directive override or injection patterns.",
      };
    }
  }

  return { isInjection: false };
}

/**
 * Detects and masks Sensitive Personal Data (PII) like Aadhaar, PAN, Card Numbers
 */
export function maskSensitivePII(text: string): string {
  let output = text;

  // Mask Indian Aadhaar numbers (12 digits, often formatted as 4-4-4)
  output = output.replace(/\b[2-9]{1}\d{3}\s?\d{4}\s?\d{4}\b/g, "[AADHAAR_PROTECTED]");

  // Mask Indian Permanent Account Numbers (PAN: 5 letters, 4 digits, 1 letter)
  output = output.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi, "[PAN_PROTECTED]");

  // Mask Credit/Debit Card numbers (16 digits)
  output = output.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, "[CARD_PROTECTED]");

  // Mask Phone numbers (10 digits starting with 6-9)
  output = output.replace(/\b(?:(?:\+91|0)?[ -]?)?[6-9]\d{9}\b/g, (match) => {
    // Keep last 4 digits visible
    const clean = match.replace(/\D/g, "");
    if (clean.length >= 10) {
      return `[PHONE_******${clean.slice(-4)}]`;
    }
    return match;
  });

  return output;
}

/**
 * Sliding window rate-limiter
 */
export function checkRateLimit(req: NextRequest, customId?: string): {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
} {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    customId ||
    "anonymous-client";

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_MINUTE - 1,
      resetSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    const remainingMs = Math.max(0, entry.resetAt - now);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  entry.count += 1;
  const remainingMs = Math.max(0, entry.resetAt - now);
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_MINUTE - entry.count,
    resetSeconds: Math.ceil(remainingMs / 1000),
  };
}
