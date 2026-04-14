"use server";


import getCollection, {JOB_APPLICATION_COLLECTION} from "@/db";
import {JobApplicationProps, SubmissionStatusProps} from "@/types";


export default async function updateJobApplication(jobApplication: JobApplicationProps): Promise<SubmissionStatusProps> {
  if (jobApplication._id) {
    console.log(jobApplication);
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const res = await jobApplicationCollection.updateOne(
      {
        _id: jobApplication._id
      },
      {
        $set: jobApplication
      }, 
      {
        upsert: false
      } 
    );
    if (!res.acknowledged) {
      return {
        "successfulSubmission": false,
        "message": "Something went wrong. Please try again later."
      };
    } else {
      return {
        "successfulSubmission": true,
        "message": "Job Application has been updated successfully!"
      };
    }
  } else {
    return {
      "successfulSubmission": false,
      "message": "id field is missing for jobApplication"
    }
  }
}
