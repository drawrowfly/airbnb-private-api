/* eslint-disable */
import { user_types, reservation_order } from '../constant';

export const random_id = (length, upper) => {
    let result = '';
    const characters = upper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' : 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export const validate_user_type = (type: string) => !!~user_types.indexOf(type);

export const validate_reservation_order = (type: string) => !!~reservation_order.indexOf(type);
