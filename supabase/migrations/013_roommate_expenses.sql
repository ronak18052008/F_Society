-- Migration: 013_roommate_expenses.sql
-- Description: Smart Roommate Expense Engine tables (expenses, participants, settlements)

-- 1. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL CHECK (
        category IN ('RENT', 'ELECTRICITY', 'WATER', 'INTERNET', 'MAINTENANCE', 'GROCERIES', 'UTILITIES', 'OTHER')
    ),
    split_method TEXT NOT NULL CHECK (
        split_method IN ('EQUAL', 'PERCENTAGE', 'CUSTOM', 'USAGE_BASED')
    ),
    paid_by TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_settled BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_household_id ON public.expenses(household_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses(paid_by);

-- 2. Expense Participants Table
CREATE TABLE IF NOT EXISTS public.expense_participants (
    id TEXT PRIMARY KEY,
    expense_id TEXT NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT,
    share_amount NUMERIC(12, 2) NOT NULL CHECK (share_amount >= 0),
    percentage NUMERIC(6, 2) CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
    usage_units NUMERIC(10, 2) CHECK (usage_units IS NULL OR usage_units >= 0),
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_expense_participants_expense_id ON public.expense_participants(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_participants_user_id ON public.expense_participants(user_id);

-- 3. Settlements Table
CREATE TABLE IF NOT EXISTS public.settlements (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL,
    expense_id TEXT REFERENCES public.expenses(id) ON DELETE SET NULL,
    payer_id TEXT NOT NULL,
    payee_id TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    settled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reference_note TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlements_household_id ON public.settlements(household_id);
CREATE INDEX IF NOT EXISTS idx_settlements_expense_id ON public.settlements(expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_payer_id ON public.settlements(payer_id);
CREATE INDEX IF NOT EXISTS idx_settlements_payee_id ON public.settlements(payee_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_settlements_idempotency ON public.settlements(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for verified tenancy workspaces in current demo setup
CREATE POLICY "expenses_select" ON public.expenses FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE TO authenticated, anon USING (true);

CREATE POLICY "expense_participants_select" ON public.expense_participants FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "expense_participants_insert" ON public.expense_participants FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "expense_participants_update" ON public.expense_participants FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "expense_participants_delete" ON public.expense_participants FOR DELETE TO authenticated, anon USING (true);

CREATE POLICY "settlements_select" ON public.settlements FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "settlements_insert" ON public.settlements FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "settlements_update" ON public.settlements FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
