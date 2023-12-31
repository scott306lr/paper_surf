/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import dynamic from "next/dynamic";
import { type LinkObject, type NodeObject } from "react-force-graph-2d";
import { type CGraphData } from "~/components/CGraph2D";

const CGraph = dynamic(() => import("~/components/CGraph2D"), {
  ssr: false,
});

const CitationGraph: React.FC<{
  graphData: CGraphData;
  hoverNodeId: string | null;
  clickNodeId: string | null;
  highlightNodeIds: Set<string>;
  highlightLinkIds: Set<string>;
  handleNodeHover: (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>>,
  ) => void;
  handleLinkHover: (link: LinkObject<CGraphData["links"][0]>) => void;
  handleClickNode: (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>>,
  ) => void;
  showTopic: boolean;
  showPaper: boolean;
  showAuthor: boolean;
}> = ({
  graphData,
  hoverNodeId,
  clickNodeId,
  highlightNodeIds,
  highlightLinkIds,
  handleNodeHover,
  handleLinkHover,
  handleClickNode,
  showTopic,
  showPaper,
  showAuthor,
}) => {
  return (
    <CGraph
      graphData={graphData}
      hoverNodeId={hoverNodeId}
      clickNodeId={clickNodeId}
      highlightNodeIds={highlightNodeIds}
      highlightLinkIds={highlightLinkIds}
      handleNodeHover={handleNodeHover}
      handleLinkHover={handleLinkHover}
      handleClickNode={handleClickNode}
      showTopic={showTopic}
      showPaper={showPaper}
      showAuthor={showAuthor}
    />
  );
};

export default CitationGraph;
