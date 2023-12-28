import { api } from "~/utils/api";

import { to_lda } from "~/utils/graph_utils";


export default function TestUrl() {
  // const [input, setInput] = useState("play chess");
  const { data } = api.scholar.searchByInput.useQuery({
    input: "play chess",
  });
  // const run_lda = api.scholar.lda.useMutation();


  const lda_data = data && to_lda(data) as Array<string>;


  // const tolda = data?.map((item) => {
  //   return { paperId: item.paperId, abstract: item.abstract };
  // });

  // data?.map((item) => item.citations.map((item) => tolda?.push({ paperId: item.paperId, abstract: item.abstract })));

  const { data: result } = api.scholar.lda.useQuery({
    paperID_array: lda_data ?? []
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

