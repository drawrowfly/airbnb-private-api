/* eslint-disable */
import { Endpoints, UserAgents } from '../types';

export const user_agents: UserAgents[] = [
    {
        user_agent: 'Airbnb/21057117 AppVersion/20.07.1 Android/10.0 Device/Pixel 2 XL Carrier/US T-MOBILE Type/Phone',
        screen_size: 'w=360.0;h=640.0',
    },
];

export const maint_host = 'https://api.airbnb.com/v2';

export const api_key = '3092nxybyb0otqw18e8nh5nty';

export const user_types = ['guest', 'host', 'experience_host', 'guest_and_host'];

export const reservation_order = ['start_date', 'nights', 'number_of_guests', 'status'];

export const endpoints: Endpoints = {
    authentications: `${maint_host}/authentications`,
    messaging_syncs: `${maint_host}/messaging_syncs`,
    threads: (id?: number) => (id ? `${maint_host}/threads/${id}` : `${maint_host}/threads`),
    accounts_me: `${maint_host}/accounts/me`,
    user_by_id: (id: number) => `${maint_host}/users/${id}`,
    wishlists: `${maint_host}/wishlists`,
    listings: (id?: number) => (id ? `${maint_host}/listings/${id}` : `${maint_host}/listings`),
    host_pricing_calculators: `${maint_host}/host_pricing_calculators`,
    calendar_operations: `${maint_host}/calendar_operations`,
    reservations: `${maint_host}/reservations`,
    homes_booking_details: (id: string) => `${maint_host}/homes_booking_details/${id}`,
    phone_one_time_passwords: `${maint_host}/phone_one_time_passwords`,
    explore_tabs: `${maint_host}/explore_tabs`,
};
