/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useWindowSize } from "@react-hook/window-size";
// import { ForceGraph3D } from "~/components/ForceGraphWrapper";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import ForceGraph3D, { type ForceGraphMethods } from "react-force-graph-3d";
import { type Renderer } from "three";
import React, { useEffect } from "react";

const extraRenderers = [new CSS2DRenderer()];

export interface CGraphData {
  nodes: { id: string | number; label: string | number; size: number }[];
  links: {
    source: string | number;
    target: string | number;
    strength: number;
  }[];
}

const CGraph: React.FC<{
  graphData: CGraphData;
}> = ({ graphData }) => {
  const [width, height] = useWindowSize();
  const graphRef = React.useRef<ForceGraphMethods | null>(null);

  useEffect(() => {
    const graph = graphRef.current;
    if (graph) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      graph
        .d3Force("link")
        ?.distance(
          (link: CGraphData["links"][0]) => 5 + (1 - link?.strength ?? 0.5) * 5,
        )
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ?.strength(
          (link: CGraphData["links"][0]) => (link?.strength ?? 0.5) / 2 + 0.1,
        );
    }
  }, [graphRef]);

  return (
    <ForceGraph3D
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      ref={graphRef as any}
      extraRenderers={extraRenderers as unknown as Renderer[]}
      height={height}
      width={width}
      graphData={graphData}
      nodeVal={(node) => node?.size ?? 1}
      nodeAutoColorBy={"id"}
      nodeThreeObjectExtend={true}
      nodeThreeObject={(node) => {
        const nodeEl = document.createElement("div");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        nodeEl.textContent = node.label;
        nodeEl.style.color = "white";
        nodeEl.style.fontSize = "18px";
        return new CSS2DObject(nodeEl);
      }}
    />
  );
};

export default CGraph;
