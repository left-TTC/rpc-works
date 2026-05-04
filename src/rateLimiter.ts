
export class RateLimiter {
    constructor(public state: DurableObjectState, public env: Env) {}

    async fetch(request: Request) {

        console.log("Start limit fetch ==== ")

        const url = new URL(request.url);
        const ip = url.searchParams.get("ip");

        if(!ip) return new Response("unknown ip", { status: 429 })
        
        const now = Date.now();

        const WINDOW = 60000; 
        const LIMIT = 30;     

        let record = await this.state.storage.get<any>(ip);
        console.log("now the record count: ", record)

        if (!record || now - record.ts > WINDOW) {
            await this.state.storage.put(ip, { count: 1, ts: now });
            return new Response("ok");
        }

        if (record.count >= LIMIT) {
            return new Response("blocked", { status: 429 });
        }

        record.count++;
        await this.state.storage.put(ip, record);

        return new Response("ok");
    }
}