import { api } from "~/utils/api";
import { useState } from "react";
import { to_lda } from "~/utils/graph_utils";


export default function TestUrl() {
  // const [input, setInput] = useState(["play chess"]);
  const search_mutation = api.scholar.searchByInput.useMutation();
  const lda_mutation = api.scholar.lda.useMutation();

  const handleSearch = (input: string[]) => {
    search_mutation.mutate({ input: input, filter_input: [] });
  }

  const handleLDA = (data: any) => {
    const lda_data = data && to_lda(data) as Array<string>;
    lda_mutation.mutate({ paperID_array: lda_data ?? [] });
  }

  console.log('aaa', search_mutation.data, search_mutation.isLoading, search_mutation.error);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          This is a intu test page
        </h1>
        <button
          onClick={() => {
            handleSearch(["play chess"])
            while (search_mutation.isLoading) { }
            handleLDA(search_mutation.data)
            console.log('bbb', lda_mutation.data, lda_mutation.isLoading, lda_mutation.error);
          }}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        ></button>
      </div>
    </main>
  );
}

