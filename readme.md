# JSON Normalize

Stringifies objects in a *normalized* way for use in caching or comparing JSON.

## Why?

Key ordering is rendered "as is" when using *JSON.stringify*.    
This makes it impractical to use stringified values for hashing or caching.

```js
// Using JSON.stringify
JSON.stringify({ foo: 'bar', hello: 'world' }); // => {"foo":"bar","hello":"world"}
JSON.stringify({ hello: 'world', foo: 'bar' }); // => {"hello":"world","foo":"bar"}
```

``JSONNormalize`` stringifies objects in a "normalized" way by sorting object keys to produce
the same JSON string every time.

```js
// Using JSON Normalize
const JSONNormalize = require('json-normalize'); 

JSONNormalize.stringify({ foo: 'bar', hello: 'world' }, (err, results) => {
  // results === {"foo":"bar","hello":"world"}
});

JSONNormalize.stringify({ hello: 'world', foo: 'bar' }, (err, results) => {
  // results === {"foo":"bar","hello":"world"}
});
```

## API

### JSONNormalize.stringify
*Stringifies objects in a normalized way.*    
Given an object with any key order, the same string will be returned if the objects are the "equivalent".

> **JSONNormalize.stringify**(value[, replacer], callback)

#### Parameters

**value** *{any}*    
The value to "stringify".

**replacer** *{function=}*    
Eqivalent to the *replacer* parameter *JSON.stringify* has.

**callback** *{function}*    
Invoked with two arguments: *error* and *results*.

#### Returns
*{undefined}*

#### Example

```js
const JSONNormalize = require('json-normalize'); 

JSONNormalize.stringify([{ x: 4, y: 3 }, { x: 5, y: 7 }, { y: 2, x: 4 }], (err, results) => {
  console.log(results); // Prints: [{"x":4,"y":3},{"x":5,"y":7},{"x":4,"y":2}]
});

JSONNormalize.stringify([{ y: 3, x: 4 }, { y: 7, x: 5 }, { y: 2, x: 4 }], (err, results) => {
  console.log(results); // Prints: [{"x":4,"y":3},{"x":5,"y":7},{"x":4,"y":2}]
});
```


### JSONNormalize.stringifySync
Syncronous version of *JSONNormalize.stringify*

> **JSONNormalize.stringify**(value[, replacer], callback)

#### Parameters

**value** *{any}*    
The value to "stringify".

**replacer** *{function=}*    
Eqivalent to the *replacer* parameter *JSON.stringify* has.

#### Returns
*{string}* A valid JSON string.

#### Example

```js
const JSONNormalize = require('json-normalize'); 

const results = JSONNormalize.stringifySync([{ x: 4, y: 3 }, { x: 5, y: 7 }, { y: 2, x: 4 }]);
console.log(results); // Prints: [{"x":4,"y":3},{"x":5,"y":7},{"x":4,"y":2}]

const results = JSONNormalize.stringifySync([{ y: 3, x: 4 }, { y: 7, x: 5 }, { y: 2, x: 4 }]);
console.log(results); // Prints: [{"x":4,"y":3},{"x":5,"y":7},{"x":4,"y":2}]
```



### JSONNormalize.normalize
***An alias for JSONNormalize.stringify.***

> **JSONNormalize.normalize**(value[, replacer], callback)

#### Parameters

**value** *{any}*    
The value to "stringify".

**replacer** *{function=}*    
Eqivalent to the *replacer* parameter *JSON.stringify* has.

**callback** *{function}*    
Invoked with two arguments: *error* and *results*.

#### Returns
*{undefined}*

#### Example

```js
const JSONNormalize = require('json-normalize'); 

JSONNormalize.normalize(
  {
    a: [{ c: 'cat', b: 'bat' }, { z: 'zebra', a: 'apple' }],
    b: [{ c: 'cheeta', b: 'balloon' }, { z: 'zephyr', a: 'alligator' }],
  },
  (err, results) => {
    // Do something...
  });
```


### JSONNormalize.normalizeSync
***An alias for JSONNormalize.stringifySync.***

> **JSONNormalize.normalize**(value[, replacer], callback)

#### Parameters

**value** *{any}*    
The value to "stringify".

**replacer** *{function=}*    
Eqivalent to the *replacer* parameter *JSON.stringify* has.

**callback** *{function}*    
Invoked with two arguments: *error* and *results*.

#### Returns
*{string}* A valid JSON string.

#### Example

```js
const JSONNormalize = require('json-normalize'); 
const results = JSONNormalize.normalizeSync({
    a: [{ c: 'cat', b: 'bat' }, { z: 'zebra', a: 'apple' }],
    b: [{ c: 'cheeta', b: 'balloon' }, { z: 'zephyr', a: 'alligator' }],
});

// Do something with results...
```



---

**Note: The rest of the functions are convenience functions!**    
They're wrappers around node's ``crypto`` module that take the given object,
``JSONNormalize.normalize`` it, and then pipe it to ``crypto.createHash``.

---



### JSONNormalize.md5
Gets the *md5* hash for the given object.

> **JSONNormalize.md5**(value, callback)

#### Parameters

**value** *{any}*    
The value to get the md5 hash of.

**callback** *{function}*    
Invoked with two arguments: *error* and *results*.

