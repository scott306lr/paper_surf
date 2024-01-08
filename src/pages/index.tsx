"use client";

import { api } from "~/utils/api";

import CitationGraph from "~/components/CGWrapper2D";
import { type CGraphData } from "~/components/CGraph2D";

import { useState } from "react";
import InputForm, { type inputFormSchema } from "~/components/InputForm";
import { type z } from "zod";
import { type LinkObject, type NodeObject } from "react-force-graph-2d";
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
import dynamic from "next/dynamic";
import MySwitch from "~/components/MySwitch";

const MyBoxPlot = dynamic(() => import("~/components/MyBoxPlot"), {
  ssr: false,
});

const MyColorBar = dynamic(() => import("~/components/MyColorBar"), {
  ssr: false,
});

const RenderGraph: React.FC<{
  graphData: CGraphData;
  clickNodeId: string | null;
  setClickNodeId: (nodeId: string | null) => void;
}> = ({ graphData, clickNodeId, setClickNodeId }) => {
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
      highlightLinkIds.add(link.id as string);
      highlightNodeIds.add(link.source as string);
      highlightNodeIds.add(link.target as string);
    }

    updateHighlight();
  };

  const [showTopic, setShowTopic] = useState("checked");
  const [showPaper, setShowPaper] = useState("checked");
  const [showAuthor, setShowAuthor] = useState("checked");
  console.log(showTopic, showPaper, showAuthor);

  const years =
    graphData?.nodes
      ?.filter((node) => node.year > 0)
      .map((node) => ({
        value: node.year,
      })) ?? [];
  const minYear = Math.min(...years.map((year) => year.value));
  const maxYear = Math.max(...years.map((year) => year.value));
  console.log(years, minYear, maxYear);

  return (
    <div className="relative h-full w-full">
      <CitationGraph
        graphData={graphData}
        hoverNodeId={hoverNodeId}
        clickNodeId={clickNodeId}
        highlightNodeIds={highlightNodeIds}
        highlightLinkIds={highlightLinkIds}
        handleNodeHover={handleNodeHover}
        handleLinkHover={handleLinkHover}
        handleClickNode={(node) =>
          node ? setClickNodeId(node.id) : setClickNodeId(null)
        }
        showTopic={showTopic === "checked"}
        showPaper={showPaper === "checked"}
        showAuthor={showAuthor === "checked"}
      />
      <div className="absolute bottom-2 right-2 flex flex-col items-end justify-center gap-4">
        <div className="h-[4rem] w-[20rem]">
          <MyBoxPlot
            data={years}
            min={minYear}
            max={maxYear}
            colors={["#AAD7D9"]}
          />
        </div>
        <div className="h-[4rem] w-[30rem]">
          <MyColorBar min={minYear} max={maxYear} />
        </div>
      </div>

      <div className="absolute bottom-5 left-5 flex flex-col gap-4">
        <MySwitch
          text="Show Topic"
          checked={showTopic}
          setChecked={setShowTopic}
        />
        <MySwitch
          text="Show Paper"
          checked={showPaper}
          setChecked={setShowPaper}
        />
        <MySwitch
          text="Show Author"
          checked={showAuthor}
          setChecked={setShowAuthor}
        />
      </div>
    </div>
  );
};

