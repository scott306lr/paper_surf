/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useWindowSize } from "@react-hook/window-size";
import ForceGraph2D, {
  NodeObject,
  type ForceGraphMethods,
} from "react-force-graph-2d";
import React, { useEffect } from "react";
import { forceCollide } from "d3-force";

export interface CGraphData {
  nodes: {
    id: string;
    label: string;
    size: number;
    level: number;
    color: string;
    drawType: "circle" | "text";
  }[];
  links: {
    source: string;
    target: string;
    strength: number;
  }[];
}

const CGraph2D: React.FC<{
  graphData: CGraphData;
}> = ({ graphData }) => {
  const [width, height] = useWindowSize();
  const graphRef = React.useRef<ForceGraphMethods | null>(null);

  function nodePaint(
    node: NodeObject<
      NodeObject<{
        id: string;
        label: string;
        size: number;
        color: string;
        drawType: string;
        level: number;
      }>
    >,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    ctx.fillStyle = node.color;
    console.log(node, ctx);
    if (node.drawType == "text") {
      const label = node.label;
      const fontSize = 16 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(
        (n) => n + fontSize * 0.2,
      ); // some padding
      const bgDim = {
        textWidth: textWidth + fontSize * 0.2,
        textHeight: fontSize + fontSize * 0.2,
      };

      ctx.fillStyle = "rgba(255, 155, 155, 0.8)";
      // ctx.fillStyle = node.color;
      ctx.fillRect(
        node.x - bgDim.textWidth / 2,
        node.y - bgDim.textHeight / 2,
        bgDim.textWidth,
        bgDim.textHeight,
      );

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = node.color;
      ctx.fillText(label, node.x, node.y);

      node.__bgDim = bgDim;
    } else if (node.drawType == "circle") {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI, false);
      ctx.fill();
    }
  }

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
      nodeVal={(node) => 100 / (node.level + 1)}
      graphData={graphData}
      nodeVal={(node) => node?.size ?? 10}
      // nodeAutoColorBy={"id"}
      nodeCanvasObject={(node, ctx, globalScale) =>
        nodePaint(node, ctx, globalScale)
      }
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.fillStyle = color;
        const bgDim = node.__bgDim;
        bgDim &&
          ctx.fillRect(
            node.x - bgDim.textWidth / 2,
            node.y - bgDim.textHeight / 2,
            bgDim.textWidth,
            bgDim.textHeight,
          );
      }}
    />
  );
};

export default CGraph2D;
