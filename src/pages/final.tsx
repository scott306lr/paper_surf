import { api } from "~/utils/api";
import { to_lda, keyWord_to_graph, type topicInfo } from "~/utils/graph_utils";

import CitationGraph from "~/components/CGWrapper2D";
import { type CGraphData } from "~/components/CGraph2D";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Combobox } from "~/components/Combobox";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import InputForm, { type inputFormSchema } from "~/components/InputForm";
import { type z } from "zod";
import { Panel } from "react-resizable-panels";
import { link } from "fs";
import { LinkObject, NodeObject } from "react-force-graph-2d";

const RenderGraph: React.FC<{ topics: topicInfo[] }> = ({ topics }) => {
  const graph = keyWord_to_graph(topics);
  const graphData: CGraphData = {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      label: node.keywords.slice(0, 2).join(" "),
      size: 4,
      level: 0,
      color: ["red", "green", "blue"][+node.id % 3]!,
      drawType: "text",
      neighbors: node.neighbors,
      links: node.links,
    })),

    links: graph.links.map((link) => ({
      id: link.id,
      source: link.source,
      target: link.target,
      strength: 4,
    })),
  };

  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>> | null,
  ) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node.id);
      node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links.forEach((link) => highlightLinks.add(link));
    }

    setHoverNodeId(node?.id || null);
    updateHighlight();
  };

  const handleLinkHover = (link: LinkObject<CGraphData["links"][0]>) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link.id);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  // const paintRing = useCallback(
  //   (node, ctx) => {
  //     // add ring just for highlighted nodes
  //     ctx.beginPath();
  //     ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
  //     ctx.fillStyle = node === hoverNode ? "red" : "orange";
  //     ctx.fill();
  //   },
  //   [hoverNode],
  // );

  return (
    <CitationGraph
      graphData={graphData}
      hoverNodeId={hoverNodeId}
      highlightNodes={highlightNodes}
      highlightLinks={highlightLinks}
      handleNodeHover={handleNodeHover}
      handleLinkHover={handleLinkHover}
    />
  );
};

export default function PaperSurf() {
  const {
    mutateAsync: search_mutateAsync,
    // data: search_data,
    isLoading: search_isLoading,
  } = api.scholar.searchByInput.useMutation();

  const {
    mutate: lda_mutate,
    data: lda_data,
    isLoading: lda_isLoading,
  } = api.scholar.lda.useMutation();

  const onSubmit = async (values: z.infer<typeof inputFormSchema>) => {
    const search_result = await search_mutateAsync({
      input: values.positive.split(", "),
      filter_input: values.negative.split(", "),
    });

    if (search_result != null)
      lda_mutate({
        paperID_array: to_lda(search_result),
        stopwords: values.stopwords.split(", "),
      });
  };

  return (
    <main className="h-screen w-screen items-center justify-center">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] rounded-lg border"
      >
        <ResizablePanel minSize={20} maxSize={20} defaultSize={20} collapsible>
          <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
            <InputForm onSubmit={onSubmit} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            {search_isLoading || lda_isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-black"></div>
              </div>
            ) : !lda_data ? (
              <div className="flex items-center justify-center">
                <span>Search for a topic</span>
              </div>
            ) : (
              <RenderGraph topics={lda_data} />
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <Panel defaultSize={30} minSize={30} maxSize={30}>
          <div className="flex h-full items-center justify-center p-6">
            <span>Panel 3</span>
          </div>
        </Panel>
      </ResizablePanelGroup>
    </main>
  );
}
