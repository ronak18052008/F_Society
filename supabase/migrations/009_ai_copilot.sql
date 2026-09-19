-- 009_ai_copilot.sql
-- NESTORA Feature 1: AI Rental Copilot Conversation and Message Persistence

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'New Consultation',
  last_intent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  intent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for lightning fast conversation retrieval
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at ASC);

-- Row Level Security (RLS)
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to access their own conversations or public demo conversations
CREATE POLICY "Users can access their own AI conversations"
  ON public.ai_conversations
  FOR ALL
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

-- Allow users to access messages of their conversations
CREATE POLICY "Users can access AI messages"
  ON public.ai_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE public.ai_conversations.id = public.ai_messages.conversation_id
      AND (public.ai_conversations.user_id = auth.uid() OR public.ai_conversations.user_id IS NULL)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE public.ai_conversations.id = public.ai_messages.conversation_id
      AND (public.ai_conversations.user_id = auth.uid() OR public.ai_conversations.user_id IS NULL)
    )
  );
