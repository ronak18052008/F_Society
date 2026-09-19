// lib/maintenance/privacy.ts
// Feature 4: Privacy Protection & PII Sanitization for Maintenance Telemetry

/**
 * Sanitizes input text by redacting sensitive personally identifiable information (PII)
 * such as phone numbers, email addresses, payment tokens, and identity numbers.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    // Redact 10-12 digit phone numbers
    .replace(/(?:\+?\d{1,3}[-.s]?)?\(?\d{3}\)?[-.s]?\d{3}[-.s]?\d{4}/g, "[PHONE_REDACTED]")
    // Redact email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]")
    // Redact potential 12-digit Aadhaar / SSN formats
    .replace(/\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g, "[GOVT_ID_REDACTED]")
    // Redact PAN card patterns (5 uppercase letters, 4 digits, 1 letter)
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, "[PAN_REDACTED]")
    // Redact credit card patterns
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[CARD_REDACTED]");
}

/**
 * Sanitizes an entire log object to ensure no sensitive payloads,
 * binary image strings, or confidential resident data enter system logs.
 */
export function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();

    // Remove or summarize large binary image buffers
    if (keyLower.includes("image") && typeof value === "string") {
      sanitized[key] = value.startsWith("data:")
        ? `[IMAGE_DATA_URI_LENGTH_${value.length}_BYTES]`
        : value.slice(0, 40) + "...";
    } else if (
      keyLower.includes("password") ||
      keyLower.includes("token") ||
      keyLower.includes("secret") ||
      keyLower.includes("key")
    ) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
