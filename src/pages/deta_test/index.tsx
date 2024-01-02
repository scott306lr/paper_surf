import { api } from "~/utils/api";

import { to_lda } from "~/utils/graph_utils";
import { useState } from "react";
import { HiChartPie, HiHome, HiInbox, HiViewBoards } from "react-icons/hi";
import { type IconType } from "react-icons";
import { ForceGraph3D } from "~/components/ForceGraphWrapper";
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

  const [input, setInput] = useState("play chess");
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
  const graphData = {
    nodes: [],
    links: [],
  };

  const [inputValue, setInputValue] = useState("play chass");
  const { data } = api.scholar.searchByInput.useQuery({
    input: input,
  });
  const lda_data = data && (to_lda(data) as Array<string>);
  const { data: result } = api.scholar.lda.useQuery({
    paperID_array: lda_data ?? [],
  });

  const test = () => {
    console.log("click");
    setInput(inputValue);
    console.log("aaa", input);
    console.log("bbb", result);
  };

  const wordCountMap: Record<string, number> = {};
  graphData.nodes = [];
  graphData.links = [];
  if (result) {
    if (!result[1]) {
      result[1] = [];
    }
    for (let i = 0; i < result[1]?.length; i++) {
      graphData.nodes.push({
        id: result[1][i]?.topic,
        title: result[1][i]?.topic,
      });
      let valA: documentVocab[] = result[1][i]?.documentVocab;
      for (let j = 0; j < valA.length; j++) {
        let word: string = valA[j]?.word ?? "";
        // Check if the word is already in the wordCountMap
        if (wordCountMap[word]) {
          wordCountMap[word]++;
        } else {
          wordCountMap[word] = 1;
        }
      }
    }

    for (let i = 0; i < result[1]?.length; i++) {
      for (let j = i + 1; j < result[1]?.length; j++) {
        let valA: documentVocab[] = result[1][i]?.documentVocab;
        let valB: documentVocab[] = result[1][j]?.documentVocab;
        let cnt = 0;
        for (let x = 0; x < valA.length; x++) {
          for (let y = 0; y < valB.length; y++) {
            if (valA[x]?.word === valB[y]?.word) {
              cnt++;
            }
          }
        }
        if (cnt) {
          console.log("cnt", cnt);
          graphData.links.push({
            source: result[1][i]?.topic,
            target: result[1][j]?.topic,
            value: cnt,
          });
        }
      }
    }
  }
  for (const word in wordCountMap) {
    if (wordCountMap.hasOwnProperty(word)) {
      const count = wordCountMap[word];
      console.log(`Word: ${word}, Count: ${count}`);
    }
  }
  return (
    <main>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      ></input>
      <button onClick={test}>click it submit</button>

      <div>hello world</div>
      <ul>
        {data?.map((item, idx) => (
          <li key={item.paperId}>
            {idx + 1}: {item.title}
          </li>
        ))}
      </ul>
      <ForceGraph3D
        graphData={graphData}
        nodeThreeObjectExtend={true}
        nodeThreeObject={(node) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const sprite = new SpriteText(node.title) as any;
          sprite.color = "#FFFFFF";
          sprite.backgroundColor = false; //assignColor(node?.id);
          sprite.textHeight = 16;
          sprite.borderRadius = 0.9;
          sprite.padding = [3, 1];
          sprite.position.x = -2;
          sprite.position.y = 30;
          sprite.position.z = 10;
          return sprite;
        }}
      />
    </main>
  );
}
