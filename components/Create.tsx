import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { JobApplicationProps } from "@/types";


async function sendRequest(url: string, { arg }:{ arg:JobApplicationProps }) {
    return fetch(
        url, {
        method: "POST",
        body: JSON.stringify(arg)
    }).then(res => res.json())
}


export default function Create() {
    const [title, setTitle] = useState("");
    const [dateApplied, setDateApplied] = useState(new Date());
    const [startingPay, setStartingPay] = useState(0);
    const { trigger, isMutating } = useSWRMutation("/api/job-applications", sendRequest)


    return (
        <div>
            <h1>Create Job Application</h1>
            <label>Position Title</label>
            <input
                value={title}
                type="text"
                onChange={(e) => setTitle(e.target.value)}
            />
            <br></br>
            <label>Date Applied</label>
            <input
                value={dateApplied.toISOString().split('T')[0]}
                type="date"
                onChange={(e) => setDateApplied(new Date(e.target.value))}
            />
            <br></br>
            <label>Starting Pay</label>
            <input
                value={startingPay}
                type="number"
                onChange={(e) => setStartingPay(Number(e.target.value))}
            />
            <br></br>
            <button
                disabled={isMutating}
                onClick={async () => {
                    try {
                        if (title && dateApplied && startingPay) {
                            await trigger(
                                {
                                    "title": title,
                                    "dateApplied": dateApplied,
                                    "status": "applied",
                                    "applicationURL": "https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4397620498",
                                    "positionType": "Full-time",
                                    "startingPay": startingPay,
                                    "endingPay": 174000,
                                    "company": {
                                        "name": "Klaviyo",
                                        "location": "Boston, MA",
                                        "industries": [
                                            "Marketing Services"
                                        ],
                                        "companyURL": "https://www.klaviyo.com"
                                    }
                                }
                            )
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }}
            >
                Create Job Application
            </button>
        </div>
    );
}