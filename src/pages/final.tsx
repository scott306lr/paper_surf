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
import { type LinkObject, type NodeObject } from "react-force-graph-2d";
import { type PaperBrief } from "~/server/server_utils/fetchHandler";
import { getDataByPaperId } from "~/utils/node_fetcher";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const RenderGraph: React.FC<{ graphData: CGraphData }> = ({ graphData }) => {
  // const graphData = useMemo<CGraphData>(() => {
  //   const dataDict = papers.reduce(
  //     (acc, cur) => {
  //       acc[cur.paperId] = cur;
  //       cur.citations.forEach((c) => {
  //         acc[c.paperId] = c;
  //       });
  //       cur.references.forEach((r) => {
  //         acc[r.paperId] = {
  //           ...r,
  //         };
  //       });
  //       return acc;
  //     },
  //     {} as Record<
  //       string,
  //       {
  //         paperId: string;
  //         year: number;
  //         authors: { authorId: string; name: string }[];
  //       }
  //     >,
  //   );
  //   const cite_graph = data_to_graph(papers);

  //   const graph1 = {
  //     nodes: cite_graph.nodes.map((node) => ({
  //       id: node.id,
  //       label: dataDict[node.id]?.authors[0]?.name ?? "unknown",
  //       size: 4,
  //       level: 0,
  //       color: "blue",
  //       drawType: "circle" as const, //"text" as const,
  //       neighbors: node.neighbors,
  //       links: node.links,
  //       opacity: 0.5, //node.opcaity
  //     })),
  //     // links: [],
  //     links: cite_graph.links.map((link) => ({
  //       id: link.id,
  //       source: link.source,
  //       target: link.target,
  //       strength: 4,
  //       opacity: 0.5,
  //     })),
  //   };

  //   const topic_graph = keyWord_to_graph(topics);
  //   const graph2 = {
  //     nodes: topic_graph.nodes.map((node) => ({
  //       id: node.id,
  //       label: node.keywords.slice(0, 2).join(", "),
  //       size: 4,
  //       level: 0,
  //       color: ["red", "green", "blue"][+node.id % 3]!,
  //       drawType: "text" as const, //"circle",
  //       neighbors: node.neighbors,
  //       links: node.links,
  //       opacity: node.opcaity,
  //     })),

  //     links: topic_graph.links.map((link) => ({
  //       id: link.id,
  //       source: link.source,
  //       target: link.target,
  //       opacity: 0,
  //       strength: 4,
  //     })),
  //   };

  //   // connect paper nodes to its topic nodes
  //   const graph3 = {
  //     nodes: [],
  //     links: topic_graph.nodes.flatMap((topic_node) => {
  //       return topic_node.paperIds.map((paperId) => ({
  //         id: `${topic_node.id}-${paperId}`,
  //         source: topic_node.id,
  //         target: paperId,
  //         opacity: 0.5,
  //         strength: 4,
  //       }));
  //     }),
  //   };

  //   // return graph2;
  //   return {
  //     nodes: [...graph1.nodes, ...graph2.nodes, ...graph3.nodes],
  //     links: [...graph1.links, ...graph2.links, ...graph3.links],
  //   };
  // }, [topics, papers]);

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
  // const {
  //   mutateAsync: search_mutateAsync,
  //   data: search_data,
  //   isLoading: search_isLoading,
  // } = api.scholar.searchByInput.useMutation();

  const {
    mutate: lda_mutate,
    data: lda_data,
    isLoading: lda_isLoading,
  } = api.scholar.lda.useMutation();

  const { data: paper_data, isLoading: paper_isLoading } = getDataByPaperId(
    "649def34f8be52c8b66281af98ae884c09aef38b",
  );

  // console.log("paper_data", paper_data);
  // console.log('lda_data', lda_data)

  // const lda_map = new Map<string, number>();
  // lda_data?.forEach((d) => {
  //   d.documents.forEach((b) => {
  //     if (lda_map.has(b.id)) lda_map.set(b.id, lda_map.get(b.id) + 1);
  //     else lda_map.set(b.id, 1);
  //   });
  // });

  // console.log('lda_map', lda_map)

  const onSubmit = async (values: z.infer<typeof inputFormSchema>) => {
    lda_mutate({
      input: values.positive.split(", "),
      filter_input: values.negative.split(", "),
      stopwords: values.stopwords.split(", "),
      sweeps: values.precision,
    });

    // // console.log(values);
    // const search_result = await search_mutateAsync({
    //   input: values.positive.split(", "),
    //   filter_input: values.negative.split(", "),
    // });

    // // console.log("search_result", search_result);

    // if (search_result != null) {
    //   const search_map = new Map<string, number>();

    //   search_result?.forEach((d) => {
    //     if (search_map.has(d.paperId))
    //       search_map.set(d.paperId, search_map.get(d.paperId) + 1);
    //     else search_map.set(d.paperId, 1);
    //     d.citations.forEach((c) => {
    //       if (search_map.has(c.paperId))
    //         search_map.set(c.paperId, search_map.get(c.paperId) + 1);
    //       else search_map.set(c.paperId, 1);
    //     });
    //     d.references.forEach((r) => {
    //       if (search_map.has(r.paperId))
    //         search_map.set(r.paperId, search_map.get(r.paperId) + 1);
    //       else search_map.set(r.paperId, 1);
    //     });
    //   });
    //   // console.log('search_map', search_map)
    //   // console.log('lda', to_lda(search_result))
    // }

    // if (search_result != null)
    //   lda_mutate({
    //     paperID_array: to_lda(search_result),
    //     stopwords: values.stopwords.split(", "),
    //     sweeps: values.precision,
    //   });
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
            {lda_isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-black"></div>
              </div>
            ) : !lda_data ? (
              <div className="flex items-center justify-center">
                <span>Search for a topic</span>
              </div>
            ) : (
              <RenderGraph graphData={lda_data} />
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={30}>
          <div className="flex h-full flex-col">
            {paper_isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-black"></div>
              </div>
            ) : !paper_data ? (
              <div className="flex items-center justify-center">
                <span>Search for a topic</span>
              </div>
            ) : (
              // <div className="flex h-full flex-col gap-6 p-6">

              // </div>
              <div className="flex h-full w-full flex-col gap-4 p-6">
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {paper_data.title}
                </h1>
                <p className="text-md w-full px-2">
                  {paper_data.authors?.map((author) => (
                    <a href={author.url} className="mr-2 text-wrap underline">
                      {author.name}
                    </a>
                  ))}
                  {/* {paper_data.authors.map((author) => author.name).join(", ")} */}
                </p>
                {paper_data.tldr.text && (
                  <Accordion type="single" defaultValue="item-1" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>TL;DR</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-justify">
                          <Badge variant="outline" className="text-md mr-2">
                            TL;DR
                          </Badge>
                          {paper_data.tldr.text}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                {paper_data.abstract && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Abstract</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-justify">
                          <Badge variant="outline" className="text-md mr-2">
                            Abstract
                          </Badge>
                          {paper_data.abstract}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <Tabs defaultValue="account" className="w-full">
                  <TabsList className="flex gap-2">
                    <TabsTrigger value="reference" className="flex-1">
                      Reference
                    </TabsTrigger>
                    <TabsTrigger value="citation" className="flex-1">
                      Citation
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="reference">
                    <ScrollArea className="h-[25rem] rounded-lg border px-4 py-2">
                      <div className="flex h-full flex-col gap-4">
                        {paper_data.references.map((ref) => (
                          <>
                            <div className="flex flex-col justify-center gap-2 px-2">
                              <span className="text-lg font-extrabold">
                                {ref.title}
                                <span className="ml-4 whitespace-nowrap text-sm font-light">
                                  {ref.citationCount} citations
                                </span>
                              </span>
                              <span className="text-md w-full space-x-2">
                                <Badge variant="secondary" className="text-md">
                                  {ref.authors[0]?.name}
                                </Badge>
                                {
                                  ref.fieldsOfStudy?.map((field) => (
                                    <span className="text-sm font-light">
                                      {field}
                                    </span>
                                  ))[0]
                                }
                                <span className="text-sm font-light">
                                  {ref.year}
                                </span>
                              </span>
                            </div>
                            <div className="border-b border-accent border-gray-300"></div>
                          </>
                        ))}
                      </div>
                      <ScrollBar />
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="citation">
                    <ScrollArea className="h-[25rem] rounded-lg border px-4 py-2">
                      <div className="flex h-full flex-col gap-4">
                        {paper_data.citations.map((ref) => (
                          <>
                            <div className="flex flex-col justify-center gap-2 px-2">
                              <span className="text-lg font-extrabold">
                                {ref.title}
                                <span className="ml-4 whitespace-nowrap text-sm font-light">
                                  {ref.citationCount} citations
                                </span>
                              </span>
                              <span className="text-md w-full space-x-2">
                                <Badge variant="secondary" className="text-md">
                                  {ref.authors[0]?.name}
                                </Badge>
                                {
                                  ref.fieldsOfStudy?.map((field) => (
                                    <span className="text-sm font-light">
                                      {field}
                                    </span>
                                  ))[0]
                                }
                                <span className="text-sm font-light">
                                  {ref.year}
                                </span>
                              </span>
                            </div>
                            <div className="border-b border-accent border-gray-300"></div>
                          </>
                        ))}
                      </div>
                      <ScrollBar />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
