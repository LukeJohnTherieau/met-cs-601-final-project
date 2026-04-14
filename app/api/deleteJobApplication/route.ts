import {NextResponse} from "next/server";
import deleteJobApplication from "@/lib/deleteJobApplication";
import { JobApplicationProps } from "@/types";
import {ObjectId} from "mongodb";

// // Update the data everytime the page refreshes.
// export const dynamic = "force-dynamic";


export async function DELETE(request:Request): Promise<NextResponse>{
    const jobApplication: JobApplicationProps = await request.json();
    jobApplication["_id"] = new ObjectId(jobApplication["_id"]);
    const submissionStatus = await deleteJobApplication(jobApplication);
    if(!submissionStatus.successfulSubmission){
        return NextResponse.json({error: submissionStatus.message}, {status:500});
    }

    return NextResponse.json(submissionStatus.message);
}