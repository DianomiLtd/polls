import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Category,
  ColumnSeries,
  DataLabel,
  Highlight
} from "@syncfusion/ej2-react-charts";
import { Browser } from "@syncfusion/ej2-base";
import { useEffect, useState } from "react";
import { DianomiContextFeed } from "@dianomi/react-contextfeed";
import styles from "./bar.css";
import type { Question } from "~/routes/gauge/$pollId";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

function Bar({ id, api_url }: { id: number; api_url: string }) {
  const [results, setResults] = useState<
    Array<{ answer: string; results: number }>
  >([]);
  const [maximum, setMaximum] = useState<null | number>(null);
  useEffect(() => {
    async function fetchData() {
      const data = await fetch(`${api_url}/question?id=${id}`);
      const results: Question = await data.json();
      let highest: number | null = null;
      results.results.forEach(({ answer, results }) => {
        if (!highest) {
          highest = results;
          return;
        }
        if (results > highest) {
          highest = results;
        }
      });
      setMaximum(highest);
      setResults(results.results);
    }
    fetchData();
  }, [api_url, id]);

  return (
    <>
      <ChartComponent
        id="charts"
        style={{ textAlign: "center", height: "70%" }}
        legendSettings={{ enableHighlight: true }}
        primaryXAxis={{
          labelIntersectAction: Browser.isDevice ? "None" : "Trim",
          labelRotation: Browser.isDevice ? -45 : 0,
          valueType: "Category",
          interval: 1,
          majorGridLines: { width: 0 },
          majorTickLines: { width: 0 },
          edgeLabelPlacement: "Shift"
        }}
        primaryYAxis={{
          majorTickLines: { width: 0 },
          lineStyle: { width: 0 },
          maximum: maximum,
          interval: maximum ? Math.round((maximum + 2) / 3) : 10
        }}
        chartArea={{ border: { width: 0 } }}
        tooltip={{
          enable: true,
          shared: true
        }}
        width={"99%"}
      >
        <Inject
          services={[ColumnSeries, Legend, Category, DataLabel, Highlight]}
        />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={results}
            xName="answer"
            columnSpacing={0.1}
            yName="results"
            type="Column"
          ></SeriesDirective>
        </SeriesCollectionDirective>
      </ChartComponent>
      <DianomiContextFeed style={{ height: "50%", width: "100%" }} id={1094} />
    </>
  );
}

export default Bar;
