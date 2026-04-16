"use server";


import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import { JobApplicationProps, SubmissionStatusProps } from "@/types";
import { ObjectId } from 'mongodb';


export default async function updateJobApplication(jobApplication: JobApplicationProps): Promise<SubmissionStatusProps> {
  const id = jobApplication._id
  delete jobApplication._id;
  if (id) {
    console.log(jobApplication);
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const res = await jobApplicationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: jobApplication }
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
