import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import { JobApplicationProps } from "@/types";

export default async function getJobApplications():Promise<JobApplicationProps[] | null>{
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const jobApplications = await jobApplicationCollection.find({}).toArray();
    return jobApplications;    
}