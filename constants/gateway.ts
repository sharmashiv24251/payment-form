export const FAILURE_REASONS = [
  "Insufficient funds",
  "Card declined",
  "Transaction limit exceeded",
  "Invalid card details",
] as const;

export const GATEWAY_TIMEOUT_MS = 8_000;
export const GATEWAY_TIMEOUT_PROBABILITY = 0.15;
export const GATEWAY_FAILURE_PROBABILITY = 0.40;

export const GATEWAY_BASE_DELAY_MIN_MS = 1_500;
export const GATEWAY_BASE_DELAY_MAX_MS = 3_000;
