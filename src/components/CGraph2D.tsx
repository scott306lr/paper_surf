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
import { convertHexToRGBA } from "~/lib/utils";

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
    year: number;
  }[];
  links: {
    id: string;
    source: string;
    target: string;
    opacity: number;
    strength: number;
  }[];
}

const NODE_R = 2; //8;


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
    const width = w_width * 0.6;
    const height = w_height * 1;

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

        if (node.drawType == "text") {
          const label = node.label;
          const fontSize = node.size / globalScale;
          const textWidth = ctx.measureText(label).width;
          const bgDim = {
            textWidth: textWidth + fontSize * 0.2,
            textHeight: fontSize + fontSize * 0.2,
          };

          node.__hType = "square";
          node.__hDim = [
            x - bgDim.textWidth / 2,
            y - bgDim.textHeight / 2,
            bgDim.textWidth,
            bgDim.textHeight,
          ];

          if (highlightNodeIds?.has(node.id)) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = convertHexToRGBA(node.color, 0.3);
            ctx.fillRect(
              node.__hDim[0],
              node.__hDim[1],
              node.__hDim[2],
              node.__hDim[3],
            );

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = convertHexToRGBA(node.color, 0.7);
          } else {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillRect(
              node.__hDim[0],
              node.__hDim[1],
              node.__hDim[2],
              node.__hDim[3],
            );

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = convertHexToRGBA(node.color, 0.3);
            ctx.fillText(label, x, y - fontSize * 1.2);
          }
        } else if (node.drawType == "circle") {
          if (hoverNodeId === node.id) {
            node.__hType = "circle";
            node.__hDim = [x, y, node.size * 1.2 + 2, 0];
            ctx.beginPath();
            ctx.arc(
              node.__hDim[0],
              node.__hDim[1],
              node.__hDim[2],
              node.__hDim[3],
              2 * Math.PI,
              false,
            );
            ctx.fillStyle = convertHexToRGBA(node.color, 0.3);
            ctx.fill();

            //label
            const label = node.label;
            const fontSize = 16 / globalScale;

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillText(label, x, y - fontSize * 1.2);
          } else if (highlightNodeIds?.has(node.id)) {
            node.__hType = "circle";
            node.__hDim = [x, y, node.size * 1.2 + 2, 0];

            ctx.beginPath();
            ctx.arc(
              node.__hDim[0],
              node.__hDim[1],
              node.__hDim[2],
              node.__hDim[3],
              2 * Math.PI,
              false,
            );
            ctx.fillStyle = convertHexToRGBA(node.color, 0.3);
            ctx.fill();

            //label
            const label = node.label;
            const fontSize = 16 / globalScale;

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillText(label, x, y - fontSize * 1.2);
          } else {
            node.__hType = "circle";
            node.__hDim = [x, y, node.size, 0];

            ctx.beginPath();
            ctx.arc(
              node.__hDim[0],
              node.__hDim[1],
              node.__hDim[2],
              node.__hDim[3],
              2 * Math.PI,
              false,
            );

            const label = node.label;
            const year = Number(label.split(", ")[1]);
            // write by chatgpt
            const normalizedValue = (year - 2000) / (2024 - 2000);
            const hue = 240 - normalizedValue * 240;
            const saturation = 100;
            const lightness = 50;
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;


            // Convert HSL to CSS color format

            ctx.fill();

            //label
            const fontSize = 16 / globalScale;

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillText(`${year}`, x, y - fontSize * 1.2);
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
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;

          if (node.__hType == "circle") {
            ctx.beginPath();
            ctx.arc(
              node.__hDim[0],
              node.__hDim[1],
              node.__hDim[2],
              node.__hDim[3],
              2 * Math.PI,
              false,
            );
            ctx.fill();
          } else if (node.__hType == "square") {
            ctx.fillRect(
              node.__hDim[0],
              node.__hDim[1],
              node.__hDim[2],
              node.__hDim[3],
            );
          }
        }}
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
