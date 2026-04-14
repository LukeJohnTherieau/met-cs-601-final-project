import {NextRequest, NextResponse} from 'next/server';
import getJobApplicationById from "@/lib/getJobApplicationById";
import {JobApplicationProps} from "@/types";


// Update the data everytime the page refreshes.
export const dynamic = "force-dynamic";


export async function GET(request:NextRequest): Promise<NextResponse>{
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (id) {
        const jobApplication:JobApplicationProps | null = await getJobApplicationById(id);
        if(!jobApplication){
            return NextResponse.json({error: "No records found"}, {status:500});

        } else {
            return NextResponse.json(jobApplication);

        }
    } else {
        return NextResponse.json({error: "No id provided"}, {status:500});

    }
}