import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import { JobApplicationProps } from "@/types";

export default async function getJobApplications(email: string, provider: string): Promise<JobApplicationProps[] | null> {
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const jobApplications = await jobApplicationCollection.find(
        {
            "user.email" : email,
            "user.provider" : provider
        }
    ).toArray();
return jobApplications;    
}