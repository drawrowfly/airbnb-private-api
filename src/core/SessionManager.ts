import { fromCallback } from 'bluebird';
import { writeFile, readFile, constants, access, mkdir } from 'fs';
import { homedir } from 'os';

import { Session, SessioManagerConstructor } from '../types';

export class SessionManager {
    private _session_store: string;
    private _session_path: string;
    public _session: Session;
    public _email: string;
    public _phone: string;
    public _auth_token: string;
    public _currency: string;
    public _locale: string;
    public _authenticated: boolean;
    public _valid_store: boolean;

    constructor({ session_store, session_path, session, email, phone, auth_token = '', currency = '', locale = '', authenticated, valid_store }: SessioManagerConstructor) {
        this._session_store = session_store;
        this._session_path = session_path || `${homedir()}/Downloads`;
        this._session = session;
        this._email = email;
        this._phone = phone;
        this._auth_token = auth_token;
        this._currency = currency;
        this._locale = locale;
        this._authenticated = authenticated;
        this._valid_store = valid_store;
    }

    public _validate_store(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            switch (this._session_store) {
                case 'file':
                    try {
                        await fromCallback(cb => mkdir(this._session_path, { recursive: true }, cb));
                        await fromCallback(cb => access(this._session_path, constants.W_OK | constants.R_OK, cb));
                        this._valid_store = true;
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                    break;
            }
        });
    }

    public _save_session() {
        return new Promise(async (resolve, reject) => {
            switch (this._session_store) {
                case 'file':
                    try {
                        return resolve(
                            await fromCallback(cb =>
                                writeFile(
                                    `${this._session_path}/${this._email ? this._email : this._phone}.json`,
                                    JSON.stringify({
                                        token: this._auth_token,
                                        advertising_id: this._session.advertising_id,
                                        device: { id: this._session.device.id, screen_size: this._session.device.screen_size, fingerprint: this._session.device.fingerprint, country: this._session.device.country },
                                        user_agent: this._session.user_agent,
                                        user: {
                                            user_id: this._session.user.user_id,
                                            currency: this._currency,
                                            locale: this._locale,
                                        },
                                    }),
                                    { flag: 'w' },
                                    cb,
                                ),
                            ),
                        );
                    } catch (error) {
                        return reject(error);
                    }
            }
        });
    }
    public _load_session(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this._valid_store) {
                try {
                    await this._validate_store();
                } catch (error) {
                    return reject(error);
                }
            }
            try {
                switch (this._session_store) {
                    case 'file':
                        let session_store: string = await fromCallback(cb => readFile(`${this._session_path}/${this._email ? this._email : this._phone}.json`, { encoding: 'utf-8' }, cb));
                        this._session = JSON.parse(session_store);
                        this._auth_token = this._session.token;
                        this._authenticated = true;
                        resolve();
                        break;
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
