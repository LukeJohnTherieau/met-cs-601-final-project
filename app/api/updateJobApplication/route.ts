import {NextResponse} from "next/server";
import updateJobApplication from "@/lib/updateJobApplication";
import {JobApplicationProps} from "@/types";
import {ObjectId} from "mongodb";


export async function PUT(request:Request): Promise<NextResponse>{
    const jobApplication: JobApplicationProps = await request.json();
    jobApplication["_id"] = new ObjectId(jobApplication["_id"]);
    const submissionStatus = await updateJobApplication(jobApplication);

    if(!submissionStatus.successfulSubmission){
        return NextResponse.json({error: submissionStatus.message}, {status:500});
    }

    return NextResponse.json(submissionStatus.message);
}