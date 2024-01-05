import { ResponsiveHeatMap } from "@nivo/heatmap";

const MyColorBar: React.FC<{
  min?: number;
  max?: number;
}> = ({ min, max }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ResponsiveHeatMap
        data={[]}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        colors={{
          type: "diverging",
          scheme: "red_yellow_blue",
          divergeAt: 0.5,
          minValue: min, //-100000,
          maxValue: max, //100000,
        }}
        emptyColor="#555555"
        legends={[
          {
            anchor: "bottom",
            translateX: 0,
            translateY: 30,
            length: 400,
            thickness: 8,
            direction: "row",
            tickPosition: "after",
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            tickFormat: ">-.2s",
            title: "Value →",
            titleAlign: "start",
            titleOffset: 4,
          },
        ]}
      />
    </div>
  );
};

export default MyColorBar;
