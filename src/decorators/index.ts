export function require_auth(target: Object, key: string, descriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
        descriptor.value = function(...args: any[]) {
            if (this._authenticated) {
                return original.apply(this, args);
            } else {
                console.log('\x1b[36m%s\x1b[0m', `Method ${original.name} requires authentication. If you have not authorized before then you need to call _authentication() method. If you already did authorization then call _load_session() method.`);
                return null;
            }
        };
    } else {
        return descriptor;
    }
}

export function require_args(num: number) {
    return function decorator(target: Object, key: string, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            descriptor.value = function(...args: any[]) {
                if (args.length < num) {
                    console.log('\x1b[36m%s\x1b[0m', `Method ${original.name} requires ${num} arguments and you passed ${args.length}`);
                    return null;
                }
                return original.apply(this, args);
            };
        } else {
            return descriptor;
        }
    };
}
