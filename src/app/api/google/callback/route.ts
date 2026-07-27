import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state') ?? '';
  const error = searchParams.get('error');

  const [userId, tenantSlug] = state.split('__');
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/${tenantSlug}/dashboard`;

  if (error || !code || !userId) {
    return NextResponse.redirect(`${dashboardUrl}?gcal=error`);
  }

  const redirectUri = `${baseUrl}/api/google/callback`;

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    );

    const { tokens } = await oauth2Client.getToken(code);

    const tokenData = {
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate:   tokens.expiry_date,
      scope:        tokens.scope,
      tokenType:    tokens.token_type,
      updatedAt:    FieldValue.serverTimestamp(),
    };

    await Promise.all([
      adminDb.doc(`users/${userId}/integrations/google`).set(tokenData, { merge: true }),
      adminDb.doc(`calendarTokens/${userId}`).set(tokenData, { merge: true }),
    ]);

    // Bootstrap webhook (best-effort — don't block redirect on failure)
    try {
      await fetch(`${baseUrl}/api/google/sync/bootstrap`, { method: 'POST' });
    } catch { /* ignore */ }

    return NextResponse.redirect(`${dashboardUrl}?gcal=connected`);
  } catch (err) {
    console.error('[google/callback]', err);
    return NextResponse.redirect(`${dashboardUrl}?gcal=error`);
  }
}
