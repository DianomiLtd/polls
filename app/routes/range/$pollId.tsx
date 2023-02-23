import type { LoaderArgs } from "@remix-run/cloudflare"; // or cloudflare/deno
import { json } from "@remix-run/cloudflare"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import {
  CircularGaugeComponent,
  AxesDirective,
  AxisDirective,
  PointersDirective,
  PointerDirective,
  Inject,
  GaugeTooltip,
  RangesDirective,
  RangeDirective
} from "@syncfusion/ej2-react-circulargauge";
import { registerLicense } from "@syncfusion/ej2-base";
import { useState } from "react";
import { LinearGaugeComponent } from "@syncfusion/ej2-react-lineargauge";

registerLicense(
  "ORg4AjUWIQA/Gnt2VVhkQlFacldJXnxIfEx0RWFab1t6cVNMZFxBNQtUQF1hSn5Rd0VjXHpZcXBVRWlV"
);

const mySchema = z.number();

type Result = {answer: number, results: number;}

type Question = {
  id: number;
  question: string;
  answer: {
    min: number;
    max: number;
    default: number;
  };
  results: Array<Result>
};

type Error = {
  error: string;
};

export const loader = async ({ params }: LoaderArgs) => {
  let response: Question | Error;
  try {
    mySchema.parse(Number(params.pollId));
    const res = await fetch(`${process.env.POLL_API}/?id=${params.pollId}`);
    const results: Result[] = await res.json();
    console.log(results);
    response = {
      id: Number(params.pollId),
      question:
        "At what age do you think you will be able to retire comfortably?",
      answer: {
        min: 55,
        max: 85,
        default: 65
      },
      results: results
    };
  } catch {
    response = { error: `The id "${params.pollId}" does not exist` };
  }
  return json(response);
};

export default function Poll() {
  const data = useLoaderData<typeof loader>();
  if ("error" in data) {
    return <div>ERROR: {data.error}</div>;
  }
  const { answer, question } = data;
  const getDragValue = (a) => {
    console.log(a.currentValue);
  };
  return (
    <>
      <div>{question}</div>
      <div>
        <LinearGaugeComponent
          dragEnd={getDragValue}
          allowMargin={false}
          height="100px"
          width="100%"
          orientation="Horizontal"
          margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
        >
          <AxesDirective>
            <AxisDirective
              minimum={answer.min}
              maximum={answer.max}
              lineStyle={{ width: 10, color: "#999" }}
              minorTicks={{ interval: 1 }}
            >
              <PointersDirective>
                <PointerDirective
                  value={answer.default}
                  width={15}
                  type="Bar"
                  enableDrag={true}
                ></PointerDirective>
              </PointersDirective>
            </AxisDirective>
          </AxesDirective>
        </LinearGaugeComponent>
      </div>
    </>
  );
}
