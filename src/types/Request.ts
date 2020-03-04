/* eslint-disable */
export interface MainRequest {
    uri: string;
    method: string;
    qs?: object;
    body?: object;
    form?: object;
    headers?: object;
    json: boolean;
    apply_auth_qs?: boolean;
    qsStringifyOptions?: boolean;
}

export interface GetThreads {
    guest?: string;
    next?: boolean;
}
