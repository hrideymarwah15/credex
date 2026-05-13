-- Referral codes table
create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by_email text,
  created_by_audit_id uuid references audits(id),
  uses integer default 0,
  created_at timestamp with time zone default now(),

  -- Track conversions
  referred_audits integer default 0,
  referred_leads integer default 0
);

-- Track which audits came from referrals
alter table audits add column if not exists referral_code text references referral_codes(code);

-- Index for fast lookups
create index if not exists idx_referral_codes_code on referral_codes(code);
create index if not exists idx_audits_referral_code on audits(referral_code);

-- RLS policies
alter table referral_codes enable row level security;

create policy "Referral codes are publicly readable"
  on referral_codes for select
  using (true);

create policy "Anyone can create referral codes"
  on referral_codes for insert
  with check (true);

create policy "System can update referral codes"
  on referral_codes for update
  using (true);
