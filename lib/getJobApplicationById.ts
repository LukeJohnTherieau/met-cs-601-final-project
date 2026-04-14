"use server";


import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import { JobApplicationProps } from "@/types";
import {ObjectId} from "mongodb";


export default async function getJobApplicationById(id:string):Promise<JobApplicationProps | null>{
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const jobApplication = await jobApplicationCollection.findOne({_id: new ObjectId(id)});
    return jobApplication;    
}