/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import dynamic from "next/dynamic";
import { type CGraphData } from "~/components/CGraph2D";

const CGraph = dynamic(() => import("~/components/CGraph2D"), {
  ssr: false,
});

const CitationGraph: React.FC<{
  graphData: CGraphData;
}> = ({ graphData }) => {
  return <CGraph graphData={graphData} />;
};

export default CitationGraph;