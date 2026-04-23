import { NextRequest, NextResponse } from 'next/server';
import createJobApplication from "@/lib/createJobApplication";
import getJobApplications from "@/lib/getJobApplications";
import getJobApplicationById from "@/lib/getJobApplicationById";
import getJobApplicationsByDateRange from "@/lib/getJobApplicationsByDateRange";
import updateJobApplication from "@/lib/updateJobApplication";
import deleteJobApplication from "@/lib/deleteJobApplication";
import { JobApplicationProps } from "@/types";
import { auth } from "@/auth";

// Update the data everytime the page refreshes.
export const dynamic = "force-dynamic";


export async function POST(request: Request): Promise<NextResponse> {
    const session = await auth();
    if (session) {
        const jobApplication: JobApplicationProps = await request.json();
        if (jobApplication && jobApplication.user.email == session.user.email && jobApplication.user.provider == session.user.provider) {
            jobApplication["dateApplied"] = new Date(jobApplication["dateApplied"]);
            const submissionStatus = await createJobApplication(jobApplication);
            if (!submissionStatus.successfulSubmission) {
                return NextResponse.json({ error: submissionStatus.message }, { status: 500 });
            }
            return NextResponse.json(submissionStatus.message);
        } else {
            return NextResponse.json({ error: `Not a valid action for ${session.user.email} (${session.user.provider})` }, { status: 403 });
        }
    } else {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const searchParams = request.nextUrl.searchParams;
    // const email = searchParams.get("email");
    // const provider = searchParams.get("provider");
    const id = searchParams.get("id");
    const startDateApplied = searchParams.get("startDateApplied");
    const endDateApplied = searchParams.get("endDateApplied");
    const session = await auth();
    if (session) {
        if (id) {
            const jobApplication: JobApplicationProps | null = await getJobApplicationById(id);
            if (!jobApplication) {
                return NextResponse.json([], { status: 200 });

            } else {
                return NextResponse.json([jobApplication]);

            }

        } else if (session.user.email && session.user.provider && startDateApplied && endDateApplied) {
            const jobApplications: JobApplicationProps[] | null = await getJobApplicationsByDateRange(
                session.user.email,
                session.user.provider,
                new Date(startDateApplied),
                new Date(endDateApplied)
            );
            if (!jobApplications) {
                return NextResponse.json([], { status: 200 });

            } else {
                return NextResponse.json(jobApplications);

            }

        } else if (session.user.email && session.user.provider) {
            const jobApplications: JobApplicationProps[] | null = await getJobApplications(session.user.email, session.user.provider);
            if (!jobApplications) {
                return NextResponse.json([], { status: 200 });

            } else {
                return NextResponse.json(jobApplications);

            }
        } else {
            return NextResponse.json({ error: "No userId and provider provided" }, { status: 500 });
        }
    } else {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}

export async function PUT(request: Request): Promise<NextResponse> {
    const jobApplication: JobApplicationProps = await request.json();
    const submissionStatus = await updateJobApplication(jobApplication);
    const session = await auth();
    if (session) {
        if (jobApplication && jobApplication.user.email == session.user.email && jobApplication.user.provider == session.user.provider) {
            if (!submissionStatus.successfulSubmission) {
                return NextResponse.json({ error: submissionStatus.message }, { status: 500 });
            }
            return NextResponse.json(submissionStatus.message);
        } else {
            return NextResponse.json({ error: `Not a valid action for ${session.user.email} (${session.user.provider})` }, { status: 403 });
        }
    } else {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
    const response: { "id": string } = await request.json();
    const session = await auth();
    if (session) {
        if (response["id"]) {
            const jobApplication: JobApplicationProps | null = await getJobApplicationById(response["id"]);
            if (jobApplication && jobApplication.user.email == session.user.email && jobApplication.user.provider == session.user.provider) {
                const submissionStatus = await deleteJobApplication(response["id"]);
                if (!submissionStatus.successfulSubmission) {
                    return NextResponse.json({ error: submissionStatus.message }, { status: 500 });
                }
                return NextResponse.json(submissionStatus.message);
            } else {
                return NextResponse.json({ error: `Not a valid action for ${session.user.email} (${session.user.provider})` }, { status: 403 });
            }

        } else {
            return NextResponse.json({ error: "No id provided" }, { status: 500 });

        }
    } else {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
}