#!/usr/bin/env node
'use strict';

const fs = require('fs');

const VALID_RELEASE_TYPES = ['major', 'minor', 'patch'];
const CHANGELOG_FILENAME = 'CHANGELOG.md';
const PREVIOUS_VERSION_REGEX = /## \[v(\d*\.\d*\.\d*)\]/g;

const args = process.argv.slice(2);
const releaseType = args[0];
console.log('args for this script: ', args);
console.log('running the script with node', process.version);

if (VALID_RELEASE_TYPES.indexOf(releaseType) === -1) {
  console.error('release must be one of', VALID_RELEASE_TYPES);
  process.exit(1);
}

fs.readFile(CHANGELOG_FILENAME, 'utf8', function(err, data) {  
  if (err) {
    throw err;
  }

  const versionMatch = PREVIOUS_VERSION_REGEX.exec(data);
  const previousVersion = versionMatch[1];
  console.log('previous version was v' + previousVersion);

  var result = data;

  fs.writeFile(CHANGELOG_FILENAME, result, 'utf8', function (err) {
    if (err){
      return console.log(err);
    }
  });
});

console.log('congrats, you ran the script!');
