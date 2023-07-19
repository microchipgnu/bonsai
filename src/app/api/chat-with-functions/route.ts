import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";
import type { ChatCompletionFunctions } from "openai-edge/types/api";

const getDescriptionProperty = async (pluginId: string, property: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_HOSTNAME}/api/get-public-file/${pluginId}/${property}`
  );
  const data = await res.json();

  return data?.description || "";
};
const getDescription = async (pluginId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_HOSTNAME}/api/get-public-file/${pluginId}`
  );
  const data = await res.json();

  return data?.description || "";
};

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const functions: ChatCompletionFunctions[] = [
  // {
  //   name: "get_current_weather",
  //   description: "Get the current weather",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       location: {
  //         type: "string",
  //         description: "The city and state, e.g. San Francisco, CA",
  //       },
  //       format: {
  //         type: "string",
  //         enum: ["celsius", "fahrenheit"],
  //         description:
  //           "The temperature unit to use. Infer this from the users location.",
  //       },
  //     },
  //     required: ["location", "format"],
  //   },
  // },
  // {
  //   name: "get_current_time",
  //   description: "Get the current time",
  //   parameters: {
  //     type: "object",
  //     properties: {},
  //     required: [],
  //   },
  // },
  // {
  //   name: "eval_code_in_browser",
  //   description: "Execute javascript code in the browser with eval().",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       code: {
  //         type: "string",
  //         description: `Javascript code that will be directly executed via eval(). Do not use backticks in your response.
  //          DO NOT include any newlines in your response, and be sure to provide only valid JSON when providing the arguments object.
  //          The output of the eval() will be returned directly by the function.`,
  //       },
  //     },
  //     required: ["code"],
  //   },
  // },
];

export async function POST(req: Request) {
  const { messages, function_call } = await req.json();

  const _functions = [
    {
      name: "submit-query",
      description: await getDescription("submit-query"),
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: await getDescriptionProperty("submit-query", "query"),
          },
          variables: {
            type: "object",
          },
          network: {
            type: "string",
            enum: ["testnet", "mainnet"],
            description: await getDescriptionProperty(
              "submit-query",
              "network"
            ),
          },
        },
        required: ["query", "variables", "network"],
      },
    },
    {
      name: "generate-transaction",
      description: await getDescription("generate-transaction"),
      parameters: {
        type: "object",
        properties: {
          methodName: {
            type: "string",
            description: await getDescriptionProperty(
              "generate-transaction",
              "methodName"
            ),
          },
          args: {
            type: "object",
          },
          gas: {
            type: "string",
          },
          deposit: {
            type: "string",
          },
          contractName: {
            type: "string",
          }
          // network: {
          //   type: "string",
          //   enum: ["testnet", "mainnet"],
          // },
        },
        required: [
          "methodName",
          "args",
          "gas",
          "deposit",
          "signer",
          "contractName",
        ],
      },
    },
    {
      name: "generate-bos-widget",
      description: await getDescription("generate-bos-widget"),
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: await getDescriptionProperty(
              "generate-bos-widget",
              "code"
            ),
          },
        },
        required: ["code"],
      },
    },
    {
      name: "account-details",
      description: "",
      parameters: {
        type: "object",
        properties: {
          accountId: {
            type: "string",
            description: ""
          },
        },
        required: ["accountId"],
      },
    },
    ...functions,
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    stream: true,
    messages,
    functions: _functions,
    function_call,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
