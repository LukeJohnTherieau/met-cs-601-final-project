"use client"
import { signIn } from "next-auth/react"
import Image from 'next/image'
import styled from "styled-components";


const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;   
    min-height: 100vh;
    background-color: #ADD8E6;
    font-family: Arial, sans-serif
`;

const StyledDiv = styled.div`
    width: 25%;
    text-align: center;
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 1%;
    border-radius: 10px;
    border: 1px solid #ccc;
    box-shadow: 0 15px 15px -5px rgba(0, 0, 0, 0.1);
    @media  screen and (max-width: 1000px) {
        width: 90%;
    }        
`;

const StyledTitleGroup = styled.div`
    padding: 2%;
    text-align: center;
`;

const StyledTitle = styled.h1`
    color: black;
    padding: 0.5%;
    font-size: calc(12px + 1.75vw);
`;

const StyledP = styled.p`
    color: gray;
    padding: 0.5%;
    font-size: calc(8px + 0.75vw);
`;

const StyledButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;    
`;

const StyledButton = styled.button`
    place-items: center;
    display: block;
    width: 100%;
    background-color: lightgray;
    color: black;
    border: none;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    font-size: calc(4px + 1vw);
    margin: 2%;
`;


export default function Login() {
  return (
    <StyledWrapper>
      <StyledDiv>
        <StyledTitleGroup>
          <StyledTitle>JobTracker</StyledTitle>
          <StyledP>Sign in with your preferred credential provider</StyledP>
        </StyledTitleGroup>
        <br></br>
        <StyledButtonGroup>
          <StyledButton onClick={() => signIn("github")}>
            <Image
              src="/GitHub_Invertocat_Logo.svg.png"
              width={75}
              height={75}
              alt={`GitHub Logo`}
            />
            Sign in with GitHub
          </StyledButton>
          <StyledButton onClick={() => signIn("google")}>
            <Image
              src="/Google__G__logo.svg.webp"
              width={75}
              height={75}
              alt={`Google Logo`}
            />
            Sign in with Google
          </StyledButton>
        </StyledButtonGroup>
      </StyledDiv>
    </StyledWrapper>
  )
}