import type { LoaderArgs } from "@remix-run/cloudflare"; // or cloudflare/deno
import { json } from "@remix-run/cloudflare"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";

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

const mySchema = z.number();

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
      api_url: (context.POLL_API as string) || ""
    };
  }
  return json({ api_url: context.POLL_API, data: response });
};

export function Results() {
  const { api_url, data } = useLoaderData<typeof loader>();
  return <div>My Results</div>;
}
