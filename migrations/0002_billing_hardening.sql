-- IMAGE 24 billing hardening
CREATE TABLE IF NOT EXISTS billing_checkout_locks (
  user_id TEXT PRIMARY KEY,
  locked_until INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_billing_checkout_locks_expiry ON billing_checkout_locks(locked_until);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('free','pro')),
  cancel_at_cycle_end INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id, updated_at DESC);
