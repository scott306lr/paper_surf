import { ResponsiveBoxPlot } from "@nivo/boxplot";

const MyBoxPlot: React.FC<{
  data: { value: number }[];
  min?: number;
  max?: number;
  colors?: string[];
  markerValue?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}> = ({ data, min, max, colors, markerValue, margin }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ResponsiveBoxPlot
        data={data}
        layout="horizontal"
        quantiles={[0, 0.25, 0.5, 0.75, 1.0]}
        margin={margin ?? { left: 20, right: 20, bottom: 24, top: 0 }}
        minValue={min}
        maxValue={max}
        padding={0.2}
        enableGridX={true}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          // legend: "group",
          // legendPosition: "middle",
          // legendOffset: 32,
          tickValues: 5,
        }}
        axisLeft={null}
        colors={colors ?? { scheme: "nivo" }}
        borderRadius={2}
        borderWidth={2}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.3]],
        }}
        medianWidth={2}
        medianColor={{
          from: "color",
          modifiers: [["darker", 0.3]],
        }}
        whiskerEndSize={0.6}
        whiskerColor={{
          from: "color",
          modifiers: [["darker", 0.3]],
        }}
        motionConfig="stiff"
        markers={
          markerValue != undefined
            ? [
                {
                  axis: "x",
                  value: markerValue,
                  lineStyle: { stroke: "darkred", strokeWidth: 3 },
                  legend: `${markerValue}`,
                  legendPosition: "top",
                  textStyle: { fill: "darkred", fontSize: 16 },
                },
              ]
            : undefined
        }
      />
    </div>
  );
};

export default MyBoxPlot;
