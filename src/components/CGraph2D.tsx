/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useWindowSize } from "@react-hook/window-size";
import ForceGraph2D, {
  type NodeObject,
  type ForceGraphMethods,
  type LinkObject,
} from "react-force-graph-2d";
import React, { useCallback } from "react";
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
    type: string;
    color: string;
  }[];
}

const NODE_R = 2; //8;

const CGraph2D: React.FC<{
  graphData: CGraphData;
  hoverNodeId?: string | null;
  clickNodeId?: string | null;
  highlightNodeIds?: Set<string>;
  highlightLinkIds?: Set<string>;
  handleNodeHover?: (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>>,
  ) => void;
  handleLinkHover?: (link: LinkObject<CGraphData["links"][0]>) => void;
  handleClickNode?: (
    node: NodeObject<NodeObject<CGraphData["nodes"][0]>>,
  ) => void;
  showTopic?: boolean;
  showPaper?: boolean;
  showAuthor?: boolean;
}> = ({
  graphData,
  hoverNodeId,
  clickNodeId,
  highlightNodeIds,
  highlightLinkIds,
  handleNodeHover,
  handleLinkHover,
  handleClickNode,
  showTopic,
  showPaper,
  showAuthor,
}) => {
  const [w_width, w_height] = useWindowSize();
  const width = w_width * 0.6;
  const height = w_height * 1;

  const graphRef = React.useRef<ForceGraphMethods | null>(null);
  const no_focus = hoverNodeId == null && clickNodeId == null;

  const nodePaint = useCallback(
    (
      node: NodeObject<
        NodeObject<CGraphData["nodes"][0]> & CGraphData["nodes"][0]
      >,
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      //random
      node.fx = node.myX * width * 3;
      node.fy = node.myY * height * 3;
      node.x = node.fx;
      node.y = node.fy;

      const x = node.x ?? 0;
      const y = node.y ?? 0;

      if (node.drawType == "text") {
        if (!showTopic) return;
        const label = node.label;
        const fontSize = node.size / globalScale;
        const textWidth = (label.length * fontSize) / 2; //ctx.measureText(label).width;
        const bgDim = {
          textWidth: textWidth + fontSize * 0.4,
          textHeight: fontSize + fontSize * 0.4,
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
          ctx.fillStyle = convertHexToRGBA(node.color, 0.8);
          ctx.fillRect(
            node.__hDim[0],
            node.__hDim[1],
            node.__hDim[2],
            node.__hDim[3],
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = convertHexToRGBA("#FFFFFF", 1);
          ctx.fillText(label, x, y);
        } else {
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = convertHexToRGBA(node.color, 0.3);
          // ctx.fillRect(
          //   node.__hDim[0],
          //   node.__hDim[1],
          //   node.__hDim[2],
          //   node.__hDim[3],
          // );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = convertHexToRGBA(node.color, no_focus ? 1 : 0.2);
          ctx.fillText(label, x, y);
        }
      } else if (node.drawType == "circle") {
        if (!showPaper) return;

        if (
          hoverNodeId === node.id ||
          (hoverNodeId == null && clickNodeId === node.id)
        ) {
          node.__hType = "circle";
          node.__hDim = [x, y, node.size * 1.5 + 5, 0];
          ctx.beginPath();
          ctx.arc(
            node.__hDim[0],
            node.__hDim[1],
            node.__hDim[2],
            node.__hDim[3],
            2 * Math.PI,
            false,
          );
          ctx.fillStyle = convertHexToRGBA(node.color, 1);
          ctx.fill();

          //label
          if (showAuthor) {
            const label = node.label;
            const fontSize = 16 / globalScale;

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.lineWidth = 2;
            ctx.strokeStyle = convertHexToRGBA("#FFFFFF", 1);
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.lineJoin = "round";
            ctx.strokeText(label, x, y - fontSize);
            ctx.fillText(label, x, y - fontSize);
          }
        } else if (highlightNodeIds?.has(node.id)) {
          node.__hType = "circle";
          node.__hDim = [x, y, node.size * 1.5 + 5, 0];

          ctx.beginPath();
          ctx.arc(
            node.__hDim[0],
            node.__hDim[1],
            node.__hDim[2],
            node.__hDim[3],
            2 * Math.PI,
            false,
          );
          ctx.fillStyle = convertHexToRGBA(node.color, 1);
          ctx.fill();

          //label
          if (showAuthor) {
            const label = node.label;
            const fontSize = 16 / globalScale;

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.lineWidth = 2;
            ctx.strokeStyle = convertHexToRGBA("#FFFFFF", 1);
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.lineJoin = "round";
            ctx.strokeText(label, x, y - fontSize);
            ctx.fillText(label, x, y - fontSize);
          }
        } else {
          node.__hType = "circle";
          node.__hDim = [x, y, node.size * 1.5, 0];

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
          // const year = Number(label.split(", ")[1]);
          ctx.fillStyle = convertHexToRGBA(node.color, no_focus ? 0.6 : 0.2);

          // Convert HSL to CSS color format

          ctx.fill();

          //label
          if (showAuthor) {
            const fontSize = 16 / globalScale;

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.shadowColor = convertHexToRGBA("#FFFFFF", 0.3);
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = convertHexToRGBA("#FFFFFF", no_focus ? 1 : 0.2);
            ctx.fillStyle = convertHexToRGBA("#000000", no_focus ? 0.8 : 0.2);
            ctx.lineJoin = "round";
            // ctx.strokeText(`${year}`, x, y - fontSize);
            // ctx.fillText(`${year}`, x, y - fontSize);
            ctx.strokeText(label, x, y - fontSize);
            ctx.fillText(label, x, y - fontSize);
          }
        }
      }
    },
    [
      hoverNodeId,
      clickNodeId,
      highlightNodeIds,
      showTopic,
      showPaper,
      showAuthor,
    ],
  );

  // useEffect(() => {
  //   const graph = graphRef.current;
  //   // add collision force
  //   // if (graph) {
  //   //   graph.d3Force("collide", forceCollide(NODE_R * 1.5));
  //   // }

  //   if (graph) {
  //     graph.zoomToFit(400);
  //   }
  // }, [graphRef, graphData]);

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

        if (node.__hType == "circle" && showPaper) {
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
        } else if (node.__hType == "square" && showTopic) {
          ctx.fillRect(
            node.__hDim[0],
            node.__hDim[1],
            node.__hDim[2],
            node.__hDim[3],
          );
        }
      }}
      linkDirectionalParticles={5}
      linkDirectionalParticleWidth={(link) => {
        if (link.type == "Topic-Paper") {
          return link.type !== "Topic-Paper" &&
            highlightLinkIds?.has(link.id) &&
            showPaper &&
            showTopic
            ? 8
            : 0;
        } else {
          return link.type !== "Topic-Paper" &&
            highlightLinkIds?.has(link.id) &&
            showPaper
            ? 8
            : 0;
        }
      }}
      linkDirectionalParticleSpeed={0.002}
      linkCanvasObject={(link, ctx) => {
        if (!showPaper) return;

        const start = link.source;
        const end = link.target;

        if (link.type === "Topic-Paper") {
          if (highlightLinkIds?.has(link.id)) {
            ctx.strokeStyle = convertHexToRGBA(
              link.color,
              !showPaper ? 0 : no_focus ? 1 : 0.6,
            );
          } else {
            ctx.strokeStyle = convertHexToRGBA(link.color, 0);
          }
        } else {
          if (highlightLinkIds?.has(link.id)) {
            ctx.strokeStyle = convertHexToRGBA(
              link.color,
              !showPaper ? 0 : no_focus ? 1 : 0.6,
            );
          } else {
            ctx.strokeStyle = convertHexToRGBA(
              link.color,
              !showPaper ? 0 : no_focus ? 1 : 0.6,
            );
          }
        }

        ctx.beginPath();
        ctx.lineWidth = highlightLinkIds?.has(link.id) ? 4 : 0.5;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }}
      onNodeHover={(node) => {
        if (clickNodeId == null) handleNodeHover(node);
      }}
      // onLinkHover={handleLinkHover}
      onNodeClick={(node) => {
        if (clickNodeId != node?.id) {
          handleClickNode(node);
        } else {
          handleClickNode(null);
        }
        handleNodeHover(node);
      }}
    />
  );
};

export default CGraph2D;
