/* eslint-disable */
import { Session } from './Session';

export interface AirBnbClass {
    email: string;
    phone: string;
    password: string;
    auth_token: string;
    proxy: string;
    currency: string;
    locale: string;
    session: Session;
    authenticated: boolean;
    valid_store: boolean;
}

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

export interface SearchListing {
    adults: number;
    children: number;
    infants: number;
    checkin: string;
    checkout: string;
    _offset: number;
    _limit: number;
    query: string;
    is_guided_search?: boolean;
    amenities: number[];
    ib?: boolean;
    price_min?: number;
    price_max?: number;
    min_bathrooms?: number;
    min_bedrooms?: number;
    min_beds?: number;
    superhost?: boolean;
    room_types: string[];
}
