import {NextRequest, NextResponse} from 'next/server';
import deleteJobApplication from "@/lib/deleteJobApplication";


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