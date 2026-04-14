import {NextResponse} from "next/server";
import getJobApplications from "@/lib/getJobApplications";
import { JobApplicationProps } from "@/types";

// Update the data everytime the page refreshes.
export const dynamic = "force-dynamic";


export async function GET(request:Request): Promise<NextResponse>{
    const jobApplications:JobApplicationProps[] | null = await getJobApplications();
    if(!jobApplications){
        return NextResponse.json({error: "No records found"}, {status:500});

    } else {
        return NextResponse.json(jobApplications);

    }
}