#### Returns
*{undefined}*

#### Example

```js
const objectMD5 = require('json-normalize').md5;
objectMD5({ id: 0, name: 'john doe', permissions: ['create', 'delete'] }, (err, md5) => {
  console.log(md5) // Prints: 5520bfd66f9b4a90a0ec08966bc23e6c
});

objectMD5({ permissions: ['create', 'delete'], name: 'john doe', id: 0 }, (err, md5) => {
  console.log(md5); // Prints: 5520bfd66f9b4a90a0ec08966bc23e6c
});
```


### JSONNormalize.sha256
Gets the *sha256* hash for the given object.

> **JSONNormalize.sha256**(value, callback)

#### Parameters

**value** *{any}*    
The value to get the sha256 hash of.

**callback** *{function}*    
Invoked with two arguments: *error* and *results*.

#### Returns
*{undefined}*

#### Example

```js
const objectSHA256 = require('json-normalize').sha256;

objectSHA256({ id: 0, name: 'john doe', permissions: ['create', 'delete'] }, (err, sha256) => {
  console.log(sha256); // Prints: d1a29dbf32dc7781cd8f0e47cc7b6f625a293cb0e1357c62df1836ad0f934ad7
});

objectSHA256({ permissions: ['create', 'delete'], name: 'john doe', id: 0 }, (err, sha256) => {
  console.log(sha256); // Prints: d1a29dbf32dc7781cd8f0e47cc7b6f625a293cb0e1357c62df1836ad0f934ad7
});
```



### JSONNormalize.sha512
Gets the *sha512* hash for the given object.

> **JSONNormalize.sha512**(value, callback)

#### Parameters

**value** *{any}*    
The value to get the sha512 hash of.

**callback** *{function}*    
Invoked with two arguments: *error* and *results*.

#### Returns
*{undefined}*

#### Example

```js
const objectSHA512 = require('json-normalize').sha512;

objectSHA512({ id: 0, name: 'john doe', permissions: ['create', 'delete'] }, (err, sha512) => {
  console.log(sha256); // Prints: d99768bd03fbc865944c6045e1c530bbbd0a10bc74cc39faceda4fdc4...
});

objectSHA512({ permissions: ['create', 'delete'], name: 'john doe', id: 0 }, (err, sha512) => {
  console.log(sha256); // Prints: d99768bd03fbc865944c6045e1c530bbbd0a10bc74cc39faceda4fdc4...
});
```

### JSONNormalize.md5Sync
Syncronous version of *JSONNormalize.md5*

### JSONNormalize.sha256Sync
Syncronous version of *JSONNormalize.sha256*

### JSONNormalize.sha512Sync
Syncronous version of *JSONNormalize.md5*



### *All methods have an async equivalent that returns a promise (via Bluebird)*    
For example, *JSONNormalize.stringify*'s promisified version is *JSONNormalize.stringifyAsync*

```js
const stringifyAsync = require('json-normalize').stringifyAsync;
cosnt myObject = { foo: 'bar' };

// Using promises
stringifyAsync(myObject)
  .then((results) => { ... })
  .catch((error) => { ... });
                     
// Even better with async/await
(async () => {
  const results = await stringifyAsync(myObject);
})();
```



### A Practical Use Case
Using objects as cache keys

```js
import db from 'my-database-library';
import { md5 } from 'json-normalize';

/**
 * Stores database records for quick lookup.
 * @type {object<any>}
 */
const cache = {};

/**
 * Gets a user record from the database with the properties provided in the object "data".
 * @param {object} data The data to use to lookup the user with.
 * @returns {object|undefined} The user's record, if it exists.
 */
async function getUserWithProperties(data = {}) {
  // Argument for data could contain id, name, username, etc.
  const key = await md5(data);
  const cached = cache[key];
  
  // Cached user record found, return it.
  if (cached) return cached;
  
  // No cache found, do some time expensive database lookup
  const results = await db.getUserWithProperties(data);

  cache[key] = results;
  return results;
}
```

### A (not so) Practical Use Case
Comparing JSON files

``foo.json``
```json
{
  "alpha": "beta",
  "foo": "bar"
}
```

``bar.json``
```json
{
  "foo": "bar",
  "alpha": "beta"
}
```

```js
import { normalizeAsync } from 'json-normalize';
import fs from 'fs-extra-promise';

/**
 * Compares the list of object arguments and checks for equivalency (===).
 * @param {...object} objects The object to compare.
 * @returns {boolean} True if every object === every other object.
 */
async function compareObjects(...objects) {
  const normalized = await Promise.all(objects.map(obj => normalizeAsync(obj)));
  return normalized.every(json => json === normalized[0]);
}

/**
 * Checks that the given list of filepath arguments contain "equivalent" json.
 * @param {...string} paths The list of filepaths to read and compare.
 * @returns {boolean} True if all files contain the same JSON.
 */
async function filesContainEquivalentObjects(...paths) {
  const objects = await Promise.all(paths.map(path => fs.readJsonAsync(path)));
  return await compareObjects(...objects);
}

(async () => {
  const filesAreEqual = await filesContainEquivalentObjects('./foo.json', './bar.json');
  console.log(filesAreEqual); // Prints: true
})();

```