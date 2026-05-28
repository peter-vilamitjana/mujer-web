import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.uid as string | undefined;

  if (!session || !userId) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const snap = await adminDb.doc(`users/${userId}/integrations/google`).get();
  if (snap.exists && snap.data()?.accessToken) {
    return NextResponse.json({ connected: true });
  }

  // Fallback: legacy path
  const legacySnap = await adminDb.doc(`calendarTokens/${userId}`).get();
  const connected = legacySnap.exists && !!legacySnap.data()?.accessToken;
  return NextResponse.json({ connected });
}
