import { randFloat } from "three/src/math/MathUtils.js";
import CitationGraph from "~/components/CGWrapper";

export default function PaperSurf() {
  //create 100 nodes, each with a random size and random links to other nodes
  const ABCData = {
    nodes: [...Array(100).keys()].map((i) => ({
      id: i,
      size: 20, //randFloat(0.1, 1),
    })),
    links: [...Array(100).keys()].map((i) => ({
      source: i,
      target: Math.round(randFloat(0, 99)),
    })),
  };

  const graphData = {
    nodes: ABCData.nodes.map((node) => ({
      id: node.id,
      label: node.id,
      size: node.size,
    })),

    links: ABCData.links.map((link) => ({
      source: link.source,
      target: link.target,
      // random(0.1, 0.5)
      strength: (link.source * link.source + link.target * link.target) / 20000,
    })),
  };

  return (
    <main className="h-full w-full">
      {/* <div className="flex h-full w-full flex-col items-center justify-center gap-12 px-4 py-16 ">
        <CGraph graphData={graphData} />
      </div> */}
      {/* <CGraph graphData={graphData} /> */}
      <CitationGraph graphData={graphData} />
    </main>
  );
}
