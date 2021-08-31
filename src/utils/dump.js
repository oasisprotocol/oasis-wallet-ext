import { encode } from 'base64-arraybuffer';

/**
 * @param {Uint8Array} u8
 */
function replaceU8(u8) {
    const start = u8.byteOffset;
    const end = start + u8.byteLength;
    const buf = u8.buffer.slice(start, end);
    return encode(buf);
}

function replaceDisplayKey(k) {
    if (typeof k === 'string') {
        return k;
    } else if (typeof k === 'number' || typeof k === 'bigint') {
        return 'n ' + k;
    } else if (k instanceof Uint8Array) {
        return 'b ' + replaceU8(k);
    }
    return JSON.stringify(k, replacer);
}

function replaceDisplayValue(v) {
    if (typeof v === 'bigint') {
        return 'n ' + v;
    } else if (v instanceof Uint8Array) {
        return 'b ' + replaceU8(v);
    } else if (v instanceof Map) {
        const o = {};
        for (const [key, val] of v) {
            o[replaceDisplayKey(key)] = val;
        }
        return o;
    }
    return v;
}

function replacer(_k, v) {
    return replaceDisplayValue(v);
}

/**
 * In some (hopefully fallback) cases, we display a CBOR-compatible value.
 * The conversion is lossy, and there is no way back.
 * This implementation is based on JSON, with some hacks to support the richer data types.
 */
export function dump(v) {
    return JSON.stringify(v, replacer, 2);
}
