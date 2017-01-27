import crypto from 'crypto';

/**
 * Used by serialize to handle literal values.
 * @param {function} recurse The serialize function.
 * @param {string} key The key for the current value (if one exists).
 * @param {string|number|boolean|null} value The literal to parse.
 * @param {function|undefined} replacer The replacer function.
 * @param {function} done A callback for completion.
 * @returns {string} The JSON.stringified literal value.
 */
function handleLiteral(recurse, key, value, replacer, done) {
  let error = null;
  let results;

  // Attempt to JSON parse literal value
  try { results = JSON.stringify(value); } catch (e) { error = e; }
  return done(error, results);
}

/**
 * Used by serialize to array and plain object values.
 * @param {object|Array} object The object to process.
 * @param {function} recurse The serialize function.
 * @param {function|undefined} replacer The replacer function.
 * @param {function} done A callback for completion.
 * @returns {string} The JSON.stringified object value.
 */
function handleObject(recurse, obj, replacer, done) {
  const keys = Object.keys(obj);
  const isArray = obj instanceof Array;
  let handledError = null;
  let complete = 0;
  const values = [];

  const onComplete = () => done(null, isArray
    ? `[${values.map(v => (v === null ? 'null' : v)).join(',')}]`
    : `{${values.sort().filter(Boolean).join(',')}}`);

  // When an object key is serialized, it calls this method as its callback.
  const onSerialized = (e, value) => {
    if (handledError) {
      return null;
    } else if (e) {
      handledError = e;
      return done(e);
    }

    values.push(typeof value === 'undefined' ? null : value);
    if (++complete !== keys.length) return null;
    return onComplete();
  };

  // Serializes each item in an array.
  const mapArray = key =>
    recurse(typeof obj[key] === 'undefined' ? null : obj[key], replacer, onSerialized, key);

  // Serializes each item in an object.
  const mapObject = key => (typeof obj[key] === 'undefined'
    ? onSerialized(null, null)
    : recurse(obj[key], replacer, (e, val) => onSerialized(e, typeof val === 'undefined' ? null : `"${key}":${val}`), key));

  // Map the object's keys to its respective object type function
  return keys.length === 0
    ? onComplete()
    : keys.map(isArray ? mapArray : mapObject);
}

/**
 * Seralizes an object into "normalized json", which can be used as a key, etc.
 * @param {object} obj The object to serialize.
 * @param {function=} replacer A function that's called for each item, like the replacer
 * function passed to JSON.stringify.
 * @param {function} complete A callback for completion.
 * @returns {string} A "normalized JSON string", which always returns the same string, if passed
 * the same object, regardless of key order.
 */
function serialize(obj, replacer, complete, key) {
  let onValue = replacer;
  let done = complete;

  // Rearrange arguements for replacer/complete parameters based on value
  if (typeof done === 'undefined' && typeof onValue === 'function') {
    done = onValue;
    onValue = undefined;
  }

  // No reason to continue, no callback was provided.
  if (typeof done !== 'function') return;

  // Simulates the JSON.stringify replacer function
  let value = obj;
  if (typeof onValue === 'function') {
    value = onValue(key, value);
    onValue = typeof value === 'object' ? onValue : undefined;
  } else if (typeof value === 'function') {
    value = undefined;
  }

  process.nextTick(() => (!value || typeof value !== 'object'
    ? handleLiteral(serialize, key, value, onValue, done)
    : handleObject(serialize, value, onValue, done)));
}

/**
 * Exported wrapper around the serialize function.
 * @param {object} obj The object to serialize.
 * @param {function=} replacer A function that's called for each item, like the replacer
 * function passed to JSON.stringify.
 * @param {function} complete A callback for completion.
 * @returns {string} A "normalized JSON string", which always returns the same string, if passed
 * the same object, regardless of key order.
 */
export function normalize(obj, replacer, complete) {
  return serialize(obj, replacer, complete);
}

/**
 * Alias for "normalize".
 * @param {object} obj The object to serialize.
 * @param {function=} replacer A function that's called for each item, like the replacer
 * function passed to JSON.stringify.
 * @param {function} complete A callback for completion.
 * @returns {string} A "normalized JSON string", which always returns the same string, if passed
 * the same object, regardless of key order.
 */
export function stringify(...args) {
  return normalize(...args);
}

/**
 * Returns a hash for the given string.
 * @param {string} input The string to get the hash of.
 * @param {string} algorithm The algorithm to use to perform the hash.
 * @returns {string} The hash for the given string/alogrithm.
 */
export function hash(input, algorithm = 'md5') {
  return crypto.createHash(algorithm).update(input).digest('hex');
}

/**
 * Returns the md5 hash for the JSON normalized object passed in.
 * @param {any} input The input to get the md5 hash for.
 * @param {function} done A callback for completion.
 * @returns {string} An md5 hash representing the given object.
 */
export function md5(input, done) {
  if (typeof done !== 'function') return;
  serialize(input, (e, serialized) => done(e || null, e ? undefined : hash(serialized, 'md5')));
}

/**
 * Returns the sha256 hash for the JSON normalized object passed in.
 * @param {any} input The input to get the sha256 hash for.
 * @param {function} done A callback for completion.
 * @returns {string} An sha256 hash representing the given object.
 */
export function sha256(input, done) {
  if (typeof done !== 'function') return;
  serialize(input, (e, serialized) => done(e || null, e ? undefined : hash(serialized, 'sha256')));
}

/**
 * Returns the sha512 hash for the JSON normalized object passed in.
 * @param {any} input The input to get the sha512 hash for.
 * @param {function} done A callback for completion.
 * @returns {string} An sha512 hash representing the given object.
 */
export function sha512(input, done) {
  if (typeof done !== 'function') return;
  serialize(input, (e, serialized) => done(e || null, e ? undefined : hash(serialized, 'sha512')));
}

// Promisify this library
const promisified = Promise.promisifyAll(exports);

Object.assign(exports, promisified);
export default exports;
