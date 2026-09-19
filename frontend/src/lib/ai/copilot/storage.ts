import { createClient } from "@/lib/supabase/client";

export interface AIConversation {
  id: string;
  user_id?: string | null;
  title: string;
  last_intent?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// In-memory persistent cache for zero-downtime offline and demo operations
const inMemoryConversations = new Map<string, AIConversation>();
const inMemoryMessages = new Map<string, AIMessage[]>();

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "copilot-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now().toString(36);
}

export async function createConversation(
  title = "Rental Consultation",
  userId: string | null = null,
  initialIntent?: string
): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();

  const conv: AIConversation = {
    id,
    user_id: userId,
    title,
    last_intent: initialIntent,
    metadata: {},
    created_at: now,
    updated_at: now,
  };

  inMemoryConversations.set(id, conv);
  inMemoryMessages.set(id, []);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("ai_conversations").insert({
        id,
        user_id: userId,
        title,
        last_intent: initialIntent,
        metadata: {},
        created_at: now,
        updated_at: now,
      });
    } catch {
      // Gracefully maintain in-memory fallback
    }
  }

  return id;
}

export async function getConversations(userId?: string): Promise<AIConversation[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      let query = supabase
        .from("ai_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as AIConversation[];
      }
    } catch {
      // Fallback
    }
  }

  const list = Array.from(inMemoryConversations.values());
  list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  return list;
}

export async function getConversationMessages(conversationId: string): Promise<AIMessage[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as AIMessage[];
      }
    } catch {
      // Fallback
    }
  }

  return inMemoryMessages.get(conversationId) || [];
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  intent?: string,
  metadata: Record<string, any> = {}
): Promise<AIMessage> {
  const id = generateId();
  const now = new Date().toISOString();

  const message: AIMessage = {
    id,
    conversation_id: conversationId,
    role,
    content,
    intent,
    metadata,
    created_at: now,
  };

  // Ensure conversation exists in memory
  if (!inMemoryConversations.has(conversationId)) {
    inMemoryConversations.set(conversationId, {
      id: conversationId,
      title: content.slice(0, 36) + (content.length > 36 ? "..." : ""),
      last_intent: intent,
      created_at: now,
      updated_at: now,
    });
  } else {
    const existing = inMemoryConversations.get(conversationId)!;
    existing.updated_at = now;
    if (intent) existing.last_intent = intent;
  }

  const existingMsgs = inMemoryMessages.get(conversationId) || [];
  existingMsgs.push(message);
  inMemoryMessages.set(conversationId, existingMsgs);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("ai_messages").insert({
        id,
        conversation_id: conversationId,
        role,
        content,
        intent,
        metadata,
        created_at: now,
      });

      await supabase
        .from("ai_conversations")
        .update({
          updated_at: now,
          last_intent: intent,
        })
        .eq("id", conversationId);
    } catch {
      // Keep in-memory
    }
  }

  return message;
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  inMemoryConversations.delete(conversationId);
  inMemoryMessages.delete(conversationId);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("ai_conversations").delete().eq("id", conversationId);
    } catch {
      // Ignore
    }
  }
  return true;
}
