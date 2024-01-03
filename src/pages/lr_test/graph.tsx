"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { data_to_graph } from "~/utils/graph_utils";
import CitationGraph from "~/components/CGWrapper";
import { type Paper } from "~/server/server_utils/fetchHandler";

const TestDraw: React.FC<{
  data: Paper[];
}> = ({ data }) => {
  const citeGraph = data_to_graph(data);

  // function softmax(arr) {
  //   return arr.map(function (value, index) {
  //     return (
  //       Math.exp(value) /
  //       arr
  //         .map(function (y /*value*/) {
  //           return Math.exp(y);
  //         })
  //         .reduce(function (a, b) {
  //           return a + b;
  //         })
  //     );
  //   });
  // }

  //TODO: calc size by softmax
  // const size_arr = data.map((paper) =>
  const dataDict = data.reduce(
    (acc, cur) => {
      acc[cur.paperId] = cur;
      cur.citations.forEach((c) => {
        acc[c.paperId] = c;
      });
      cur.references.forEach((r) => {
        acc[r.paperId] = r;
      });
      return acc;
    },
    {} as Record<string, Paper>,
  );

  console.log(data);

  // get min and max citation count for scaling
  const minCiteCount = Math.min(
    ...data.map((paper) => paper.citations.length ?? 0),
  );
  const maxCiteCount = Math.max(
    ...data.map((paper) => paper.citations.length ?? 0),
  );

  const graphData = {
    nodes:
      citeGraph.nodes.map((node) => ({
        id: dataDict[node.paperId]?.paperId,
        label:
          dataDict[node.paperId]?.authors[0]?.name +
          ", " +
          dataDict[node.paperId]?.year,
        size: 5 + 30 * ((dataDict[node.paperId]?.length ?? 0) / maxCiteCount),
      })) ?? [],
    links:
      citeGraph.links.map((link) => ({
        source: link.source,
        target: link.target,
        strength: 0.5,
      })) ?? [],
  };

  return <CitationGraph graphData={graphData} />;
};

export default function GraphTest() {
  // const [input, setInput] = useState("play chess");
  const { mutate, data, isLoading, error } =
    api.scholar.searchByInput.useMutation();

  console.log(mutate, data, isLoading, error);

  return (
    <>
      {/* three buttons, each with a different input */}
      <div className="flex flex-col gap-2">
        <h1 className="m-auto text-2xl font-extrabold tracking-tight sm:text-[3rem]">
          Test api result of different inputs
        </h1>
        <button
          onClick={() =>
            mutate({ input: ["play chess"], filter_input: ["RL"] })
          }
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          play Chess
        </button>
        <button
          onClick={() => mutate({ input: ["transformer"], filter_input: [] })}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          transformer
        </button>
        <button
          onClick={() =>
            mutate({ input: ["data visualization"], filter_input: [] })
          }
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
        {!data || isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error {error}</div>
        ) : (
          <TestDraw data={data} />
        )}
      </main>
    </>
  );
}
