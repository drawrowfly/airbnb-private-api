export interface AirBnbConstructor {
    email?: string;
    phone?: string;
    password?: string;
    auth_token?: string;
    proxy?: string;
    currency?: string;
    locale?: string;
    session_store: string;
    session_path?: string;
}

export interface Threads {
    id?: number;
    selected_inbox_type?: string;
    _limit?: number;
    _offset?: number;
    full?: boolean;
}

export interface Reservations {
    _limit: number;
    _offset: number;
    start_date: string;
    end_date: string;
    order_by: string;
    include_accept: boolean;
    include_canceled: boolean;
    include_checkpoint: boolean;
    include_pending: boolean;
}
