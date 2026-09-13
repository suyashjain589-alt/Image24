-- Store Razorpay's hosted checkout URL so abandoned/pending checkouts can be safely resumed.
ALTER TABLE subscriptions ADD COLUMN checkout_url TEXT;
