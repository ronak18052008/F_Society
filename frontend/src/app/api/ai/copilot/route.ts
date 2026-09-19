import { NextRequest, NextResponse } from "next/server";
import { getCopilotProvider, MockCopilotProvider } from "@/lib/ai/copilot/provider";
import {
  validateAndSanitizeInput,
  detectPromptInjection,
  checkRateLimit,
} from "@/lib/ai/copilot/guardrails";
import {
  createConversation,
  getConversations,
  getConversationMessages,
  saveMessage,
} from "@/lib/ai/copilot/storage";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(req);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before asking more questions.",
          retryAfter: rateCheck.resetSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetSeconds),
          },
        }
      );
    }

    // 2. Parse Request Body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request payload." },
        { status: 400 }
      );
    }

    const { message, conversationId, propertyId, role: bodyRole } = body || {};
    const roleCookie = req.cookies.get("nivasa_role")?.value;
    const userRole = (bodyRole || roleCookie || "tenant") as "tenant" | "owner";

    // 3. Input Validation and Sanitization
    const validation = validateAndSanitizeInput(message);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.statusCode || 400 }
      );
    }

    const sanitizedMessage = validation.sanitized;

    // 4. Prompt Injection Defense
    const injectionCheck = detectPromptInjection(sanitizedMessage);
    if (injectionCheck.isInjection) {
      return NextResponse.json(
        {
          error:
            "Your query was flagged by the Nivasa safety filter. Please rephrase your rental inquiry directly.",
          reason: injectionCheck.reason,
        },
        { status: 400 }
      );
    }

    // 5. Manage Conversation ID
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      activeConversationId = await createConversation(
        sanitizedMessage.slice(0, 40),
        null
      );
    }

    // 6. Save User Message
    await saveMessage(activeConversationId, "user", sanitizedMessage);

    // 7. Execute AI Provider with Graceful Fallback on Timeout
    const provider = getCopilotProvider();
    let payload;
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI Copilot request timed out after 9s")), 9000)
      );

      payload = await Promise.race([
        provider.generateResponse({
          message: sanitizedMessage,
          conversationId: activeConversationId,
          propertyId,
          role: userRole,
        }),
        timeoutPromise,
      ]);
    } catch (fallbackErr) {
      console.warn("AI Copilot provider timed out or encountered an issue, falling back to local domain engine:", fallbackErr);
      const fallbackProvider = new MockCopilotProvider();
      payload = await fallbackProvider.generateResponse({
        message: sanitizedMessage,
        conversationId: activeConversationId,
        propertyId,
        role: userRole,
      });
    }

    // 8. Save Assistant Reply
    await saveMessage(
      activeConversationId,
      "assistant",
      payload.reply,
      payload.intent,
      {
        recommendationsCount: payload.recommendations?.length || 0,
        hasComparison: Boolean(payload.comparison),
        hasRiskAudit: Boolean(payload.riskAudit),
      }
    );

    // 9. Return Structured Response
    return NextResponse.json({
      success: true,
      conversationId: activeConversationId,
      reply: payload.reply,
      intent: payload.intent,
      suggestedPrompts: payload.suggestedPrompts,
      recommendations: payload.recommendations || [],
      comparison: payload.comparison || null,
      riskAudit: payload.riskAudit || null,
      roommates: payload.roommates || null,
      actionTriggers: payload.actionTriggers || [],
    });
  } catch (error: any) {
    console.error("AI Copilot Error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your rental consultation. Please retry.",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      const messages = await getConversationMessages(conversationId);
      return NextResponse.json({
        conversationId,
        messages,
      });
    }

    const conversations = await getConversations();
    return NextResponse.json({
      conversations,
    });
  } catch (error: any) {
    console.error("AI Copilot Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversation history." },
      { status: 500 }
    );
  }
}
