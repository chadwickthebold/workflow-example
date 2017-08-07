#!/usr/bin/env node
'use strict';

const VALID_RELEASE_TYPES = ['major', 'minor', 'patch'];

const args = process.argv.slice(2);
const releaseType = args[0];
console.log('args for this script: ', args);
console.log('running the script with node', process.version);

if (VALID_RELEASE_TYPES.indexOf(releaseType) === -1) {
    console.error('release must be one of', VALID_RELEASE_TYPES);
    process.exit(1);
}

console.log('congrats, you ran the script!');
