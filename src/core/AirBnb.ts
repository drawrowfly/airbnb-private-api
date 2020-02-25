import rp from 'request-promise';
import { Response } from 'request';
import { v4 as uuidv4 } from 'uuid';
import { start } from 'pretty-error';

start();

import { endpoints, user_agents, api_key, user_types, reservation_order } from '../constant';

import { MainRequest, AirBnbConstructor, Session, Threads, Reservations, AirBnbClass, SearchListing } from '../types';

import { requireAuth, requiredArguments } from '../decorators';

import { random_id, validate_user_type, validate_reservation_order } from '../helpers';

import { SessionManager } from './SessionManager';

export class AirBnbClient<T extends AirBnbConstructor> extends SessionManager implements AirBnbClass {
    public email: string;
    public phone: string;
    public password: string;
    public auth_token: string;
    public proxy: string;
    public currency: string;
    public locale: string;
    public session: Session;
    public authenticated: boolean;
    public valid_store: boolean;

    constructor({
        email = '',
        phone = '',
        password = '',
        auth_token = '',
        proxy = '',
        currency = 'USD',
        locale = 'en-US',
        session_store = 'file',
        session_path = '',
    }: T) {
        const session = {
            user_agent: user_agents[0].user_agent,
            advertising_id: uuidv4(),
            device: {
                id: random_id(16, false),
                fingerprint: random_id(64, true),
                screen_size: user_agents[0].screen_size,
                country: 'us',
            },
        } as Session;
        super({
            session_store,
            session,
            session_path,
            auth_token,
            email,
            phone,
            currency,
            locale,
            authenticated: false,
            valid_store: false,
        });
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.auth_token = auth_token;
        this.proxy = proxy;
        this.currency = currency;
        this.locale = locale;
        this.session = session;
        this.authenticated = false;
        this.valid_store = false;
    }

    private _request({
        uri,
        method,
        qs,
        body,
        form,
        headers,
        json,
        proxy,
        apply_auth_qs,
        qsStringifyOptions = false,
    }: MainRequest): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            const query: any = {
                uri,
                method,
                ...(body ? { body } : {}),
                ...(form ? { form } : {}),
                qs: {
                    ...qs,
                    ...(apply_auth_qs
                        ? {
                              client_id: api_key,
                              locale: this.locale,
                              currency: this.currency,
                          }
                        : {}),
                },
                headers: {
                    'user-agent': this.session.user_agent,
                    'x-airbnb-advertising-id': this.session.advertising_id,
                    'x-airbnb-device-id': this.session.device.id,
                    'x-airbnb-device-fingerprint': this.session.device.fingerprint,
                    'x-airbnb-screensize': this.session.device.screen_size,
                    'x-airbnb-carrier-country': this.session.device.country,
                    ...(this.authenticated ? { 'x-airbnb-oauth-token': this.auth_token } : {}),
                    'accept-encoding': 'gzip',
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8 ',
                    'x-airbnb-network-type': 'wifi',
                    'x-return-strategy': 'single',
                    ...headers,
                },
                ...(qsStringifyOptions ? { qsStringifyOptions: { indices: false } } : {}),
                ...(json ? { json: true } : {}),
                gzip: true,
                resolveWithFullResponse: true,
                ...(this.proxy ? { proxy: `https://${this.proxy}/` } : {}),
            };

