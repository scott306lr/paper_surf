import { api } from "~/utils/api";
import { useState } from "react";
import { to_lda } from "~/utils/graph_utils";
import { getApaper } from "~/utils/node_fetcher";
import { type Paper } from "~/server/server_utils/fetchHandler"


export default function TestUrl() {
  // const search_mutation = api.scholar.searchByInput.useMutation();
  // const lda_mutation = api.scholar.lda.useMutation();


  // const handleLDA = async (input: string[]) => {
  //   const data = await search_mutation.mutateAsync({ input: input, filter_input: [] });
  //   const lda_data = to_lda(data);
  //   lda_mutation.mutate({ paperID_array: lda_data ?? [] });
  // }

  // console.log('aaa', search_mutation.data, search_mutation.isLoading, search_mutation.error);
  // console.log('bbb', lda_mutation.data, lda_mutation.isLoading, lda_mutation.error);

  const data = getApaper("649def34f8be52c8b66281af98ae884c09aef38b");
  console.log('data', data)


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          This is a intu test page
        </h1>
        {/* <button
          onClick={() => {
            const lda = handleLDA(["play chess"])
          }}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20" */}
        {/* ></button> */}
      </div>
    </main>
  );
}

