import { SignedDelegate } from '@near-js/transactions';
import { deserialize } from 'borsh';
import { NextResponse } from 'next/server';

import { submitTransaction } from '@/mb-ai-bos/utils/near/meta-transactions';
import { SCHEMA } from '@/mb-ai-bos/utils/near/types/schema';

export async function POST(req: Request) {
  const body = await req.json();

  const deserializeDelegate = deserialize(SCHEMA, SignedDelegate, Buffer.from(new Uint8Array(body)));

  const result = await submitTransaction({
    delegate: deserializeDelegate,
    network: process.env.NEXT_PUBLIC_NETWORK_ID as string,
  });

  return NextResponse.json(
    { result },
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}
