"use client";

import ReadAll from "@/components/ReadAll";
import ReadFilter from "@/components/ReadFilter";
import Create from "@/components/Create";
import Update from "@/components/Update";
import Delete from "@/components/Delete";


export default function Home() {
  return (
    <>
      <ReadAll />
      <ReadFilter />
      <Create />
      <Update />
      <Delete />
    </>
  );
}
