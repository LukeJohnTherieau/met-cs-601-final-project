"use server";


import getCollection, { JOB_APPLICATION_COLLECTION } from "@/db";
import {SubmissionStatusProps} from "@/types";
import {ObjectId} from "mongodb";

export default async function deleteJobApplication(id: string): Promise<SubmissionStatusProps> {
  if (id) {
    const jobApplicationCollection = await getCollection(JOB_APPLICATION_COLLECTION);
    const res = await jobApplicationCollection.deleteOne({_id: new ObjectId(id)});
    if (!res.acknowledged) {
      return {
        "successfulSubmission": false,
        "message": "Something went wrong. Please try again later."
      };
    } else {
      return {
        "successfulSubmission": true,
        "message": "Job Application has been deleted successfully!"
      };
    }
  } else {
    return {
      "successfulSubmission": false,
      "message": "id field is missing for jobApplication"
    }
  }
}