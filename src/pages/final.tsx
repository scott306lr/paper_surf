"use client";

import { api } from "~/utils/api";
import {
  to_lda,
  keyWord_to_graph,
  type topicInfo,
  data_to_graph,
} from "~/utils/graph_utils";

import CitationGraph from "~/components/CGWrapper2D";
import { type CGraphData } from "~/components/CGraph2D";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { useMemo, useState } from "react";
import InputForm, { type inputFormSchema } from "~/components/InputForm";
import { type z } from "zod";
import { Panel } from "react-resizable-panels";
import { type LinkObject, type NodeObject } from "react-force-graph-2d";
import { Paper, PaperBrief } from "~/server/server_utils/fetchHandler";

const RenderGraph: React.FC<{ topics: topicInfo[]; papers: PaperBrief[] }> = ({
  topics,
  papers,
}) => {
  const graphData = useMemo<CGraphData>(() => {
    const dataDict = papers.reduce(
      (acc, cur) => {
        acc[cur.paperId] = cur;
        cur.citations.forEach((c) => {
          acc[c.paperId] = c;
        });
        cur.references.forEach((r) => {
          acc[r.paperId] = {
            ...r,
          };
        });
        return acc;
      },
      {} as Record<
        string,
        {
          paperId: string;
          year: number;
          authors: { authorId: string; name: string }[];
        }
      >,
    );
    const cite_graph = data_to_graph(papers);

    const graph1 = {
      nodes: cite_graph.nodes.map((node) => ({
        id: node.id,
        label: node.id, //dataDict[node.id]?.authors[0]?.name ?? "unknown",
        size: 4,
        level: 0,
        color: "green",
        drawType: "circle" as const,
        neighbors: node.neighbors,
        links: node.links,
        opacity: node.opcaity
      })),
      links: cite_graph.links.map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        strength: 4,
      })),
    };

    console.log("graph1", graph1);

    const topic_graph = keyWord_to_graph(topics);
    const graph2 = {
      nodes: topic_graph.nodes.map((node) => ({
        id: node.id,
        label: node.keywords.slice(0, 2).join(", "),
        size: 4,
        level: 0,
        color: ["red", "green", "blue"][+node.id % 3]!,
        drawType: "text" as const, //"circle",
        neighbors: node.neighbors,
        links: node.links,
      })),

      links: topic_graph.links.map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        strength: 4,
      })),
    };

    return graph2;
  }, [topics, papers]);

  const [highlightNodeIds, setHighlightNodeIds] = useState(new Set<string>());
  const [highlightLinkIds, setHighlightLinkIds] = useState(new Set<string>());
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);

  const updateHighlight = () => {
    setHighlightNodeIds(highlightNodeIds);
    setHighlightLinkIds(highlightLinkIds);
  };

  const handleNodeHover = (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>> | null,
  ) => {
    highlightNodeIds.clear();
    highlightLinkIds.clear();
    if (node) {
      highlightNodeIds.add(node.id);
      node.neighbors.forEach((neighbor) => highlightNodeIds.add(neighbor));
      node.links.forEach((link) => highlightLinkIds.add(link));
    }

    setHoverNodeId(node?.id ?? null);
    updateHighlight();
  };

  const handleLinkHover = (link: LinkObject<CGraphData["links"][0]>) => {
    highlightNodeIds.clear();
    highlightLinkIds.clear();

    if (link) {
      highlightLinkIds.add(link.id);
      highlightNodeIds.add(link.source);
      highlightNodeIds.add(link.target);
    }

    updateHighlight();
  };

  return (
    <CitationGraph
      graphData={graphData}
      hoverNodeId={hoverNodeId}
      highlightNodeIds={highlightNodeIds}
      highlightLinkIds={highlightLinkIds}
      handleNodeHover={handleNodeHover}
      handleLinkHover={handleLinkHover}
    />
  );
};

export default function PaperSurf() {
  const {
    mutateAsync: search_mutateAsync,
    data: search_data,
    isLoading: search_isLoading,
  } = api.scholar.searchByInput.useMutation();

  const {
    mutate: lda_mutate,
    data: lda_data,
    isLoading: lda_isLoading,
  } = api.scholar.lda.useMutation();

  const onSubmit = async (values: z.infer<typeof inputFormSchema>) => {
    // console.log(values);
    const search_result = await search_mutateAsync({
      input: values.positive.split(", "),
      filter_input: values.negative.split(", "),
    });

    if (search_result != null)
      lda_mutate({
        paperID_array: to_lda(search_result),
        stopwords: values.stopwords.split(", "),
        sweeps: values.precision,
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
            ) : !lda_data || !search_data ? (
              <div className="flex items-center justify-center">
                <span>Search for a topic</span>
              </div>
            ) : (
              <RenderGraph topics={lda_data} papers={search_data} />
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
