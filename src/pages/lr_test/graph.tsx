"use client";

// import { Alert } from "flowbite-react";
import { useState } from "react";
import { api } from "~/utils/api";

import { ForceGraph3D } from "~/components/ForceGraph3DWrapper";
import SpriteText from "three-spritetext";
import { data_to_graph } from "~/utils/graph_utils";

export default function GraphTest() {
  const [input, setInput] = useState("play chess");
  const { data, isLoading, error } = api.scholar.searchByInput.useQuery({
    input: input,
  });
  console.log(data);

  // const graphData = {
  //   nodes: [{ id: "Harry" }, { id: "Sally" }, { id: "Alice" }, { id: "Jerry" }],
  //   links: [
  //     { source: "Harry", target: "Sally" },
  //     { source: "Harry", target: "Alice" },
  //     { source: "Alice", target: "Jerry" },
  //   ],
  // };

  // data have paperId, title.
  // citations betweeen them will be randomly generated.
  // const nodes = data?.map((item) => {
  //   return { id: item.paperId, title: item.title };
  // });
  // const links = data?.map((item) => {
  //   return {
  //     source: item.paperId,
  //     target: data[Math.floor(Math.random() * data.length)]?.paperId,
  //   };
  // });
  const graphData = data && data_to_graph(data);

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
          <Alert color="info">Alert test!</Alert>c
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <Alert color="red">{error.message}</Alert>
        ) : (
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
        )}
      </main>
    </>
  );
}
