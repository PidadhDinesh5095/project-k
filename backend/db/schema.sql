-- ============================================================
-- Fresh & Pure (Dinesh Farms) — Customer API Schema (PostgreSQL)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ---------- Users ----------
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone               TEXT NOT NULL UNIQUE,
  first_name          TEXT,
  last_name           TEXT,
  email               TEXT,
  dob                 DATE,
  profile_completed   BOOLEAN NOT NULL DEFAULT false,
  default_address_id  UUID,
  device_tokens       TEXT[] NOT NULL DEFAULT '{}',   -- FCM tokens for push notifications
  refresh_token_hash  TEXT,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- OTP verification ----------
CREATE TABLE otp_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  otp_hash    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  verified    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otp_phone ON otp_verifications (phone, created_at DESC);
-- Expired rows are cleaned up by a small periodic DELETE (see utils/otpService.js) —
-- Postgres has no built-in TTL index like Mongo, so this is done explicitly.

-- ---------- Addresses ----------
CREATE TABLE addresses (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  residence_type         TEXT NOT NULL CHECK (residence_type IN ('COMMUNITY_APARTMENT','INDEPENDENT')),
  flat_no_apartment_floor TEXT NOT NULL,
  block_tower            TEXT,
  pincode                TEXT NOT NULL,
  landmark               TEXT,
  lat                    DOUBLE PRECISION NOT NULL,
  lng                    DOUBLE PRECISION NOT NULL,
  delivery_instructions  TEXT[] NOT NULL DEFAULT '{}',  -- subset of PET_AT_HOME, LEAVE_AT_DOOR, RING_BELL, PLACE_IN_BAG, AT_SHOE_RACK, AT_SECURITY
  is_default             BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user ON addresses (user_id);

ALTER TABLE users
  ADD CONSTRAINT fk_users_default_address FOREIGN KEY (default_address_id) REFERENCES addresses(id);

-- ---------- Products ----------
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,          -- "a2-buffalo-milk" — drives the order-ID abbreviation
  category       TEXT NOT NULL CHECK (category IN ('CURD','PANEER','GHEE','BUTTER','MILK','NON_DAIRY')),
  quantity_label TEXT NOT NULL,                 -- "500 ml"
  tags           TEXT[] NOT NULL DEFAULT '{}',  -- ["A2 Protein","Rich & Creamy"]
  description    TEXT,
  nutrition      JSONB,                          -- { proteinG, sodiumMg, calciumMg, energyKcal, totalFatG, carbohydrateG }
  quality_badges TEXT[] NOT NULL DEFAULT '{}',  -- ["Lab Tested","No Additives","Farm Fresh"]
  images         TEXT[] NOT NULL DEFAULT '{}',
  price          NUMERIC(10,2) NOT NULL,
  mrp            NUMERIC(10,2) NOT NULL,
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Order ID counters (atomic, daily-per-product) ----------
CREATE TABLE order_counters (
  counter_key TEXT PRIMARY KEY,   -- e.g. "CM20260912"
  seq         INTEGER NOT NULL DEFAULT 0
);

-- ---------- Orders (buy-once) ----------
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              TEXT NOT NULL UNIQUE,   -- "DF-CM20260912-098"
  user_id               UUID NOT NULL REFERENCES users(id),
  address_id            UUID NOT NULL REFERENCES addresses(id),
  product_id            UUID NOT NULL REFERENCES products(id),
  quantity              INTEGER NOT NULL DEFAULT 1,
  delivery_date         DATE NOT NULL,
  slot                  TEXT NOT NULL CHECK (slot IN ('MORNING','EVENING')),
  price_at_order        NUMERIC(10,2) NOT NULL,   -- snapshot, protects invoices from later price changes
  total_amount          NUMERIC(10,2) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'SCHEDULED'
                          CHECK (status IN ('SCHEDULED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')),
  wallet_transaction_id UUID,
  source                TEXT NOT NULL DEFAULT 'ONE_TIME' CHECK (source IN ('ONE_TIME','SUBSCRIPTION')),
  subscription_id       UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user_date ON orders (user_id, delivery_date DESC);

CREATE UNIQUE INDEX uq_orders_subscription_date_slot
  ON orders (subscription_id, delivery_date, slot)
  WHERE subscription_id IS NOT NULL;

-- ---------- Subscriptions (all three frequency types) ----------
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  address_id        UUID NOT NULL REFERENCES addresses(id),
  product_id        UUID NOT NULL REFERENCES products(id),
  frequency         TEXT NOT NULL CHECK (frequency IN ('DAILY','ALTERNATE','CUSTOM')),

-- in subscriptions table:
  daily_quantity    INTEGER,               -- used when frequency = DAILY
  daily_slot        TEXT DEFAULT 'MORNING' CHECK (daily_slot IN ('MORNING','EVENING')),
                                             -- Daily has no slot picker in the app (both shown disabled on
                                             -- that screen) — delivered every day on this single default slot.
  alternate_config  JSONB,                  -- { slots: ["EVENING"], startDateQuantity, succeedingDayQuantity }
  custom_config     JSONB,                  -- { slots: [...], selectedDays: ["MO","TU",...], quantityPerDay: {"MO":2,...} }

  start_date        DATE NOT NULL,
  end_date          DATE,                   -- null = runs until cancelled
  paused_ranges     JSONB NOT NULL DEFAULT '[]',  -- [{ startDate, endDate, reason }]
  skipped_dates     DATE[] NOT NULL DEFAULT '{}',

  status            TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELLED')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON subscriptions (user_id, status);

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);

-- ---------- Wallet (ledger-based — balance is always derived, never stored bare) ----------
CREATE TABLE wallet_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id),
  type           TEXT NOT NULL CHECK (type IN ('TOPUP','ORDER_DEBIT','REFUND','CASHBACK')),
  amount         NUMERIC(10,2) NOT NULL,     -- negative for debits, positive for credits
  balance_after  NUMERIC(10,2) NOT NULL,
  reference_id   TEXT,
  status         TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wallet_txn_user ON wallet_transactions (user_id, created_at DESC);

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_wallet_txn FOREIGN KEY (wallet_transaction_id) REFERENCES wallet_transactions(id);

-- ---------- Payment methods (gateway references only, never raw card/UPI data) ----------
CREATE TABLE payment_methods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  type              TEXT NOT NULL CHECK (type IN ('UPI','CARD')),
  razorpay_token_id TEXT NOT NULL,
  display_label     TEXT NOT NULL,     -- "UPI •••• 4321"
  is_default        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Notifications ----------
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  type          TEXT NOT NULL CHECK (type IN ('ORDER_CONFIRMED','ORDER_DELIVERED','SUBSCRIPTION_CREATED','WALLET_TOPUP','GENERAL')),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  read          BOOLEAN NOT NULL DEFAULT false,
  reference_id  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
