import { api } from "~/utils/api";
import { useState } from "react";

import { topic_extraction } from "~/server/server_utils/myLDA";


export default function TestUrl() {
  // const [input, setInput] = useState("play chess");
  const { data } = api.scholar.searchByInput.useQuery({
    input: "play chess",
  });
  // const run_lda = api.scholar.lda.useMutation();

  const tolda = data?.map((item) => {
    return { paperId: item.paperId, abstract: item.abstract };
  });

  const { data: result } = api.scholar.lda.useQuery({
    input: tolda ?? []
  });


  // const { data, isLoading, error } = api.scholar.searchByInput.useQuery({
  //   input: "play chess",
  // });

  // console.log('aavv', data, isLoading, error)
  // // const data2 = topic_extraction(data);
  // // console.log('aaa', data, isLoading, error);


  console.log('aaa', data);
  console.log('bbb', result);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          This is a intu test page
        </h1>
      </div>
    </main>
  );
}

