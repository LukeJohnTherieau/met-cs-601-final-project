import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";


export const { handlers, auth, signIn, signOut } = NextAuth(
    {
        providers: [
            GitHubProvider(
                {
                    clientId: process.env.AUTH_GITHUB_ID ?? "",
                    clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
                    profile(profile) {
                        return {
                            id: profile.id.toString(),
                            name: profile.name ?? profile.login,
                            email: profile.email,
                            image: profile.avatar_url,
                            username: profile.login,
                        }
                    }
                }
            ),
            GoogleProvider(
                {
                    clientId: process.env.AUTH_GOOGLE_ID ?? "",
                    clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
                    profile(profile) {
                        return {
                            id: profile.id,
                            name: profile.name ?? profile.login,
                            email: profile.email,
                            image: profile.avatar_url,
                            username: profile.login,
                        }
                    },
                    checks: ["pkce"]
                }
            )
        ],
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
            async jwt({ token, user, account }) {
                if (user) {
                    token.username = user.username;
                }
                if (account) {
                    token.provider = account.provider;
                }
                return token;
            },
            async session({ session, token}) {
                if (session.user) {
                    session.user.username = token.username as string;
                    session.user.id = token.sub as string;
                    session.user.provider = token.provider as string;
                }
                return session;
            }
        }
    }
)