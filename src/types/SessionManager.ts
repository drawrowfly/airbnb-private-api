/* eslint-disable */
import { Session } from './Session';

export interface SessioManagerConstructor {
    email: string;
    phone: string;
    authenticated: boolean;
    auth_token?: string;
    currency?: string;
    locale?: string;
    session: Session;
    session_store: string;
    session_path?: string;
    valid_store: boolean;
}
