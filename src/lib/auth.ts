import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
        async jwt({ token, user, account }) {
            // Primer login: account y user están presentes
            if (account && user) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = account.expires_at! * 1000;
                token.user = user;
                token.uid = user.id; // UID explícito en el token

                // Leer memberships UNA SOLA VEZ, al momento del login
                try {
                    const membershipsRef = collection(db, 'users', user.id, 'memberships');
                    const snap = await getDocs(membershipsRef);
                    token.tenantIds = snap.docs.map(d => d.id);
                } catch {
                    token.tenantIds = [];
                }
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
            (session.user as any).tenantIds = (token.tenantIds as string[]) ?? [];
            (session.user as any).salonId = ((token.tenantIds as string[]) ?? [])[0] ?? null;
            session.accessToken = token.accessToken as string;
            session.error = token.error as string;

            // Guardar tokens de Google Calendar para usuarios con Google OAuth conectado
            if (token.refreshToken && (session.user as any).uid) {
                const tokenData = {
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    expiryDate: token.accessTokenExpires,
                    scope: token.scope,
                    tokenType: token.token_type,
                    updatedAt: Date.now()
                };
                const legacyRef = doc(db, 'calendarTokens', (session.user as any).uid);
                await setDoc(legacyRef, tokenData, { merge: true });
                const newRef = doc(db, 'users', (session.user as any).uid, 'integrations', 'google');
                await setDoc(newRef, tokenData, { merge: true });
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
