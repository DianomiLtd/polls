import type { LoaderArgs } from "@remix-run/cloudflare"; // or cloudflare/deno
import { json } from "@remix-run/cloudflare"; // or cloudflare/deno
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { z } from "zod";
import {
  CircularGaugeComponent,
  AxesDirective,
  AxisDirective, 
  PointersDirective,
  ILoadedEventArgs, 
  GaugeTheme, 
  IPointerDragEventArgs,
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



  let gauge: CircularGaugeComponent;
  let drag: HTMLInputElement;

  function dragMove(args: IPointerDragEventArgs): void {
      if (args.type.indexOf('pointer') > -1) {
          // drag.value = Math.round(args.currentValue).toString();
          setPointersValue(gauge, Math.round(args.currentValue));
      }
  };

  function dragEnd(args: IPointerDragEventArgs): void {
      if (isNaN(args.rangeIndex)) {
          setPointersValue(gauge, Math.round(args.currentValue));
      }
  };

  function load(args: ILoadedEventArgs): void {

  }

  function dragChange(): void {
      let pointerValue: number = +drag.value;
      setPointersValue(gauge, pointerValue);
  }


  function setPointersValue(circulargauge: CircularGaugeComponent, pointerValue: number): void {
      circulargauge.setPointerValue(0, 1, pointerValue);
      circulargauge.setPointerValue(0, 0, pointerValue);
  }
  
export type Question = {
  id: number;
  question: string;
  answer: {
    min: number;
    max: number;
    default: number;
  };
  results: Array<{ answer: string; results: number }>;
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
                centerY='35%'  
                load={load.bind(this)}  
                background='transparent' 
                dragMove={dragEnd.bind(this)} 
                dragEnd={getDragValue} 
                id='dianomi_poll' 
                ref={g => gauge = g} 
                enablePointerDrag={true} 
                enableRangeDrag={false}
                tooltip={{
                  enable: true,
                  type: ['Range', 'Pointer'],
                  showAtMousePosition: true,
                  format: '{value}',
                  enableAnimation: false,
                  textStyle: {
                      size: '13px',
                      fontFamily: 'inherit'
                  },
                  rangeSettings: {
                      showAtMousePosition: true, format: "Start Value: {start} <br/> End Value: {end}", textStyle: {
                          size: '13px',
                          fontFamily: 'inherit'
                      }
                  }
              }}
              >
                <Inject services={[GaugeTooltip]} />
                <AxesDirective>
                  <AxisDirective
                    startAngle={270}
                    endAngle={90}
                    minimum={answer.min}
                    maximum={answer.max}
                    lineStyle={{ width: 5, color: "#7359c4" }}
                    minorTicks={{ interval: 1 }}
                    radius={"87%"}
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
                        imageUrl={"https://www.dianomi.com/img/uploads/ZAUZytBiYBYDhMN2rAu_oQAAAAs.png"}
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
