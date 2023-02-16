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
import RadarChart from "~/charts/radar";
import { LayoutGroup, motion } from "framer-motion";

registerLicense(
  "ORg4AjUWIQA/Gnt2VVhkQlFacldJXnxIfEx0RWFab1t6cVNMZFxBNQtUQF1hSn5Rd0VjXHpZcXBVRWlV"
);

const mySchema = z.number();

type Question = {
  id: number;
  question: string;
  answer: {
    min: number;
    max: number;
    default: number;
  };
};

type Error = {
  error: string;
};

export const loader = async ({ params }: LoaderArgs) => {
  let response: Question | Error;
  try {
    mySchema.parse(Number(params.pollId));
    response = {
      id: Number(params.pollId),
      question:
        "At what age do you think you will be able to retire comfortably?",
      answer: {
        min: 55,
        max: 85,
        default: 65
      }
    };
  } catch {
    response = { error: `The id "${params.pollId}" does not exist` };
  }
  return json(response);
};

export default function Poll() {
  const [hasVoted, setHasVoted] = useState(false);
  const data = useLoaderData<typeof loader>();
  if ("error" in data) {
    return <div>ERROR: {data.error}</div>;
  }
  const { answer, question } = data;
  const getDragValue = (a) => {
    console.log(a.currentValue);
    setTimeout(() => {
      setHasVoted(true);
    }, 1000);
  };
  return (
    <div style={{ padding: "5px", height: "100%" }}>
      <div className="poll-question" style={{ textAlign: "center" }}>
        {question}
      </div>
      <div style={{ height: "75vh" }}>
        <motion.div
          layout
          // key={hasVoted ? 'voted' : 'notVoted'}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          // exit={{ opacity: 0, scale: 0.5}}
          transition={{ duration: 1 }}
          style={{ height: "100%" }}
        >
          {hasVoted ? (
            <RadarChart />
          ) : (
            <div style={{ height: "100%" }}>
              <CircularGaugeComponent
                dragEnd={getDragValue}
                enablePointerDrag={true}
                tooltip={{
                  enable: true,
                  template:
                    '<div id="templateWrap"><div style="float: right; padding-left:10px; line-height:30px;"><span>Pointer &nbsp;&nbsp;:&nbsp; ${value}</span></div></div>'
                }}
                moveToCenter={true}
                style={{
                  resize: "horizontal",
                  width: "100%",
                  height: "100%"
                }}
              >
                {/* <Inject services={[GaugeTooltip]} /> */}
                <AxesDirective>
                  <AxisDirective
                    startAngle={270}
                    endAngle={90}
                    minimum={answer.min}
                    maximum={answer.max}
                    lineStyle={{ width: 5, color: "#999" }}
                    minorTicks={{ interval: 1 }}
                    // roundingPlaces={1}
                  >
                    {/* <RangesDirective>
                      <RangeDirective
                        start={0}
                        end={answer.default}
                      ></RangeDirective>
                    </RangesDirective> */}
                    <PointersDirective>
                      <PointerDirective
                        value={answer.default}
                        cap={{ radius: 10 }}
                        radius={"85%"}
                        offset={50}
                      ></PointerDirective>
                    </PointersDirective>
                  </AxisDirective>
                </AxesDirective>
              </CircularGaugeComponent>
            </div>
          )}
        </motion.div>
        <div style={{ position: "absolute", bottom: 0, fontSize: "12px" }}>
          Sponsored by:{" "}
          <img
            style={{ width: "50%" }}
            alt={"marketviews logo"}
            src="https://www.marketviews.com/wp-content/uploads/2019/10/MV-logo2019.png"
          ></img>
        </div>
      </div>
    </div>
  );
}
