"use client"
import { signIn } from "next-auth/react"
import Image from 'next/image'


export default function Login() {
  return (
    <div>
      <div>
        <div>
          <h1>JobTracker</h1>
          <p>Sign in with your preferred credential provider</p>
        </div>
        <br></br>
        <div>
          <button onClick={() => signIn("github")}>
            <Image
              src="/GitHub_Invertocat_Logo.svg.png"
              width={75}
              height={75}
              alt={`GitHub Logo`}
            />
            Sign in with GitHub
          </button>
          <button onClick={() => signIn("google")}>
            <Image
              src="/Google__G__logo.svg.webp"
              width={75}
              height={75}
              alt={`Google Logo`}
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}