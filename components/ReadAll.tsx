import useSWR from "swr";
import { JobApplicationProps } from "@/types";
import styled from "styled-components";


const StyledTable = styled.table`
    border: 1px solid black; 
    border-collapse: collapse;  
`;

const StyledTd = styled.td`
    border: 1px solid black; 
    padding: 8px;
`;


export default function ReadAll() {
    const {data, error} = useSWR("/api/job-applications",
        (url) => fetch(url).then((res) => res.json())
    );

    // Handle error and loading states
    if (error) return <div>Failed to load</div>;
    if (!data) return <div>Loading...</div>;
    const jobApplications:JobApplicationProps[] = data;
    return (
      <div>
            <h1>Read All Applications</h1>
            <StyledTable>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Company</th>
                        <th>Date Applied</th>
                        <th>Starting Pay</th>
                    </tr>
                </thead>
                <tbody>
                    {jobApplications.map((jobApplication: JobApplicationProps) => (
                        <tr key = {String(jobApplication._id)}>
                            <StyledTd>{String(jobApplication._id)}</StyledTd>
                            <StyledTd>{jobApplication.title}</StyledTd>
                            <StyledTd>{jobApplication.company.name}</StyledTd>
                            <StyledTd>{String(jobApplication.dateApplied)}</StyledTd>
                            <StyledTd>{String(jobApplication.startingPay)}</StyledTd>
                        </tr>
                    ))}
                </tbody>
            </StyledTable>
      </div>
    );
}