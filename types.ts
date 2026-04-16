import {ObjectId} from "mongodb";


export type JobApplicationProps = {
    _id?: string | ObjectId;
    title: string;
    dateApplied: Date;
    status: string;
    applicationURL: string;
    positionType: string;
    startingPay: number;
    endingPay: number;
    company: {
        name: string;
        industries: string[];
        location: string;
        companyURL: string;
    };
};


export type SubmissionStatusProps = {
    successfulSubmission: boolean;
    message: string;
};