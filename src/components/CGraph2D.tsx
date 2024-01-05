/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useWindowSize } from "@react-hook/window-size";
import ForceGraph2D, {
  type NodeObject,
  type ForceGraphMethods,
  type LinkObject,
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
    opacity: number;
    myX: number;
    myY: number;
  }[];
  links: {
    id: string;
    source: string;
    target: string;
    opacity: number;
    strength: number;
  }[];
}

const NODE_R = 8; //8;

const getColorCode = (color: string, opacity: number): string => {
  if (color == "red") {
    return `rgba(255, 0, 0, ${opacity})`;
  } else if (color == "green") {
    return `rgba(0, 255, 0, ${opacity})`;
  } else {
    return `rgba(0, 0, 255, ${opacity})`;
  }
};
const CGraph2D: React.FC<{
  graphData: CGraphData;
  hoverNodeId?: string | null;
  highlightNodeIds?: Set<string>;
  highlightLinkIds?: Set<string>;
  handleNodeHover?: (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>>,
  ) => void;
  handleLinkHover?: (link: LinkObject<CGraphData["links"][0]>) => void;
  handleClickNode?: (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>>,
  ) => void;
}> = ({
  graphData,
  hoverNodeId,
  highlightNodeIds,
  highlightLinkIds,
  handleNodeHover,
  handleLinkHover,
  handleClickNode,
}) => {
  const [w_width, w_height] = useWindowSize();
  const width = w_width * 0.5;
  const height = w_height * 0.8;

  const graphRef = React.useRef<ForceGraphMethods | null>(null);

  const nodePaint = useCallback(
    (
      node: NodeObject<
        NodeObject<CGraphData["nodes"][0]> & CGraphData["nodes"][0]
      >,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      //random
      node.fx = node.myX * width;
      node.fy = node.myY * height;
      node.x = node.myX * width;
      node.y = node.myY * height;

      const x = node.x ?? 0;
      const y = node.y ?? 0;

      ctx.fillStyle = node.color;
      if (node.drawType == "text") {
        const label = node.label;
        const fontSize = node.size / globalScale;
        const textWidth = ctx.measureText(label).width;
        const bgDim = {
          textWidth: textWidth + fontSize * 0.2,
          textHeight: fontSize + fontSize * 0.2,
        };

        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "rgba(255, 155, 155, 0.3)";
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
        if (highlightNodeIds?.has(node.id)) {
          ctx.beginPath();
          ctx.arc(x, y, node.size * 1.2 + 2, 0, 2 * Math.PI, false);
          ctx.fill();

          //label
          const label = node.label;
          const fontSize = 16 / globalScale;

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillText(label, x, y);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, node.size, 0, 2 * Math.PI, false);
          ctx.fill();

          //label
          const label = node.label;
          const fontSize = 16 / globalScale;

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillText(label, x, y);
        }
      }
    },
    [hoverNodeId],
  );
  useEffect(() => {
    const graph = graphRef.current;
    // add collision force
    if (graph) {
      graph.zoomToFit(400);
      // graph?.d3Force("link").distance(400);
    }
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
      enableNodeDrag={false}
      nodeCanvasObject={nodePaint}
      nodeCanvasObjectMode={undefined}
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={(link) =>
        highlightLinkIds?.has(link.id) ? 8 : 0
      }
      linkDirectionalParticleSpeed={0.005}
      linkCanvasObject={(link, ctx) => {
        const start = link.source;
        const end = link.target;
        ctx.beginPath();
        ctx.strokeStyle = link.color;
        ctx.lineWidth = highlightLinkIds?.has(link.id) ? 5 : 0.1;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }}
      onNodeHover={handleNodeHover}
      onLinkHover={handleLinkHover}
      onNodeClick={handleClickNode}
      linkOpacity={0.3}
    />
  );
};

export default CGraph2D;
