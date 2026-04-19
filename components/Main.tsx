"use client"
import { useSession } from "next-auth/react"
import Login from "@/components/Login";
import JobTrackerHome from "@/components/JobTrackerHome";


export default function Main() {
  const { data: session } = useSession()
  return (
    <div>
      {(!session) ? <Login /> : <JobTrackerHome session={session} />}
    </div>
  );
}