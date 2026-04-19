"use server";

import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import { JobApplicationProps } from "@/types";

export default async function getJobApplicationsByDateRange(email: string, provider: string, startDateApplied:Date, endDateApplied:Date):Promise<JobApplicationProps[] | null>{
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const jobApplications = await jobApplicationCollection.find(
        {
            "user.email" : email,
            "user.provider" : provider,
            dateApplied:{
                "$gte": startDateApplied,
                "$lte" : endDateApplied
            }
        }
    ).toArray();
    return jobApplications;    
}