import React from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  PolarSeries,
  Category,
  ColumnSeries
} from "@syncfusion/ej2-react-charts";
import type { AxisModel } from "@syncfusion/ej2-react-charts";

const columnData = [
  { x: "1", y: 3 },
  { x: "2", y: 4 },
  { x: "3", y: 11 },
  { x: "4", y: 6 },
  { x: "5", y: 1 },
  { x: "6", y: 2 },
  { x: "7", y: 3 },
  { x: "8", y: 12 },
  { x: "9", y: 6 },
  { x: "10", y: 3 }
];

export default function RadarChart() {
  const primaryxAxis: AxisModel = { title: "Age", valueType: "Category" };
  const primaryyAxis: AxisModel = {
    minimum: 0,
    maximum: 16,
    interval: 2,
  };

  return (
    <ChartComponent
      id="charts"
      primaryXAxis={primaryxAxis}
      primaryYAxis={primaryyAxis}
    >
      <Inject services={[PolarSeries, ColumnSeries, Category]} />
      <SeriesCollectionDirective>
        <SeriesDirective
          dataSource={columnData}
          xName="x"
          yName="y"
          type="Polar"
          drawType="Column"
          fill="black"
        ></SeriesDirective>
      </SeriesCollectionDirective>
    </ChartComponent>
  );
}
