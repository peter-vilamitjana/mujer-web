import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const snap = await getDoc(
    doc(db, 'users', session.user.id, 'integrations', 'google'),
  );

  if (snap.exists() && snap.data()?.accessToken) {
    return NextResponse.json({ connected: true });
  }

  // Fallback: legacy path
  const legacySnap = await getDoc(doc(db, 'calendarTokens', session.user.id));
  const connected = legacySnap.exists() && !!legacySnap.data()?.accessToken;
  return NextResponse.json({ connected });
}
