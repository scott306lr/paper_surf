import { api } from "~/utils/api";
import { to_lda, keyWord_to_graph } from "~/utils/graph_utils";

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

export default function PaperSurf() {
  const [searchInput, setSearchInput] = useState("play chess");
  const [stopwordInput, setStopwordInput] = useState("");
  // const search_mutation = api.scholar.searchByInput.useMutation();
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

  // const handleLDA = async (
  //   positive: string[],
  //   negative: string[],
  //   stopwords: string[],
  // ) => {
  //   const search_result = await search_mutateAsync({
  //     input: positive,
  //     filter_input: negative,
  //   });

  //   if (search_result != null)
  //     lda_mutate({
  //       paperID_array: to_lda(search_result),
  //       stopwords: stopwords,
  //     });
  // };

  const onSubmit = async (values: z.infer<typeof inputFormSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

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

  const graph = keyWord_to_graph(lda_data?.[1] ?? []);
  const graphData: CGraphData = {
    nodes: graph.nodes.map((node) => ({
      id: `${node.topic}`,
      label: `${node.keyWord.splice(0, 2).join(" ")}`,
      size: 4,
      level: 0,
      color: ["red", "green", "blue"][node.topic % 3]!,
      drawType: "text",
    })),

    links: graph.links.map((link) => ({
      source: `${link.source}`,
      target: `${link.target}`,
      strength: 4,
    })),
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
            ) : (
              <CitationGraph graphData={graphData} />
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <Panel defaultSize={20} minSize={20} maxSize={20}>
          <div className="flex h-full items-center justify-center p-6">
            <span>Panel 3</span>
          </div>
        </Panel>
      </ResizablePanelGroup>
    </main>
  );
}
