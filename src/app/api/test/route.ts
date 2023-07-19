import { NextResponse } from 'next/server';

export const runtime = "edge";

export async function GET(req: Request) {
  return NextResponse.json(
    { description: 'searchDescription' },
    {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
    },
  );
}
