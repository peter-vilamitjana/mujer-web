
'use server';

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const GOOGLE_AUTHORIZATION_URL =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
  });

async function refreshAccessToken(token: any) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at! * 1000;
        token.user = user;
        return token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;

      // Check if user has a salon associated
      const userRef = doc(db, 'users', session.user.id);
      // We need to fetch the user doc to see if they have a salonId
      // ideally we should do this in JWT callback to persist it in token
      // but for now let's just do it here or assume it's in token.user if we put it there.

      // Let's actually put it in the token in the jwt callback if strictly needed, 
      // but seeing as next-auth strategy is jwt, we can enrich the session here.

      // For now, let's keep the existing admin logic and add a placeholder for salonId
      // In a real app we'd fetch the user profile here or in jwt callback.
      // Check if user has a salon associated
      const userDocRef = doc(db, 'users', session.user.id);
      try {
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.salonId) {
            (session.user as any).salonId = userData.salonId;
          }
        }
      } catch (error) {
        console.error("Error fetching user salonId:", error);
      }

      // Save tokens to Firestore for admin
      if (session.user?.email === 'admin@mujer.com' && token.refreshToken) {
        const userDocRef = doc(db, 'calendarTokens', session.user.id);
        await setDoc(userDocRef, {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiryDate: token.accessTokenExpires,
          scope: token.scope,
          tokenType: token.token_type,
        }, { merge: true });
      }

      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (user.email === 'admin@mujer.com') {
          return true; // Allow admin to sign in
        }
      }
      return false; // Block other users
    },
  },
});

export { handler as GET, handler as POST };
