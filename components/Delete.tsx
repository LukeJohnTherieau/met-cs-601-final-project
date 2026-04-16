import useSWRMutation from "swr/mutation";
import { useState } from "react";


async function sendRequest(url: string) {
    return fetch(
        url, {
        method: "DELETE"
    }).then(res => res.json())
}


export default function Delete() {
    const [id, setID] = useState("");
    const { trigger, isMutating } = useSWRMutation(`/api/job-applications?id=${id}`, sendRequest)



    return (
        <div>
            <h1>Update Job Application</h1>
            <label>Job Application ID</label>
            <input
                value={id}
                type="text"
                onChange={(e) => setID(e.target.value)}
            />
            <br></br>
            <button
                disabled={isMutating}
                onClick={async () => {
                    try {
                        await trigger()

                    } catch (e) {
                        console.log(e);
                    }
                }}
            >
                Delete Job Application
            </button>
        </div>
    );
}