const PaperInfo: React.FC<{
  paperId: string;
}> = ({ paperId }) => {
  const { data: paper_data, isLoading: paper_isLoading } =
    getDataByPaperId(paperId);

  const authorURL = (
    authorId: string | undefined,
    authorName: string | undefined,
  ): string => {
    return `https://www.semanticscholar.org/author/${authorName}/${authorId}`;
  };

  return (
    <>
      {paper_isLoading ? (
        <div className="flex items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-black"></div>
        </div>
      ) : !paper_data ? (
        <div className="flex items-center justify-center">
          <span>Select a paper to view info</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <a
              href={paper_data.url}
              className="mr-2 text-wrap font-serif underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {paper_data.title}
            </a>
          </h1>
          <p className="text-md w-full px-2">
            {paper_data.authors?.map((author) => (
              <a
                href={author.url}
                className="mr-2 text-wrap underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {author.name}
              </a>
            ))}
          </p>
          {paper_data.tldr?.text && (
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
                References
                <span className="ml-2 text-sm font-light">
                  {paper_data.referenceCount}
                </span>
              </TabsTrigger>
              <TabsTrigger value="citation" className="flex-1">
                Citations
                <span className="ml-2 text-sm font-light">
                  {paper_data.citationCount}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reference">
              <ScrollArea className="h-[35rem] rounded-lg border px-4 py-2">
                <div className="flex h-full flex-col gap-4">
                  {paper_data.references?.map((ref, id) => (
                    <div
                      key={id}
                      className="flex flex-col justify-center gap-2 border-b border-accent border-gray-300 px-2"
                    >
                      <span className="text-lg font-extrabold">
                        <a
                          href={ref.url}
                          className="mr-2 text-wrap underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {ref.title}
                        </a>

                        <span className="ml-4 whitespace-nowrap text-sm font-light">
                          {ref.citationCount} citations
                        </span>
                      </span>
                      <span className="text-md w-full space-x-2">
                        <Badge variant="secondary" className="text-md">
                          <a
                            href={authorURL(
                              ref.authors[0]?.authorId,
                              ref.authors[0]?.name,
                            )}
                            className="mr-2 text-wrap underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {ref.authors[0]?.name}
                          </a>
                        </Badge>
                        {
                          ref.fieldsOfStudy?.map((field) => (
                            <span className="text-sm font-light">{field}</span>
                          ))[0]
                        }
                        <span className="text-sm font-light">{ref.year}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="citation">
              <ScrollArea className="h-[25rem] rounded-lg border px-4 py-2">
                <div className="flex h-full flex-col gap-4">
                  {paper_data.citations?.map((ref, id) => (
                    <div
                      key={id}
                      className="flex flex-col justify-center gap-2 border-b border-accent border-gray-300 px-2"
                    >
                      <span className="text-lg font-extrabold">
                        <a
                          href={ref.url}
                          className="mr-2 text-wrap underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {ref.title}
                        </a>
                        <span className="ml-4 whitespace-nowrap text-sm font-light">
                          {ref.citationCount} citations
                        </span>
                      </span>
                      <span className="text-md w-full space-x-2">
                        <Badge variant="secondary" className="text-md">
                          <a
                            href={authorURL(
                              ref.authors[0]?.authorId,
                              ref.authors[0]?.name,
                            )}
                            className="mr-2 text-wrap underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {ref.authors[0]?.name}
                          </a>
                        </Badge>
                        {
                          ref.fieldsOfStudy?.map((field) => (
                            <span className="text-sm font-light">{field}</span>
                          ))[0]
                        }
                        <span className="text-sm font-light">{ref.year}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default function PaperSurf() {
  const {
    mutate: lda_mutate,
    data: lda_data,
    isLoading: lda_isLoading,
  } = api.scholar.lda.useMutation();

  const [clickNodeId, setClickNodeId] = useState<string | null>(null);
  const onSubmit = async (values: z.infer<typeof inputFormSchema>) => {
    console.log("gi");
    lda_mutate({
      input: values.positive.split(", "),
      filter_input: values.negative.split(", "),
      stopwords: values.stopwords.split(", "),
      sweeps: values.precision,
    });
  };

  return (
    <main className="relative h-screen w-screen items-center justify-center">
      <div className="flex h-full w-full">
        <div className="flex h-full w-3/5 flex-col items-center justify-center">
          <div className="flex h-full items-center justify-center">
            {lda_isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-black"></div>
                <span className="mt-4">
                  Fetching may take a long time on the first try...
                </span>
              </div>
            ) : !lda_data ? (
              <div className="flex items-center justify-center">
                <span>Search for a topic</span>
              </div>
            ) : (
              <RenderGraph
                graphData={lda_data}
                clickNodeId={clickNodeId}
                setClickNodeId={setClickNodeId}
              />
            )}
          </div>
        </div>

        <div className="flex h-full w-2/5 flex-col items-center justify-center gap-6 overflow-hidden border border-gray-300">
          <div className="flex h-full w-full flex-col overflow-auto">
            <div className="flex h-full w-full flex-col gap-4 p-6">
              <Accordion type="single" defaultValue="paperinfo" collapsible>
                <AccordionItem value="paperinfo">
                  <AccordionTrigger className="text-xl font-bold">
                    Paper Info
                  </AccordionTrigger>
                  <AccordionContent>
                    {clickNodeId != null && <PaperInfo paperId={clickNodeId} />}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/* line sep */}
              <Accordion type="single" defaultValue="search" collapsible>
                <AccordionItem value="search">
                  <AccordionTrigger className="text-xl font-bold">
                    Paper Graph Search
                  </AccordionTrigger>
                  <AccordionContent>
                    <InputForm onSubmit={onSubmit} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
