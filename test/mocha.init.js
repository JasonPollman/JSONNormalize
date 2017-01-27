import { should, expect, assert } from 'chai';

// Set test environment
process.env.NODE_ENV = 'test';

// Apply chai library to the global namespace so we don't have to require them in each file.
global.should = should;
global.expect = expect;
global.assert = assert;
