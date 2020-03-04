import { fromCallback } from 'bluebird';
import { writeFile, readFile, constants, access, mkdir } from 'fs';
import { homedir } from 'os';

import { Session, SessioManagerConstructor } from '../types';

import { requiredArguments } from '../decorators';

export class SessionManager {
    public session_store: string;

    public session_path: string;

    public session: Session;

    public email: string;

    public phone: string;

    public auth_token: string;

    public currency: string;

    public locale: string;

    public authenticated: boolean;

    public valid_store: boolean;

    constructor({
        session_store,
        session_path,
        session,
        email,
        phone,
        auth_token = '',
        currency = '',
        locale = '',
        authenticated,
        valid_store,
    }: SessioManagerConstructor) {
        this.session_store = session_store;
        this.session_path = session_path || `${homedir()}/Downloads`;
        this.session = session;
        this.email = email;
        this.phone = phone;
        this.auth_token = auth_token;
        this.currency = currency;
        this.locale = locale;
        this.authenticated = authenticated;
        this.valid_store = valid_store;
    }

    public async _validate_store(): Promise<any> {
        switch (this.session_store) {
            case 'file':
                try {
                    await fromCallback(cb => mkdir(this.session_path, { recursive: true }, cb));
                    await fromCallback(cb => access(this.session_path, constants.W_OK | constants.R_OK, cb));
                    this.valid_store = true;
                } catch (error) {
                    throw new Error(error);
                }
                break;
            default:
                break;
        }
    }

    public async _save_session(): Promise<any> {
        switch (this.session_store) {
            case 'file':
                try {
                    await fromCallback(cb =>
                        writeFile(
                            `${this.session_path}/${this.email ? this.email : this.phone}.json`,
                            JSON.stringify({
                                token: this.auth_token,
                                advertising_id: this.session.advertising_id,
                                device: {
                                    id: this.session.device.id,
                                    screen_size: this.session.device.screen_size,
                                    fingerprint: this.session.device.fingerprint,
                                    country: this.session.device.country,
                                },
                                user_agent: this.session.user_agent,
                                user: {
                                    user_id: this.session.user.user_id,
                                    currency: this.currency,
                                    locale: this.locale,
                                },
                            }),
                            { flag: 'w' },
                            cb,
                        ),
                    );
                } catch (error) {
                    throw new Error(error);
                }
                break;
            default:
                break;
        }
    }

    @requiredArguments(['email|phone'])
    public async _load_session(): Promise<any> {
        if (!this.valid_store) {
            try {
                await this._validate_store();
            } catch (error) {
                throw new Error(error);
            }
        }
        try {
            switch (this.session_store) {
                case 'file': {
                    const session_store: string = await fromCallback(cb =>
                        readFile(`${this.session_path}/${this.email ? this.email : this.phone}.json`, { encoding: 'utf-8' }, cb),
                    );

                    this.session = JSON.parse(session_store);
                    this.auth_token = this.session.token;
                    this.authenticated = true;
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}
