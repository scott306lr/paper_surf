/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useWindowSize } from "@react-hook/window-size";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import React, { useEffect } from "react";
import { forceCollide } from "d3-force";

export interface CGraphData {
  nodes: { id: string | number; label: string | number; size: number }[];
  links: {
    source: string | number;
    target: string | number;
    strength: number;
  }[];
}

const CGraph2D: React.FC<{
  graphData: CGraphData;
}> = ({ graphData }) => {
  const [width, height] = useWindowSize();
  const graphRef = React.useRef<ForceGraphMethods | null>(null);

  // useEffect(() => {
  //   const graph = graphRef.current;
  //   if (graph) {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  //     graph
  //       .d3Force("link")
  //       ?.distance(
  //         (link: CGraphData["links"][0]) => 5 + (1 - link?.strength ?? 0.5) * 5,
  //       )
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //       ?.strength(
  //         (link: CGraphData["links"][0]) => (link?.strength ?? 0.5) / 2 + 0.1,
  //       );
  //   }
  // }, [graphRef]);

  // useEffect(() => {
  //   const graph = graphRef.current;
  //   // add collision force
  //   if (graph)
  //     graph.d3Force(
  //       "collision",
  //       forceCollide((node) => Math.sqrt(100 / (node.level + 1))),
  //     );
  // }, []);

  return (
    <ForceGraph2D
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      ref={graphRef as any}
      height={height}
      width={width}
      graphData={graphData}
      nodeVal={(node) => node?.size ?? 10}
      nodeAutoColorBy={(node) => `${Math.round(node?.year)}`}
      // onNodeDragEnd={(node) => {
      //   node.fx = node.x;
      //   node.fy = node.y;
      // }}
    />
  );
};

export default CGraph2D;
