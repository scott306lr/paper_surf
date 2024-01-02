"use client";

import { useState } from "react";
import { api } from "~/utils/api";

export default function LRTest() {
  const [input, setInput] = useState("play chess");
  const { data, isLoading, error } = api.scholar.searchByInput.useQuery({
    input: input,
  });
  console.log(data);

  return (
    <>
      {/* three buttons, each with a different input */}
      <div className="flex flex-col gap-2">
        <h1 className="m-auto text-2xl font-extrabold tracking-tight sm:text-[3rem]">
          Test api result of different inputs
        </h1>
        <button
          onClick={() => setInput("play chess")}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          play Chess
        </button>
        <button
          onClick={() => setInput("transformer")}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          transformer
        </button>
        <button
          onClick={() => setInput("data visualization")}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          data visualization
        </button>
      </div>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            This is a test URL page
          </h1>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error</div>
        ) : (
          <ul>
            {data?.map((item, idx) => (
              <li key={item.paperId}>
                {idx + 1}: {item.title}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
