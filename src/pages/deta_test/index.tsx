import { api } from "~/utils/api";

import { to_lda } from "~/utils/graph_utils";
import { useState } from "react";
import { HiChartPie, HiHome, HiInbox, HiViewBoards } from "react-icons/hi";
import { type IconType } from "react-icons";
import { keyWord_to_graph } from "~/utils/graph_utils";
import SpriteText from "three-spritetext";
type documentVocab = {
  count: number;
  specificity: number;
  stopword: any;
  word: string;
};
export default function TestUrl() {
  // const [input, setInput] = useState("play chess");
  // const { data } = api.scholar.searchByInput.useQuery({
  //   input: "play chess",
  // });
  // const run_lda = api.scholar.lda.useMutation();

  // const [input, setInput] = useState("play chess");
  const search_mutation = api.scholar.searchByInput.useMutation();
  const lda_mutation = api.scholar.lda.useMutation();


  const handleLDA = async (input: string[]) => {
    const data = await search_mutation.mutateAsync({ input: input, filter_input: [] });
    const lda_data = to_lda(data);
    lda_mutation.mutate({ paperID_array: lda_data ?? [] });
    // console.log(keyWord_to_graph(lda_mutation.data[1]?.data ?? []));

  }
  // console.log('aaa', search_mutation.data, search_mutation.isLoading, search_mutation.error);
  console.log('test for data', lda_mutation.data, lda_mutation.isLoading, lda_mutation.error);
  if (lda_mutation.data != undefined) {
    console.log('aaa', lda_mutation.data[1]);
    console.log('aaa', keyWord_to_graph(lda_mutation.data[1]));
  } 


  

  // const lda_data = data && to_lda(data) as Array<string>;

  // const tolda = data?.map((item) => {
  //   return { paperId: item.paperId, abstract: item.abstract };
  // });

  // data?.map((item) => item.citations.map((item) => tolda?.push({ paperId: item.paperId, abstract: item.abstract })));

  // const { data: result } = api.scholar.lda.useQuery({
  //   paperID_array: lda_data ?? []
  // });

  // const { data, isLoading, error } = api.scholar.searchByInput.useQuery({
  //   input: "play chess",
  // });

  // console.log('aavv', data, isLoading, error)
  // // const data2 = topic_extraction(data);
  // // console.log('aaa', data, isLoading, error);
  return (
    <main>
      <h1>deta test page</h1>
      <button onClick={() => {
          const lda = handleLDA(["play chess"])
        }
      }> click it</button>
      {/* <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      ></input>
      <button onClick={test}>click it submit</button> */}

      {/* <ul>
        {data?.map((item, idx) => (
          <li key={item.paperId}>
            {idx + 1}: {item.title}
          </li>
        ))}
      </ul> */}
    </main>
  );
}
