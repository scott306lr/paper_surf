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

export default function PaperSurf() {
  const [input, setInput] = useState("play chess");
  const search_mutation = api.scholar.searchByInput.useMutation();
  const { mutate: lda_mutate, data, isLoading } = api.scholar.lda.useMutation();

  const handleLDA = async (input: string[]) => {
    const search_result = await search_mutation.mutateAsync({
      input: input,
      filter_input: [],
    });

    if (search_result != null)
      lda_mutate({ paperID_array: to_lda(search_result) });
  };

  const graph = keyWord_to_graph(data?.[1] ?? []);
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
        <ResizablePanel defaultSize={70}>
          <div className="flex h-full items-center justify-center p-6">
            <CitationGraph graphData={graphData} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel minSize={20} defaultSize={30}>
          <div className="flex h-full items-center justify-center p-6">
            {/* <span className="font-semibold">Content</span> */}
            {/* <Combobox></Combobox> */}
            <Input
              type="text"
              placeholder="Search"
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={() => handleLDA(input.split(" "))}>Search</Button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
