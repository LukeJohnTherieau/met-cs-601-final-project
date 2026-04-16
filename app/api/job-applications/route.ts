import {NextRequest, NextResponse} from 'next/server';
import createJobApplication from "@/lib/createJobApplication";
import getJobApplications from "@/lib/getJobApplications";
import getJobApplicationById from "@/lib/getJobApplicationById";
import getJobApplicationsByDateRange from "@/lib/getJobApplicationsByDateRange";
import updateJobApplication from "@/lib/updateJobApplication";
import deleteJobApplication from "@/lib/deleteJobApplication";
import {JobApplicationProps} from "@/types";

// Update the data everytime the page refreshes.
export const dynamic = "force-dynamic";


export async function POST(request:Request): Promise<NextResponse>{
    const jobApplication: JobApplicationProps = await request.json();
    jobApplication["dateApplied"] = new Date(jobApplication["dateApplied"]);
    const submissionStatus = await createJobApplication(jobApplication);

    if(!submissionStatus.successfulSubmission){
        return NextResponse.json({error: submissionStatus.message}, {status:500});
    }

    return NextResponse.json(submissionStatus.message);
}


export async function GET(request:NextRequest): Promise<NextResponse>{
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const startDateApplied = searchParams.get("startDateApplied");
    const endDateApplied = searchParams.get("endDateApplied");
    if (id) {
        const jobApplication:JobApplicationProps | null = await getJobApplicationById(id);
        if(!jobApplication){
            return NextResponse.json([], {status:200});

        } else {
            return NextResponse.json([jobApplication]);

        }
        
    } else if (startDateApplied && endDateApplied) {
        const jobApplications:JobApplicationProps[] | null = await getJobApplicationsByDateRange(
            new Date(startDateApplied),
            new Date(endDateApplied)
        );
        if(!jobApplications){
            return NextResponse.json([], {status:200});

        } else {
            return NextResponse.json(jobApplications);

        }

    } else {
        const jobApplications:JobApplicationProps[] | null = await getJobApplications();
        if(!jobApplications){
            return NextResponse.json([], {status:200});

        } else {
            return NextResponse.json(jobApplications);

        }
    }
}


export async function PUT(request:Request): Promise<NextResponse>{
    const jobApplication: JobApplicationProps = await request.json();
    const submissionStatus = await updateJobApplication(jobApplication);

    if(!submissionStatus.successfulSubmission){
        return NextResponse.json({error: submissionStatus.message}, {status:500});
    }

    return NextResponse.json(submissionStatus.message);
}


export async function DELETE(request:NextRequest): Promise<NextResponse>{
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (id) {
        const submissionStatus = await deleteJobApplication(id);
        if(!submissionStatus.successfulSubmission){
            return NextResponse.json({error: submissionStatus.message}, {status:500});
        }

        return NextResponse.json(submissionStatus.message);

    } else {
        return NextResponse.json({error: "No id provided"}, {status:500});

    }
}