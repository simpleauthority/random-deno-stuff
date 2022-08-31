import { serve } from "https://deno.land/std@0.153.0/http/server.ts";
import MinecraftProtocol from "https://esm.sh/minecraft-protocol@1.36.1?target=deno&no-dts";

interface MCServerAddr {
    hostname: string
    port: number
}

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
        return new Error(400, "Method not allowed. Use GET.").build();
    }

    const data: URLSearchParams = new URL(req.url).searchParams;
    if (!data.has("host") || !data.has("port")) {
        return new Error(400, "Host and port must be specified in the query params.").build();
    }

    const host: string | null = data.get("host")
    const port: string | null  = data.get("port")

    if (!host || !port) {
        return new Error(400, "Invalid values were received for the host and port of the target Minecraft server").build();
    }

    let pingResponse = null
    try {
        pingResponse = await MinecraftProtocol.ping({ host, port })
    } catch (err) {
        return new Error(500, `Encountered error during ping - ${err.name}: ${err.message}`).build();
    }

    return new HttpResp(pingResponse, 200).build();
});