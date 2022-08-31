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

serve(async (req) => {
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

    let pingResponse = null
    try {
        console.log("OK await ping");
        pingResponse = await ping({ host, port })
    } catch (err) {
        console.log("NOT OK got error");
        return new Error(500, `Encountered error during ping - ${err.name}: ${err.message}`).build();
    }

    console.log("OK return response");

    return new HttpResp(pingResponse, 200).build();
});