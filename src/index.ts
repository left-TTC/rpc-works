/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { rpcFormat } from "./rpcFormat";

export default {
	async fetch(request, env, ctx): Promise<Response> {

        if (request.method != "POST"){
            return new Response("Method not allowed", { status: 405 })
        }

        let body: unknown

        try {
            body = await request.json()
        } catch {
            return new Response("Invalid JSON", { status: 400 })
        }

        if (!rpcFormat(body)) {
            return new Response("Invalid Solana RPC request", { status: 400 })
        }

        const rpcUrl = "https://api.devnet.solana.com"

        const rpcResponse = await fetch(rpcUrl, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        })
        
console.log("RPC status:", rpcResponse.status)

		return rpcResponse
	},
} satisfies ExportedHandler<Env>;
