import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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

export const authOptions: NextAuthOptions = {
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

            // Check if user has a salon associated (Legacy logic kept for compatibility)
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

            // Save tokens to Firestore for admin (and potential future roles)
            // Phase 2: Dual Write Strategy
            if (session.user?.email === 'admin@mujer.com' && token.refreshToken) {
                const tokenData = {
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    expiryDate: token.accessTokenExpires,
                    scope: token.scope,
                    tokenType: token.token_type,
                    updatedAt: Date.now()
                };

                // 1. Write to Legacy (calendarTokens/{uid}) - Keep for Webhook backward compat
                const legacyRef = doc(db, 'calendarTokens', session.user.id);
                await setDoc(legacyRef, tokenData, { merge: true });

                // 2. Write to New (users/{uid}/integrations/google) - Private & Scoped
                const newRef = doc(db, 'users', session.user.id, 'integrations', 'google');
                await setDoc(newRef, tokenData, { merge: true });
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
};
