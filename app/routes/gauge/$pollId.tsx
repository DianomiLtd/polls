import type { LoaderArgs } from "@remix-run/cloudflare"; // or cloudflare/deno
import { json } from "@remix-run/cloudflare"; // or cloudflare/deno
import { useLoaderData, useRevalidator } from "@remix-run/react";
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
import Bar from "~/charts/bar/bar";
import styles from "~/styles/gauge.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
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
  results: Array<{ answer: string; result: number }>;
};

type Error = {
  error: string;
};

export const loader = async ({ params, context }: LoaderArgs) => {
  let response: {
    api_url: string;
    data: Question | Error;
  };
  try {
    mySchema.parse(Number(params.pollId));
    const result = await fetch(
      `${context.POLL_API}/question?id=${params.pollId}`
    );
    response = await result.json();
  } catch {
    response = {
      data: { error: `The id "${params.pollId}" does not exist` },
      api_url: (context.POLL_API as string)  || ''
    };
  }
  return json({ api_url: context.POLL_API, data: response });
};

export default function Poll() {
  const [hasVoted, setHasVoted] = useState(false);
  const { api_url, data } = useLoaderData<typeof loader>();
  if ("error" in data) {
    return <div>ERROR: {data.error}</div>;
  }
  const { answer, question, id } = data;
  const getDragValue = async ({ currentValue }: { currentValue: number }) => {
    const vote = Math.floor(currentValue);
    await fetch(`${api_url}/answer`, {
      method: "POST",
      body: JSON.stringify({
        question_id: id,
        answer: vote.toString()
      })
    });
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
            <Bar id={id} api_url={api_url} />
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
                    lineStyle={{ width: 3, color: "#7359c4" }}
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
                      {/* <PointerDirective
                        type={"Marker"}
                        value={answer.default}
                        markerShape={"Circle"}
                      ></PointerDirective> */}
                      {/* <PointerDirective
                        type={"Marker"}
                        markerShape={"Image"}
                        imageUrl={"http://127.0.0.1:5502/polls/image.png"}
                        value={answer.default}
                        markerHeight={50}
                        markerWidth={100}
                      ></PointerDirective> */}
                      <PointerDirective
                        type={"Marker"}
                        markerShape={"Image"}
                        imageUrl={"https://www.dianomi.com/img/uploads/Y_zmbkhfuTwosipq34zghgAAAC4.png"}
                        value={answer.default}
                        markerHeight={80}
                        markerWidth={70}
                      ></PointerDirective>
                      <PointerDirective
                        value={answer.default}
                        cap={{ radius: 5 }}
                        radius={"70%"}
                        color={'#7359c4'}
                        pointerWidth={15}
                        animation={{
                          enable: true,
                          duration: 1000
                      }}
                      needleTail={{
                        length: '12%',
                        color: '#7359c4'
                    }}
                      ></PointerDirective>
                    </PointersDirective>
                  </AxisDirective>
                </AxesDirective>
              </CircularGaugeComponent>
            </div>
          )}
        </motion.div>
        <div style={{ position: "absolute", bottom: 0, fontSize: "12px" }} className="partner-logo">
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
