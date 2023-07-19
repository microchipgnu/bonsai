import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { pluginId: string; property: string } }
) {
  const id = params.pluginId;
  const property = params.property;

  const _path = path.join(
    process.cwd(),
    "public",
    `/llm-functions-data/${id}/${property}/prompt.md`
  );

  const searchDescription = await fs.promises.readFile(_path, "utf-8");

  return NextResponse.json(
    { description: searchDescription },
    {
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
    }
  );
}
