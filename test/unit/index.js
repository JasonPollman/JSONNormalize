import crypto from 'crypto';
import JSONNormalize, {
  normalizeAsync,
  stringifyAsync,
  normalizeSync,
  stringifySync,
  hash,
  normalize,
} from '../../src/index';

const basicValues = [
  {},
  [],
  { foo: 'bar' },
  { bar: 'baz', foo: 'bar' },
  [1, 2, 3],
  [{ a: 1 }, { b: 2 }],
  ['a', 'b', null, 'c'],
  ['a', 'b', undefined, 'c'],
  { a: 1, b: 2, c: undefined, d: null },
  { a: 1, b: 2, c: undefined, d: null, e: { a: 1, b: 2, c: undefined, d: null } },
];

const orderedValues = [
  { foo: 'bar', bar: 'baz' },
  { foo: 'bar', b: 1, a: { z: 0, y: 9 } },
  [{ z: 2, y: 1 }, { z: 2, y: 1 }, { y: 1, z: 2 }],
  [
    [{ z: 2, y: 1 }, { z: 2, y: 1 }, { y: 1, z: 2 }],
    [{ z: 2, y: 1 }, { z: 2, y: 1 }, { y: 1, z: 2 }],
    [{ z: 2, y: 1 }, { z: 2, y: 1 }, { y: 1, z: 2 }],
  ],
  {
    z: {
      z: {
        z: {
          a: 1,
        },
        y: {
          a: 1,
        },
      },
      y: {
        z: {
          a: 1,
        },
        y: {
          a: 1,
        },
      },
    },
    y: {
      z: {
        z: {
          a: 1,
        },
        y: {
          a: 1,
        },
      },
      y: {
        z: {
          a: 1,
        },
        y: {
          a: 1,
        },
      },
    },
  },
];

