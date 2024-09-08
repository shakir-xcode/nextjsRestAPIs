export function logMiddleware(request) {
    return { response: "######## " + request.method + " " + request.url };
}