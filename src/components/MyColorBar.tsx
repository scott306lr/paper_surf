import { ResponsiveHeatMap } from "@nivo/heatmap";

const MyColorBar: React.FC<{
  min?: number;
  max?: number;
}> = ({ min, max }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ResponsiveHeatMap
        data={[]}
        margin={{ right: 60, left: 60 }}
        colors={{
          type: "diverging",
          scheme: "yellow_green_blue",
          divergeAt: 0.5,
          minValue: min, //-100000,
          maxValue: max, //100000,
        }}
        emptyColor="#555555"
        legends={[
          {
            anchor: "bottom",
            translateX: 0,
            translateY: -30,
            length: 400,
            thickness: 12,
            direction: "row",
            tickPosition: "after",
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            tickFormat: " >-.0~f",
            title: "Year →",
            titleAlign: "start",
            titleOffset: 8,
          },
        ]}
      />
    </div>
  );
};

export default MyColorBar;
