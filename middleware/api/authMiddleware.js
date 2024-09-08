const validate = (token) => {
    const validToken = true;
    if (!validToken || token !== "myToken")
        return false;
    return true;
};

export function authMiddleware(req) {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader?.split(" ").pop();
    return { isValid: validate(token) };
}