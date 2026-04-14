import { NextRequest, NextResponse } from 'next/server';
import getJobApplicationsByDateRange from "@/lib/getJobApplicationsByDateRange";
import {JobApplicationProps} from "@/types";


// Update the data everytime the page refreshes.
export const dynamic = "force-dynamic";


export async function GET(request:NextRequest): Promise<NextResponse>{
    const searchParams = request.nextUrl.searchParams;
    const startDateApplied = searchParams.get("startDateApplied");
    const endDateApplied = searchParams.get("endDateApplied");
    if (startDateApplied && endDateApplied) {
        const jobApplications:JobApplicationProps[] | null = await getJobApplicationsByDateRange(
            new Date(startDateApplied),
            new Date(endDateApplied)
        );
        if(!jobApplications){
            return NextResponse.json({error: "No records found"}, {status:500});

        } else {
            return NextResponse.json(jobApplications);

        }
    } else {
        return NextResponse.json({error: "No startDateApplied or endDateApplied provided"}, {status:500});
    }
}