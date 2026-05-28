import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { auth } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FieldValue } from 'firebase-admin/firestore';

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
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    const userCredential = await signInWithEmailAndPassword(
                        auth,
                        credentials.email,
                        credentials.password
                    );
                    const firebaseUser = userCredential.user;
                    return {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        image: firebaseUser.photoURL,
                    };
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user, account, trigger }) {
            // session.update() — re-fetch memberships from Firestore (Admin SDK)
            if (trigger === 'update' && token.uid) {
                try {
                    const snap = await adminDb
                        .collection('users').doc(token.uid as string)
                        .collection('memberships').get();
                    token.tenantIds = snap.docs.map(d => d.id);
                    token.role = snap.docs.length === 0 ? 'customer' : 'staff';
                    if (snap.docs.length > 0) {
                        const tenantSnap = await adminDb.collection('tenants').doc(snap.docs[0].id).get();
                        if (tenantSnap.exists) token.salonSlug = tenantSnap.data()!.slug;
                    }
                } catch (err) {
                    console.error('[auth] session.update memberships refresh failed:', err);
                }
                return token;
            }

            // Primer login: account y user están presentes
            if (account && user) {
                token.provider = account.provider; // para evitar refresh en Credentials
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = (account.expires_at || 0) * 1000;
                token.user = user;
                token.uid = user.id; // UID explícito en el token

                // Leer memberships + phone UNA SOLA VEZ, al momento del login (Admin SDK)
                try {
                    const snap = await adminDb
                        .collection('users').doc(user.id)
                        .collection('memberships').get();
                    token.tenantIds = snap.docs.map(d => d.id);

                    // Rol según memberships: sin salón → customer B2C, con salón → staff
                    token.role = snap.docs.length === 0 ? 'customer' : 'staff';

                    if (snap.docs.length > 0) {
                        const firstTenantId = snap.docs[0].id;
                        const tenantSnap = await adminDb.collection('tenants').doc(firstTenantId).get();
                        if (tenantSnap.exists) {
                            token.salonSlug = tenantSnap.data()!.slug;
                        }
                    }
                } catch (err) {
                    console.error('Error fetching memberships or tenant slug:', err);
                    token.tenantIds = [];
                    token.role = 'customer';
                }

                try {
                    const userSnap = await adminDb.collection('users').doc(user.id).get();
                    const phone = userSnap.data()?.phone;
                    if (phone) token.phone = phone;
                } catch {
                    // phone es opcional, no fallar
                }

                return token;
            }

            // Credentials users have no OAuth token — skip refresh entirely
            if (token.provider === 'credentials' || !token.refreshToken) {
                return token;
            }

            // Token aún vigente: devolver sin tocar Firestore
            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            // Token expirado: refrescar (lógica existente, no cambiar)
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.user = token.user as any;
            (session.user as any).uid = token.uid;
            (session.user as any).role = token.role;
            (session.user as any).tenantIds = (token.tenantIds as string[]) ?? [];
            (session.user as any).salonId = ((token.tenantIds as string[]) ?? [])[0] ?? null;
            (session.user as any).salonSlug = token.salonSlug || null;
            (session.user as any).role = token.role ?? 'customer';
            if (token.phone) (session.user as any).phone = token.phone;
            session.accessToken = token.accessToken as string;
            session.error = token.error as string;

            // Persistir tokens de Google Calendar (best-effort — Admin SDK, nunca bloquear la sesión)
            if (token.refreshToken && (session.user as any).uid) {
                const uid = (session.user as any).uid as string;
                try {
                    const tokenData = {
                        accessToken: token.accessToken ?? null,
                        refreshToken: token.refreshToken,
                        expiryDate: token.accessTokenExpires ?? null,
                        updatedAt: FieldValue.serverTimestamp(),
                    };
                    await Promise.all([
                        adminDb.collection('calendarTokens').doc(uid).set(tokenData, { merge: true }),
                        adminDb.collection('users').doc(uid)
                            .collection('integrations').doc('google').set(tokenData, { merge: true }),
                    ]);
                } catch (e) {
                    console.warn('[auth] Google token persist failed:', (e as Error)?.message);
                }
            }

            return session;
        },
        async signIn({ account }) {
            if (account?.provider === "google" || account?.provider === "credentials") {
                return true; // Todos pueden autenticarse. Los roles se manejan con Memberships.
            }
            return false;
        },
    },
};
