import { env } from '@/shared/config/env';

/**
 * Midtrans Snap thin wrapper.
 *
 * NOTE: This is a minimal façade meant to be expanded with full transaction lifecycle
 * (Snap token creation, callback verification, refund). The interface is stable so
 * server actions can already start calling `createSnapTransaction(...)` once keys
 * are configured. See `.env.example` for the variables required.
 */
export interface SnapTransactionInput {
  orderId: string;
  amount: number;
  customer: { firstName: string; email?: string; phone?: string };
}

export interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
}

const MIDTRANS_SNAP_BASE = (production: boolean) =>
  production ? 'https://app.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1';

export async function createSnapTransaction(
  input: SnapTransactionInput,
): Promise<SnapTransactionResult> {
  if (!env.MIDTRANS_SERVER_KEY) {
    throw new Error('Midtrans server key not configured (set MIDTRANS_SERVER_KEY).');
  }
  const auth = Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString('base64');
  const res = await fetch(`${MIDTRANS_SNAP_BASE(env.MIDTRANS_IS_PRODUCTION)}/transactions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderId, gross_amount: input.amount },
      customer_details: {
        first_name: input.customer.firstName,
        email: input.customer.email,
        phone: input.customer.phone,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Midtrans error ${res.status}: ${text}`);
  }
  return (await res.json()) as SnapTransactionResult;
}
