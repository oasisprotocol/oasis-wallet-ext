import assert from 'assert';
import { dump } from '../src/utils/dump';

describe('CBOR dump', () => {
    it('Handles weird stuff', () => {
        const result = dump({
            bytes: new Uint8Array([1, 2, 3]),
            map: new Map([
                [new Uint8Array([4, 5, 6]), 'bytes key'],
                [['a', 'b'], 'array key'],
                [{c: 'd'}, 'map key'],
                [new Map([[7, 8]]), 'captial-m map key'],
                [9, 'number key'],
                [8_000_000_000n, 'long key'],
            ]),
            long: 8_000_000_000n,
        });
        console.log('result', result);
        assert(result.includes('"bytes": "b AQID"'), 'bytes value');
        assert(result.includes('"b BAUG": "bytes key"'), 'bytes key');
        assert(result.includes('"[\\"a\\",\\"b\\"]": "array key"'), 'array key');
        assert(result.includes('"{\\"c\\":\\"d\\"}": "map key"'), 'map key');
        assert(result.includes('"{\\"n 7\\":8}": "captial-m map key"'), 'capital-m map key');
        assert(result.includes('"n 9": "number key"'), 'number key');
        assert(result.includes('"n 8000000000": "long key"'), 'long key');
        assert(result.includes('"long": "n 8000000000"'), 'long value');
    });
});
