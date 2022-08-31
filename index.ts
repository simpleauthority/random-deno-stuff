import { serve } from "https://deno.land/std@0.153.0/http/server.ts";
import ping from "https://esm.sh/minecraft-protocol@1.36.1/src/ping?target=deno&keepnames";

class HttpResp {
    body: Record<string, unknown>;
    code: number;

    constructor(body: Record<string, unknown> = { message: "No message provided" }, code: number = 200) {
        this.body = body;
        this.code = code;
    }

    build(): Response {
        return new Response(JSON.stringify(this.body), {
            status: this.code,
            headers: {
                "content-type": "application/json"
            }
        })
    }
}

class Error extends HttpResp {
    constructor(code: number = 500, message: string = "No message provided") {
        super({ error: message }, code);
    }
}

function handler(req: Request): Response {
    if (req.method !== 'GET') {
        console.log("NOT OK, not GET");
        return new Error(400, "Method not allowed. Use GET.").build();
    }

    console.log("OK GET");

    const data: URLSearchParams = new URL(req.url).searchParams;
    if (!data.has("host") || !data.has("port")) {
        console.log("NOT OK, bad query params")
        return new Error(400, "Host and port must be specified in the query params.").build();
    }

    console.log("OK, good query params");

    const host: string | null = data.get("host")
    const port: string | null  = data.get("port")

    if (!host || !port) {
        console.log("NOT OK, query param(s) null");
        return new Error(400, "Invalid values were received for the host and port of the target Minecraft server").build();
    }

    console.log("OK, contentful query params");

    try {
        console.log("OK await ping");
        return new HttpResp({message: "this would be where the ping results would be..."}, 200).build();
        //return new HttpResp(await ping({ host, port }), 200).build();
    } catch (err) {
        console.log("NOT OK got error");
        return new Error(500, `Encountered error during ping - ${err.name}: ${err.message}`).build();
    }
}

serve(handler);