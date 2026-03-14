import { describe, it, expect } from "vitest"

const WORKER_URL = "http://localhost:8787"

describe("RPC Gateway", () => {

    it("accepts valid getAccountInfo request", async () => {

        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getAccountInfo",
                params: ["7864osdiV5r87pQnK8vzWEhstZ8S7JUo7bMMf1VhTHcS"]
            })
        })

        expect(res.status).toBe(200)

    })

    it("accepts valid getProgramAccounts request", async () => {

        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getProgramAccounts",
                params: [
                    "7864osdiV5r87pQnK8vzWEhstZ8S7JUo7bMMf1VhTHcS",
                    {
                    filters: [
                        { dataSize: 137 }
                    ]
                    }
                ]
            })
    })

    expect(res.status).toBe(200)

    })  


    it("rejects unsupported method", async () => {

        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getSlot"
            })
        })

        expect(res.status).toBe(400)

    })


    it("rejects non rpc request", async () => {

        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hello: "world"
            })
        })

        expect(res.status).toBe(400)

    })


    it("rejects GET request (only POST allowed)", async () => {

        const res = await fetch(WORKER_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })

        expect(res.status).toBe(405)

    })

})