import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        username?: string | null
        provider?: string | null
    }

    interface Session {
        user: {
            username?: string | null
        } & DefaultSession["user"]
    }
}