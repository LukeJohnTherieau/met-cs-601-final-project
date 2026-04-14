import {NextResponse} from "next/server";
import createJobApplication from "@/lib/createJobApplication";
import { JobApplicationProps } from "@/types";

// // Update the data everytime the page refreshes.
// export const dynamic = "force-dynamic";


export async function POST(request:Request): Promise<NextResponse>{
    const jobApplication: JobApplicationProps = await request.json();
    jobApplication["dateApplied"] = new Date(jobApplication["dateApplied"]);
    const submissionStatus = await createJobApplication(jobApplication);

    if(!submissionStatus.successfulSubmission){
        return NextResponse.json({error: submissionStatus.message}, {status:500});
    }

    return NextResponse.json(submissionStatus.message);
}