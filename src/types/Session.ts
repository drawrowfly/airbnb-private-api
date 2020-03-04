/* eslint-disable */
export interface Device {
    id: string;
    screen_size: string;
    fingerprint: string;
    country: string;
}

export interface User {
    user_id: string;
    country?: string;
    currency: string;
    locale: string;
}

export interface Session {
    token: string;
    advertising_id: string;
    device: Device;
    user_agent: string;
    user: User;
}
