type StatusCodeKey =
    | "OK"
    | "CREATED"
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND";

const STATUS_CODES: Record<StatusCodeKey, number> = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
};

export default STATUS_CODES;