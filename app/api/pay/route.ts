import type { PaymentPayload, GatewayResponse } from "@/types";
import {
  FAILURE_REASONS,
  GATEWAY_BASE_DELAY_MAX_MS,
  GATEWAY_BASE_DELAY_MIN_MS,
  GATEWAY_FAILURE_PROBABILITY,
  GATEWAY_TIMEOUT_MS,
  GATEWAY_TIMEOUT_PROBABILITY,
} from "@/constants/gateway";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBaseDelay(): number {
  return Math.floor(Math.random() * (GATEWAY_BASE_DELAY_MAX_MS - GATEWAY_BASE_DELAY_MIN_MS + 1)) + GATEWAY_BASE_DELAY_MIN_MS;
}

export async function POST(request: Request): Promise<Response> {
  const body: PaymentPayload = await request.json();

  if (!body.transactionId || !body.cardNumber || !body.amount) {
    return Response.json(
      { outcome: "failed", reason: "Invalid payment payload" } satisfies GatewayResponse,
      { status: 400 }
    );
  }

  const roll = Math.random();

  if (roll < GATEWAY_TIMEOUT_PROBABILITY) {
    await sleep(GATEWAY_TIMEOUT_MS);
    const response: GatewayResponse = { outcome: "timeout" };
    return Response.json(response);
  }

  if (roll < GATEWAY_FAILURE_PROBABILITY) {
    await sleep(randomBaseDelay());
    const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    const response: GatewayResponse = { outcome: "failed", reason };
    return Response.json(response, { status: 402 });
  }

  await sleep(randomBaseDelay());
  const response: GatewayResponse = { outcome: "success" };
  return Response.json(response);
}
