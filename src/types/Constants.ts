export interface Endpoints {
    authentications: string;
    messaging_syncs: string;
    threads: Function;
    accounts_me: string;
    user_by_id: Function;
    wishlists: string;
    listings: Function;
    host_pricing_calculators: string;
    calendar_operations: string;
    reservations: string;
    homes_booking_details: Function;
    phone_one_time_passwords: string;
}

export interface UserAgents {
    user_agent: string;
    screen_size: string;
}