describe('JSONNormalize', () => {
  describe('JSONNormalize.normalize', () => {
    describe('Edge cases', () => {
      it('Should return immediately if no callback is passed/or the callback isn\'t a function', () => {
        expect(normalize(-1)).to.equal(undefined);
      });
    });

    describe('Primitive Values', () => {
      const values = ['string', 1, null, undefined, () => {}];
      const types = ['string', 'number', 'null', 'undefined', 'function'];

      types.forEach((type, i) => {
        it(`Should return the same value as JSON.stringify (${type})`, async () => {
          expect(await normalizeAsync(values[i])).to.equal(JSON.stringify(values[i]));
        });
      });
    });

    describe('Objects (key ordering irrelevant, JSONNormalize.normalize)', () => {
      basicValues.forEach((value, i) => {
        it(`Should return the same value as JSON.stringify (${i + 1})`, async () => {
          expect(await normalizeAsync(basicValues[i])).to.equal(JSON.stringify(basicValues[i]));
        });
      });
    });

    describe('Objects (key ordering important)', () => {
      const expected = [
        '{"bar":"baz","foo":"bar"}',
        '{"a":{"y":9,"z":0},"b":1,"foo":"bar"}',
        '[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}]',
        '[[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}],[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}],[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}]]',
        '{"y":{"y":{"y":{"a":1},"z":{"a":1}},"z":{"y":{"a":1},"z":{"a":1}}},"z":{"y":{"y":{"a":1},"z":{"a":1}},"z":{"y":{"a":1},"z":{"a":1}}}}',
      ];

      orderedValues.forEach((value, i) => {
        it(`Should return the normalized JSON stringifed values (${i + 1})`, async () => {
          expect(await normalizeAsync(orderedValues[i])).to.equal(expected[i]);
        });
      });
    });

    describe('Objects (key ordering irrelevant, JSONNormalize.stringify)', () => {
      basicValues.forEach((value, i) => {
        it(`Should return the same value as JSON.stringify (${i + 1})`, async () => {
          expect(await stringifyAsync(basicValues[i])).to.equal(JSON.stringify(basicValues[i]));
        });
      });
    });

    describe('Replacer parameter', () => {
      it('Should strip functions if no replacer is provided (object)', async () => {
        const data = { foo: () => {}, bar: () => {} };
        expect(await normalizeAsync(data)).to.eql(JSON.stringify({}));
      });

      it('Should replace functions with null if no replacer is provided (array)', async () => {
        const data = [() => {}, () => {}];
        expect(await normalizeAsync(data)).to.eql(JSON.stringify([null, null]));
      });

      it('Should ignore replacers that return functions', async () => {
        const data = { foo: () => {}, bar: () => {} };
        expect(await normalizeAsync(data, () => () => true)).to.eql(
          JSON.stringify(undefined));
      });

      it('Should ignore non-function replacers', async () => {
        const data = { foo: () => {}, bar: () => {}, baz: 'z' };
        expect(await normalizeAsync(data)).to.eql(JSON.stringify({ baz: 'z' }));
      });

      it('Should work like JSON.stringify\'s replacer parameter', async () => {
        const data = { foo: () => {}, bar: () => {} };
        const replacer = (k, v) => (typeof v === 'function' ? true : v);

        expect(await normalizeAsync(data, replacer)).to.eql(
          JSON.stringify({ bar: true, foo: true }));
      });

      it('Should pass the key/value arguments to the replacer function', async () => {
        const data = { a: 1, b: 2, c: [1, 2, 3], d: () => {} };
        const replacer = (k, v) => {
          expect(k).to.be.oneOf([undefined, 'a', 'b', 'c', 'd', '0', '1', '2']);
          switch (k) {
            case undefined: expect(v).to.equal(data); break;
            case '0':
            case 'a': expect(v).to.equal(1); break;
            case '1':
            case 'b': expect(v).to.equal(2); break;
            case '2': expect(v).to.equal(3); break;
            case 'c': expect(v).to.eql([1, 2, 3]); break;
            default: expect(v).to.be.a('function');
          }

          return v;
        };

        expect(await normalizeAsync(data, replacer)).to.eql(
          JSON.stringify({ a: 1, b: 2, c: [1, 2, 3], d: () => {} }));
      });
    });
  });

  describe('JSONNormalize.normalizeSync', () => {
    describe('Primitive Values', () => {
      const values = ['string', 1, null, undefined, () => {}];
      const types = ['string', 'number', 'null', 'undefined', 'function'];

      types.forEach((type, i) => {
        it(`Should return the same value as JSON.stringify (${type})`, () => {
          expect(normalizeSync(values[i])).to.equal(JSON.stringify(values[i]));
        });
      });
    });

    describe('Objects (key ordering irrelevant, JSONNormalize.normalize)', () => {
      basicValues.forEach((value, i) => {
        it(`Should return the same value as JSON.stringify (${i + 1})`, () => {
          expect(normalizeSync(basicValues[i])).to.equal(JSON.stringify(basicValues[i]));
        });
      });
    });

    describe('Objects (key ordering important)', () => {
      const expected = [
        '{"bar":"baz","foo":"bar"}',
        '{"a":{"y":9,"z":0},"b":1,"foo":"bar"}',
        '[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}]',
        '[[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}],[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}],[{"y":1,"z":2},{"y":1,"z":2},{"y":1,"z":2}]]',
        '{"y":{"y":{"y":{"a":1},"z":{"a":1}},"z":{"y":{"a":1},"z":{"a":1}}},"z":{"y":{"y":{"a":1},"z":{"a":1}},"z":{"y":{"a":1},"z":{"a":1}}}}',
      ];

      orderedValues.forEach((value, i) => {
        it(`Should return the normalized JSON stringifed values (${i + 1})`, () => {
          expect(normalizeSync(orderedValues[i])).to.equal(expected[i]);
        });
      });
    });

    describe('Objects (key ordering irrelevant, JSONNormalize.stringify)', () => {
      basicValues.forEach((value, i) => {
        it(`Should return the same value as JSON.stringify (${i + 1})`, () => {
          expect(stringifySync(basicValues[i])).to.equal(JSON.stringify(basicValues[i]));
        });
      });
    });

    describe('Replacer parameter', () => {
      it('Should strip functions if no replacer is provided (object)', () => {
        const data = { foo: () => {}, bar: () => {} };
        expect(normalizeSync(data)).to.eql(JSON.stringify({}));
      });

      it('Should replace functions with null if no replacer is provided (array)', () => {
        const data = [() => {}, () => {}];
        expect(normalizeSync(data)).to.eql(JSON.stringify([null, null]));
      });

      it('Should ignore replacers that return functions', () => {
        const data = { foo: () => {}, bar: () => {} };
        expect(normalizeSync(data, () => () => true)).to.eql(
          JSON.stringify(undefined));
      });

      it('Should ignore non-function replacers', () => {
        const data = { foo: () => {}, bar: () => {}, baz: 'z' };
        expect(normalizeSync(data)).to.eql(JSON.stringify({ baz: 'z' }));
      });

      it('Should work like JSON.stringify\'s replacer parameter', () => {
        const data = { foo: () => {}, bar: () => {} };
        const replacer = (k, v) => (typeof v === 'function' ? true : v);

        expect(normalizeSync(data, replacer)).to.eql(
          JSON.stringify({ bar: true, foo: true }));
      });

      it('Should pass the key/value arguments to the replacer function', () => {
        const data = { a: 1, b: 2, c: [1, 2, 3], d: () => {} };
        const replacer = (k, v) => {
          expect(k).to.be.oneOf([undefined, 'a', 'b', 'c', 'd', '0', '1', '2']);
          switch (k) {
            case undefined: expect(v).to.equal(data); break;
            case '0':
            case 'a': expect(v).to.equal(1); break;
            case '1':
            case 'b': expect(v).to.equal(2); break;
            case '2': expect(v).to.equal(3); break;
            case 'c': expect(v).to.eql([1, 2, 3]); break;
            default: expect(v).to.be.a('function');
          }

          return v;
        };

        expect(normalizeSync(data, replacer)).to.eql(
          JSON.stringify({ a: 1, b: 2, c: [1, 2, 3], d: () => {} }));
      });
    });
  });

  describe('JSONNormalize.hash', () => {
    it('The algorithm should default to md5', async () => {
      expect(hash('foo')).to.equal('acbd18db4cc2f85cedef654fccc4a4d8');
    });
  });

  ['md5', 'sha256', 'sha512'].forEach((algo) => {
    describe(`JSONNormalize.${algo}`, () => {
      describe('Edge cases', () => {
        it('Should return immediately if no callback is passed/or the callback isn\'t a function', () => {
          expect(JSONNormalize[`${algo}`]({})).to.equal(undefined);
        });
      });

      describe('Hashing Objects', () => {
        basicValues.forEach((value, i) => {
          it(`Should return a ${algo} string, equivalent to hash[algorithm](JSON.stringify([value])) (${i + 1})`, async () => {
            expect(await JSONNormalize[`${algo}Async`](value)).to.equal(
              crypto.createHash(algo).update(JSON.stringify(value)).digest('hex'));
          });
        });
      });
    });
  });

  ['md5', 'sha256', 'sha512'].forEach((algo) => {
    describe(`JSONNormalize.${algo}`, () => {
      describe('Hashing objects', () => {
        basicValues.forEach((value, i) => {
          it(`Should return a ${algo} string, equivalent to hash[algorithm](JSON.stringify([value])) (${i + 1})`, () => {
            expect(JSONNormalize[`${algo}Sync`](value)).to.equal(
              crypto.createHash(algo).update(JSON.stringify(value)).digest('hex'));
          });
        });
      });
    });
  });
});
