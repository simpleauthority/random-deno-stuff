import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

interface SomeType {
    message: string
}

const out: SomeType = {
    message: "hi"
}

serve((_req) => {
    return new Response(JSON.stringify(out), {
        headers: {
            "content-type": "text/json"
        }
    })
});