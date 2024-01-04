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
import { type PaperBrief } from "~/server/server_utils/fetchHandler";


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
        label: dataDict[node.id]?.authors[0]?.name ?? "unknown",
        size: 4,
        level: 0,
        color: "blue",
        drawType: "circle" as const, //"text" as const,
        neighbors: node.neighbors,
        links: node.links,
        opacity: 0.5, //node.opcaity
      })),
      // links: [],
      links: cite_graph.links.map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        strength: 4,
        opacity: 0.5,
      })),
    };

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
        opacity: node.opcaity,
      })),

      links: topic_graph.links.map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        opacity: 0,
        strength: 4,
      })),
    };

    // connect paper nodes to its topic nodes
    const graph3 = {
      nodes: [],
      links: topic_graph.nodes.flatMap((topic_node) => {
        return topic_node.paperIds.map((paperId) => ({
          id: `${topic_node.id}-${paperId}`,
          source: topic_node.id,
          target: paperId,
          opacity: 0.5,
          strength: 4,
        }));
      }),
    };

    // return graph2;
    return {
      nodes: [...graph1.nodes, ...graph2.nodes, ...graph3.nodes],
      links: [...graph1.links, ...graph2.links, ...graph3.links],
    };
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

  console.log('lda_data', lda_data)

  const lda_map = new Map<string, number>();
  lda_data?.forEach((d) => {
    d.documents.forEach((b) => {
      if (lda_map.has(b.id)) lda_map.set(b.id, lda_map.get(b.id) + 1);
      else lda_map.set(b.id, 1);
    })
  })

  console.log('lda_map', lda_map)

  const onSubmit = async (values: z.infer<typeof inputFormSchema>) => {
    // console.log(values);
    const search_result = await search_mutateAsync({
      input: values.positive.split(", "),
      filter_input: values.negative.split(", "),
    });

    console.log("search_result", search_result);

    if (search_result != null) {
      const search_map = new Map<string, number>();

      search_result?.forEach((d) => {
        if (search_map.has(d.paperId)) search_map.set(d.paperId, search_map.get(d.paperId) + 1);
        else search_map.set(d.paperId, 1);
        d.citations.forEach((c) => {
          if (search_map.has(c.paperId)) search_map.set(c.paperId, search_map.get(c.paperId) + 1);
          else search_map.set(c.paperId, 1);
        });
        d.references.forEach((r) => {
          if (search_map.has(r.paperId)) search_map.set(r.paperId, search_map.get(r.paperId) + 1);
          else search_map.set(r.paperId, 1);
        });
      });
      console.log('search_map', search_map)
      console.log('lda', to_lda(search_result))
    }

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
