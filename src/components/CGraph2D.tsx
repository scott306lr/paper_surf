/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useWindowSize } from "@react-hook/window-size";
import ForceGraph2D, {
  type NodeObject,
  type ForceGraphMethods,
  LinkObject,
} from "react-force-graph-2d";
import React, { useCallback, useEffect } from "react";
import { forceCollide } from "d3-force";

export interface CGraphData {
  nodes: {
    id: string;
    label: string;
    size: number;
    level: number;
    color: string;
    drawType: "circle" | "text";
    neighbors: string[];
    links: string[];
  }[];
  links: {
    id: string;
    source: string;
    target: string;
    strength: number;
  }[];
}

const NODE_R = 8;

const CGraph2D: React.FC<{
  graphData: CGraphData;
  hoverNodeId?: string | null;
  highlightNodeIds?: Set<string>;
  highlightLinkIds?: Set<string>;
  handleNodeHover?: (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>>,
  ) => void;
  handleLinkHover?: (link: LinkObject<CGraphData["links"][0]>) => void;
}> = ({
  graphData,
  hoverNodeId,
  highlightNodeIds,
  highlightLinkIds,
  handleNodeHover,
  handleLinkHover,
}) => {
  const [width, height] = useWindowSize();
  const graphRef = React.useRef<ForceGraphMethods | null>(null);
  // console.log("2D rerendered.");

  // function nodePaint(
  //   node: NodeObject<
  //     NodeObject<CGraphData["nodes"][0]> & CGraphData["nodes"][0]
  //   >,
  //   ctx: CanvasRenderingContext2D,
  //   globalScale: number,
  // ) {
  //   const x = node.x ?? 0;
  //   const y = node.y ?? 0;

  //   ctx.fillStyle = node.color;
  //   if (node.drawType == "text") {
  //     const label = node.label;
  //     const fontSize = 16 / globalScale;
  //     const textWidth = ctx.measureText(label).width;
  //     const bgDim = {
  //       textWidth: textWidth + fontSize * 0.2,
  //       textHeight: fontSize + fontSize * 0.2,
  //     };

  //     ctx.font = `${fontSize}px Sans-Serif`;
  //     ctx.fillStyle = "rgba(255, 155, 155, 0.8)";
  //     ctx.fillRect(
  //       x - bgDim.textWidth / 2,
  //       y - bgDim.textHeight / 2,
  //       bgDim.textWidth,
  //       bgDim.textHeight,
  //     );

  //     ctx.textAlign = "center";
  //     ctx.textBaseline = "middle";
  //     ctx.fillStyle = node.color;
  //     ctx.fillText(label, x, y);

  //     node.__bgDim = bgDim;
  //   } else if (node.drawType == "circle") {
  //     ctx.beginPath();
  //     ctx.arc(x, y, node.size, 0, 2 * Math.PI, false);
  //     ctx.fill();
  //   }

  //   if (highlightNodeIds?.has(node.id)) {
  //     ctx.beginPath();
  //     ctx.arc(x, y, NODE_R * 1.4, 0, 2 * Math.PI, false);
  //     ctx.fillStyle = node.id === hoverNodeId ? "red" : "orange";
  //     ctx.fill();
  //   }
  // }

  const nodePaint = useCallback(
    (
      node: NodeObject<
        NodeObject<CGraphData["nodes"][0]> & CGraphData["nodes"][0]
      >,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      ctx.fillStyle = node.color;
      if (node.drawType == "text") {
        const label = node.label;
        const fontSize = 16 / globalScale;
        const textWidth = ctx.measureText(label).width;
        const bgDim = {
          textWidth: textWidth + fontSize * 0.2,
          textHeight: fontSize + fontSize * 0.2,
        };

        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "rgba(255, 155, 155, 0.8)";
        ctx.fillRect(
          x - bgDim.textWidth / 2,
          y - bgDim.textHeight / 2,
          bgDim.textWidth,
          bgDim.textHeight,
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = node.color;
        ctx.fillText(label, x, y);

        node.__bgDim = bgDim;
      } else if (node.drawType == "circle") {
        ctx.beginPath();
        ctx.arc(x, y, node.size, 0, 2 * Math.PI, false);
        ctx.fill();
      }

      // if (highlightNodeIds?.has(node.id)) {
      //   ctx.beginPath();
      //   ctx.arc(x, y, NODE_R * 1.4, 0, 2 * Math.PI, false);
      //   ctx.fillStyle = node.id === hoverNodeId ? "red" : "orange";
      //   ctx.fill();
      // }
    },
    [hoverNodeId],
  );

  // const paintRing = useCallback((node, ctx) => {
  //   // add ring just for highlighted nodes
  //   ctx.beginPath();
  //   ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
  //   ctx.fillStyle = node === hoverNode ? 'red' : 'orange';
  //   ctx.fill();
  // }, [hoverNode]);

  useEffect(() => {
    const graph = graphRef.current;
    // add collision force
    if (graph)
      graph.d3Force(
        "collision",
        forceCollide((node) => Math.sqrt(100 / (node.level + 1))),
      );
  }, []);

  return (
    <ForceGraph2D
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      ref={graphRef as any}
      height={height}
      width={width}
      graphData={graphData}
      nodeRelSize={NODE_R}
      autoPauseRedraw={false}
      nodeVal={(node) => node?.size ?? 10}
      nodeCanvasObject={nodePaint}
      // nodeCanvasObject={(node, ctx, globalScale) =>
      //   nodePaint(node, ctx, globalScale)
      // }
      // nodeCanvasObjectMode={(node) =>
      //   highlightNodeIds?.has(node.id) ? "before" : undefined
      // }
      nodeCanvasObjectMode={undefined}
      onNodeDragEnd={(node) => {
        node.fx = node.x;
        node.fy = node.y;
      }}
      linkWidth={(link) => (highlightLinkIds?.has(link.id) ? 5 : 1)}
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={(link) =>
        highlightLinkIds?.has(link.id) ? 4 : 0
      }
      linkDirectionalParticleSpeed={0.005}
      onNodeHover={handleNodeHover}
      // onLinkHover={handleLinkHover}
    />
  );
};

export default CGraph2D;
