// lib/maintenance/validation.ts
// Feature 4: Input, Image, and File-Size Validation for Maintenance Triage

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  statusCode?: number;
  sanitizedDescription?: string;
  imageInfo?: {
    mimeType: string;
    sizeBytes: number;
    base64Data: string;
  };
}

export function validateMaintenanceTriageInput(body: any): ValidationResult {
  if (!body || typeof body !== "object") {
    return {
      valid: false,
      error: "Request body is required and must be a valid JSON object.",
      statusCode: 400,
    };
  }

  // 1. Description Validation
  const description = body.description;
  if (!description || typeof description !== "string") {
    return {
      valid: false,
      error: "Issue description is required.",
      statusCode: 400,
    };
  }

  const trimmedDesc = description.trim();
  if (trimmedDesc.length < 5) {
    return {
      valid: false,
      error: "Issue description is too short. Please provide at least 5 characters detailing the problem.",
      statusCode: 400,
    };
  }

  if (trimmedDesc.length > 2000) {
    return {
      valid: false,
      error: "Issue description exceeds maximum limit of 2,000 characters.",
      statusCode: 400,
    };
  }

  // 2. Optional Image(s) Validation
  let imageInfo: ValidationResult["imageInfo"] | undefined = undefined;

  // Helper to test single image object or string
  const checkSingleImage = (img: any): { valid: boolean; error?: string; statusCode?: number; info?: ValidationResult["imageInfo"] } => {
    if (!img) return { valid: true };

    if (typeof img === "string") {
      const dataUriMatch = img.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (dataUriMatch) {
        const mime = dataUriMatch[1].toLowerCase();
        const base64Content = dataUriMatch[2];
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
          return {
            valid: false,
            error: `Unsupported image format '${mime}'. Allowed formats are: JPEG, PNG, WEBP.`,
            statusCode: 415,
          };
        }
        const sizeBytes = Math.round((base64Content.length * 3) / 4);
        if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
          return {
            valid: false,
            error: `Image size exceeds the 5 MB limit (Uploaded: ~${Math.round(sizeBytes / (1024 * 1024))} MB).`,
            statusCode: 413,
          };
        }
        return {
          valid: true,
          info: { mimeType: mime, sizeBytes, base64Data: base64Content },
        };
      }
    } else if (typeof img === "object") {
      if (img.fileSize && img.fileSize > MAX_IMAGE_SIZE_BYTES) {
        return {
          valid: false,
          error: `Image size exceeds maximum allowed size of 5 MB (${img.fileSize} bytes).`,
          statusCode: 413,
        };
      }
      if (img.mimeType && !ALLOWED_IMAGE_MIME_TYPES.includes(img.mimeType.toLowerCase())) {
        return {
          valid: false,
          error: `Unsupported image MIME type '${img.mimeType}'. Allowed formats: JPEG, PNG, WEBP.`,
          statusCode: 415,
        };
      }
      if (img.data) {
        let base64 = img.data;
        const sub = img.data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (sub) {
          base64 = sub[2];
        }
        const calcSize = img.fileSize || Math.round((base64.length * 3) / 4);
        if (calcSize > MAX_IMAGE_SIZE_BYTES) {
          return {
            valid: false,
            error: `Image size exceeds maximum allowed size of 5 MB.`,
            statusCode: 413,
          };
        }
        return {
          valid: true,
          info: {
            mimeType: img.mimeType || "image/jpeg",
            sizeBytes: calcSize,
            base64Data: base64,
          },
        };
      }
    }
    return { valid: true };
  };

  if (body.images && Array.isArray(body.images)) {
    for (const item of body.images) {
      const res = checkSingleImage(item);
      if (!res.valid) {
        return { valid: false, error: res.error, statusCode: res.statusCode };
      }
      if (res.info && !imageInfo) {
        imageInfo = res.info;
      }
    }
  }

  if (body.image) {
    const res = checkSingleImage(body.image);
    if (!res.valid) {
      return { valid: false, error: res.error, statusCode: res.statusCode };
    }
    if (res.info && !imageInfo) {
      imageInfo = res.info;
    }
  }

  if (body.imageSizeBytes && body.imageSizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: "Image size exceeds maximum allowed size of 5 MB.",
      statusCode: 413,
    };
  }

  if (body.imageMimeType && !ALLOWED_IMAGE_MIME_TYPES.includes(body.imageMimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image MIME type '${body.imageMimeType}'. Allowed formats: JPEG, PNG, WEBP.`,
      statusCode: 415,
    };
  }

  return {
    valid: true,
    sanitizedDescription: trimmedDesc,
    imageInfo,
  };
}
