"use server";


import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import { JobApplicationProps, SubmissionStatusProps } from "@/types";


export default async function createJobApplication(jobApplication: JobApplicationProps): Promise<SubmissionStatusProps> {
  const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
  const res = await jobApplicationCollection.insertOne(jobApplication);
  if (!res.acknowledged) {
    return {
      "successfulSubmission": false,
      "message": "Something went wrong. Please try again later."
    };
  } else {
    return {
      "successfulSubmission": true,
      "message": "Job Application has been saved successfully!"
    };
  }
}
