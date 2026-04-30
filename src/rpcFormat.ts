type RpcRequest = {
    jsonrpc: string
    id?: number | string | null
    method: string
    params?: unknown[]
}

const ALLOWED_METHODS = [
    "getProgramAccounts",
    "getAccountInfo"
]

// used to check the rpc request format
export function rpcFormat(body: unknown): body is RpcRequest {
    // Must be an object
    if (typeof body !== "object" || body === null) {
        return false
    }

    const rpc = body as Record<string, unknown>

    // Must have jsonrpc field
    if (rpc.jsonrpc !== "2.0") {
        return false
    }

    // Must have method
    if (typeof rpc.method !== "string") {
        return false
    }

    // Method must be in allowed list
    if (!ALLOWED_METHODS.includes(rpc.method)) {
        return false
    }

    // params must be array if exists
    if (
        rpc.params !== undefined &&
        !Array.isArray(rpc.params)
    ) {
        return false
    }

    return true
}