/* eslint-disable */
export function requireAuth(target: object, key: string, descriptor: any) {
    const original = descriptor.value;
    if (typeof original === 'function') {
        descriptor.value = function(...args: any[]) {
            if (this.authenticated) {
                return original.apply(this, args);
            }
            throw new Error(
                `Method ${original.name} requires authentication. If you have not authorized before then you need to call _authentication() method. If you already did authorization then call _load_session() method.`,
            );
        };
    } else {
        return descriptor;
    }
}

export function requiredArguments(requiredArgs: string[]) {
    return function decorator(target: object, key: string, descriptor: any) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            const missingArguments: string[] = [];
            let missingOrArguments: string[] = [];
            descriptor.value = function(...args: any[]) {
                for (const arg of requiredArgs) {
                    let orArgs: string[] = [];
                    if (arg.indexOf('|') > -1) {
                        orArgs = arg.split('|');
                        for (const orArg of orArgs) {
                            if (!this[orArg]) {
                                missingOrArguments.push(orArg);
                            } else {
                                missingOrArguments = [];
                                break;
                            }
                        }
                    } else if (!this[arg]) {
                        missingArguments.push(arg);
                    }
                }
                if (missingOrArguments.length) {
                    throw new Error(`Method ${original.name} is missing required arguments: ${missingOrArguments.join(' or ')}`);
                }
                if (missingArguments.length) {
                    throw new Error(`Method ${original.name} is missing required arguments: ${missingArguments}`);
                }

                return original.apply(this, args);
            };
        } else {
            return descriptor;
        }
    };
}
