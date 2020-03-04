/* eslint-disable */
export interface Endpoints {
    authentications: string;
    messaging_syncs: string;
    threads: (id: number) => string;
    accounts_me: string;
    user_by_id: (id: number) => string;
    wishlists: string;
    listings: (id: number) => string;
    host_pricing_calculators: string;
    calendar_operations: string;
    reservations: string;
    homes_booking_details: (id: string) => string;
    phone_one_time_passwords: string;
    explore_tabs: string;
}

export interface UserAgents {
    user_agent: string;
    screen_size: string;
}
