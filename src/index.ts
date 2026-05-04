import { rpcFormat } from "./rpcFormat";
export { RateLimiter } from "./rateLimiter";


export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const heliusApiKey = env.HELIUS_API_KEY;

        if (!env.HELIUS_API_KEY) {
            console.log("Missing HELIUS_API_KEY");
            return new Response("Server misconfigured", { status: 500 });
        }

        console.log("cloud flare woker for kilo v0.0.1")
        console.log("=== INCOMING REQUEST ===");

        if (request.method !== "POST") {
            return new Response("Requst method not allowed", { status: 405 });
        }

        const userIp =
            request.headers.get("CF-Connecting-IP") ??
            request.headers.get("x-forwarded-for")

        if(!userIp) {
            console.log("no ip ")
            return new Response("unknown ip", { status: 403 })
        }

        const id = env.RATE_LIMITER.idFromName(userIp);
        const stub = env.RATE_LIMITER.get(id);
        const rlRes = await stub.fetch(
            "https://rate-limit/?ip=" + encodeURIComponent(userIp)
        );

        if (rlRes.status === 429) {
            console.log("too many requets")
            return new Response("Too Many Requests", { status: 429 });
        }

        let rawBody: string;
        let body: any;

        try {
            rawBody = await request.clone().text();
            body = JSON.parse(rawBody);

            console.log("RAW BODY:", rawBody.slice(0, 200));
        } catch (err) {
            console.log("JSON parse error:", err);
            return new Response("Invalid JSON", { status: 400 });
        }

        if (!rpcFormat(body)) {
            console.log("Rejected: rpcFormat failed", body);
            return new Response("Invalid Solana RPC request", { status: 400 });
        }

        try {
            console.log("fetch url:", heliusApiKey)

            const rpcResponse = await fetch(heliusApiKey, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: rawBody,
            });

            console.log("=== RESPONSE ===");
            console.log("Status:", rpcResponse.status);

            const respText = await rpcResponse.clone().text();
            console.log("Response preview:", respText.slice(0, 200));

            return new Response(respText, {
                status: rpcResponse.status,
                headers: {
                    "content-type": "application/json",
                },
            });

        } catch (err) {
            console.log("Fetch error:", err);

            return new Response(
                JSON.stringify({
                error: "Upstream fetch failed",
                }),
                { status: 502 }
            );
        }
    },
} satisfies ExportedHandler<Env>;