import dynamic from "next/dynamic";

export const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});