            try {
                const response: Response = await rp(query);
                resolve(response);
            } catch ({ error, name }) {
                if (name === 'StatusCodeError') {
                    return reject({ type: 'StatusCodeError', ...error });
                }
                reject(error);
            }
        });
    }

    @requiredArguments(['email', 'password'])
    public _authentication_by_email() {
        return new Promise(async (resolve, reject) => {
            try {
                await this._validate_store();
                resolve(await this._authentication('email'));
            } catch (error) {
                reject(error);
            }
        });
    }

    @requiredArguments(['phone'])
    public _send_auth_code_to_phone(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const query: MainRequest = {
                uri: endpoints.phone_one_time_passwords,
                method: 'POST',
                body: {
                    otpMethod: 'AUTO',
                    phoneNumber: this.phone,
                    workFlow: 'GLOBAL_SIGNUP_LOGIN',
                },
                headers: {
                    'content-type': 'application/json; charset=UTF-8',
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                await this._validate_store();
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    public _authentication_by_phone(code: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await this._authentication('phone', code));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Airbnb Authentication
     */
    private _authentication(type: string, code: number = 0): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const query: MainRequest = {
                uri: endpoints.authentications,
                method: 'POST',
                qs: {
                    client_id: api_key,
                    locale: this.locale,
                    currency: this.currency,
                },
                body: {
                    authenticationParams: {
                        ...(type === 'email'
                            ? {
                                  email: {
                                      email: this.email,
                                      password: this.password,
                                  },
                              }
                            : {
                                  phone: {
                                      deliveryMethod: 'TEXT',
                                      isCombinedFlow: false,
                                      isGlobal: true,
                                      otp: code,
                                      phoneNumber: this.phone,
                                  },
                              }),
                    },
                    metadata: {
                        sxsMode: 'OFF',
                    },
                },
                headers: {
                    'content-type': 'application/json; charset=UTF-8',
                },
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                this.auth_token = response.body.token;
                this.session = {
                    ...this.session,
                    token: response.body.token,
                    user: {
                        currency: this.currency,
                        locale: this.locale,
                        user_id: response.body.filledAccountData.userId,
                    },
                };
                this.authenticated = true;
                await this._save_session();
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get profile information from my profile
     */
    @requireAuth
    public _get_my_profile(): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            const query: MainRequest = {
                uri: endpoints.accounts_me,
                method: 'GET',
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get profile info of a user using user id
     * @param id
     */
    @requireAuth
    public _get_user_profile(user_id: number): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            if (typeof user_id !== 'number') {
                return reject({ type: 'Function', method: '_get_user_profile', error_message: 'id can only be a positive number' });
            }
            const query: MainRequest = {
                uri: endpoints.user_by_id(user_id),
                method: 'GET',
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get items from the Saved section
     */
    @requireAuth
    public _get_wishlists({ _offset = 0, _limit = 10 }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            if (typeof _offset !== 'number' || typeof _limit !== 'number') {
                return reject({ type: 'Function', method: '_get_thread_ids', error_message: 'offset and limit can only be a positive numbers' });
            }
            const query: MainRequest = {
                uri: endpoints.wishlists,
                method: 'GET',
                qs: {
                    _format: 'for_mobile_private_index',
                    _limit,
                    _offset,
                    include_shared_wishlists: true,
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get listings
     * @param _limit
     */
    @requireAuth
    public _get_listings({ id = 0, _limit = 10 }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            if (typeof _limit !== 'number' || typeof id !== 'number') {
                return reject({ type: 'Function', method: '_get_listings', error_message: '_limit and id can only be a positive number (>=0)' });
            }
            const query: MainRequest = {
                uri: endpoints.listings(id),
                method: 'GET',
                qs: {
                    ...(!id
                        ? {
                              _limit,
                              user_id: this.session.user.user_id,
                          }
                        : {}),
                    _format: 'v1_legacy_long_manage_listing',
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Guest and Host message sync
     */
    @requireAuth
    public _messaging_syncs({ type = 'host', _limit = 10 }) {
        return new Promise(async (resolve, reject) => {
            if (!validate_user_type(type)) {
                return reject({ type: 'Function', method: '_messaging_syncs', error_message: `type can only be: ${user_types}` });
            }
            const query: MainRequest = {
                uri: endpoints.messaging_syncs,
                method: 'GET',
                qs: {
                    _limit,
                    include_generic_bessie_threads: true,
                    include_luxury_assisted_booking_threads: true,
                    include_mt: true,
                    include_plus_onboarding_threads: true,
                    include_restaurant_threads: true,
                    include_support_messaging_threads: true,
                    selected_inbox_type: type,
                    sequence_id: (Date.now() / 1000) | 0,
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get full threads(conversation)
     */
    @requireAuth
    public _get_threads_full({ _limit = 10, type = 'host' }) {
        return new Promise(async (resolve, reject) => {
            if (!validate_user_type(type)) {
                return reject({ type: 'Function', method: '_get_threads_full', error_message: `type can only be: ${user_types}` });
            }
            try {
                const response = this._threads({
                    selected_inbox_type: type,
                    _limit,
                    full: true,
                });
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get thread id's(conversation id)
     * @param id
     */
    @requireAuth
    public _get_threads_ids({ _limit = 10, _offset = 0, type = 'host' }) {
        return new Promise(async (resolve, reject) => {
            if (!validate_user_type(type)) {
                return reject({ type: 'Function', method: '_get_threads_ids', error_message: `type can only be ${user_types}` });
            }
            try {
                const response = this._threads({
                    selected_inbox_type: type,
                    _limit,
                    _offset,
                    full: false,
                });
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get thread by id
     * @param id
     */
    @requireAuth
    public _get_thread_by_id({ id }) {
        return new Promise(async (resolve, reject) => {
            if (typeof id !== 'number' || id <= 0) {
                return reject({ type: 'Function', method: '_get_thread_by_id', error_message: `id can only be a positive number(>0)` });
            }
            try {
                const response = this._threads({
                    id,
                });
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }

    @requireAuth
    private _threads({ id, _limit, selected_inbox_type, full, _offset }: Threads): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            const query: MainRequest = {
                uri: endpoints.threads(id as number),
                method: 'GET',
                qs: {
                    ...(id
                        ? {
                              _format: 'for_messaging_sync_with_posts_china',
                          }
                        : {
                              _limit,
                              selected_inbox_type,
                              ...(full
                                  ? {
                                        _format: 'for_messaging_sync_with_posts_china',
                                        include_generic_bessie_threads: true,
                                        include_luxury_assisted_booking_threads: true,
                                        include_mt: true,
                                        include_plus_onboarding_threads: true,
                                        include_restaurant_threads: true,
                                        include_support_messaging_threads: true,
                                        role: 'all',
                                    }
                                  : {
                                        _offset,
                                    }),
                          }),
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update note for specific days
     * @param param
     */
    public _update_calendar_note({ listing_id, dates, notes }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const response: Response = await this._update_calendar(listing_id, { notes, dates });
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update smart pricing
     */
    public _update_calendar_smart_pricing({ listing_id, active, dates }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const response: Response = await this._update_calendar(listing_id, { demand_based_pricing_overridden: !active, dates });
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update availability for specific day
     */
    public _update_calendar_availability({ listing_id, availability, dates }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const availability_status = availability ? 'available' : 'unavailable_persistent';
                const response: Response = await this._update_calendar(listing_id, { availability: availability_status, dates });
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update price for specific day
     */
    public _update_calendar_price({ listing_id, daily_price, dates }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            try {
                const response: Response = await this._update_calendar(listing_id, { daily_price, dates });
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update calendar availability, pricing, note
     * @param param
     */
    @requireAuth
    private _update_calendar(listing_id, operations): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            const query: MainRequest = {
                uri: endpoints.calendar_operations,
                method: 'POST',
                qs: {
                    _format: 'host_calendar_detailed',
                },
                body: {
                    listing_id,
                    method: 'UPDATE',
                    operations: [
                        {
                            ...operations,
                        },
                    ],
                },
                headers: {
                    'content-type': 'application/json; charset=UTF-8',
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }

    @requireAuth
    public _get_host_pricing_calculators({ check_in, check_out, listing_id }): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            const query: MainRequest = {
                uri: endpoints.host_pricing_calculators,
                method: 'GET',
                qs: {
                    _format: 'default',
                    check_in,
                    guests: 1,
                    check_out,
                    listing_id,
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get reservations
     */
    @requireAuth
    public _get_reservations({
        _limit = 30,
        _offset = 0,
        start_date = new Date().toISOString().substring(0, 10),
        end_date = '',
        order_by = 'start_date',
        include_accept = true,
        include_canceled = false,
        include_checkpoint = false,
        include_pending = false,
    }: Reservations): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            if (!validate_reservation_order(order_by)) {
                return reject({ type: 'Function', method: '_get_reservations', error_message: `you can order only by: ${reservation_order}` });
            }
            const query: MainRequest = {
                uri: endpoints.reservations,
                method: 'GET',
                qs: {
                    _format: 'for_mobile_list',
                    _limit,
                    _offset,
                    _order: order_by,
                    start_date,
                    ...(end_date ? { end_date } : {}),
                    host_id: this.session.user.user_id,
                    for_calendar_thumbnail: true,
                    include_accept,
                    include_canceled,
                    include_checkpoint,
                    include_pending,
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get reservation details
     */
    @requireAuth
    public _get_reservation_details(reservation_id: string): Promise<Response> {
        return new Promise(async (resolve, reject) => {
            const query: MainRequest = {
                uri: endpoints.homes_booking_details(reservation_id),
                method: 'GET',
                qs: {
                    _format: 'for_host_reservation_details_v2',
                },
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(query);
                resolve(response.body);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Search for a listings from a traveler account
     */
    @requireAuth
    public _get_listings_from_search({
        adults,
        children = 0,
        infants = 0,
        checkin,
        checkout,
        _offset = 0,
        _limit = 30,
        query = '',
        is_guided_search = false,
        amenities = [],
        ib = false,
        price_min,
        price_max,
        min_bathrooms,
        min_bedrooms,
        min_beds,
        superhost = false,
        room_types = [],
    }: SearchListing): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const requestQuery: MainRequest = {
                uri: `${endpoints.explore_tabs}`,
                method: 'GET',
                qs: {
                    _format: 'for_explore_search_native',
                    adults,
                    checkin,
                    checkout,
                    children,
                    fetch_filters: true,
                    gps_lat: 0.0,
                    gps_lng: 0.0,
                    infants,
                    is_guided_search,
                    items_offset: _offset,
                    items_per_grid: _limit,
                    query,
                    ...(price_min ? { price_min } : {}),
                    ...(price_max ? { price_max } : {}),
                    ...(min_bathrooms ? { min_bathrooms } : {}),
                    ...(min_bedrooms ? { min_bedrooms } : {}),
                    ...(min_beds ? { min_beds } : {}),
                    ...(ib ? { ib } : {}),
                    ...(superhost ? { superhost } : {}),
                    'refinement_paths[]': '/homes',
                    'amenities[]': amenities,
                    'room_types[]': room_types,
                    version: '1.7.3',
                },
                qsStringifyOptions: true,
                apply_auth_qs: true,
                json: true,
            };
            try {
                const response: Response = await this._request(requestQuery);
                try {
                    resolve(response.body.explore_tabs[0].sections[1].listings);
                } catch (error) {
                    resolve([]);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
