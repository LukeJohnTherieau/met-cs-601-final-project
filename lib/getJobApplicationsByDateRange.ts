"use server";

import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import { JobApplicationProps } from "@/types";

export default async function getJobApplicationsByDateRange(startDateApplied:Date, endDateApplied:Date):Promise<JobApplicationProps[] | null>{
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const jobApplications = await jobApplicationCollection.find(
        {
            dateApplied:{
                "$gte": startDateApplied,
                "$lte" : endDateApplied
            }
        }
    ).toArray();
    return jobApplications;    
}