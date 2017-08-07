#!/usr/bin/env node
'use strict';

const fs = require('fs');
const cp = require('child_process');
const exec = cp.exec;

const VALID_RELEASE_TYPES = ['major', 'minor', 'patch'];
const CHANGELOG_FILENAME = 'CHANGELOG.md';
const PREVIOUS_VERSION_REGEX = /## \[v(\d*\.\d*\.\d*)\]/g;
const CHANGELOG_NEW_VERSION_LINE = 7;
const PROJECT_GITHUB_LINK = 'https://github.com/chadwickthebold/workflow-example';
const UNRELEASED_LINK_TARGET = '[Unreleased]: ' + PROJECT_GITHUB_LINK;
const PACKAGE_JSON_VERSION_INDEX = 2;
const PACKAGE_JSON_VERSION_PREFIX = '  "version": '

function leftpad(str, padString, length) {
    while (str.length < length)
        str = padString + str;
    return str;
};

function buildReleaseDate() {
  const today = new Date();
  const releaseDate = [
    today.getFullYear(),
    leftpad((today.getMonth() + 1) + '', '0', 2),
    leftpad(today.getDate() + '', '0', 2)
  ];

  return releaseDate.join('-');
}

console.log('****************** START CNT Releaser ******************');

const args = process.argv.slice(2);
const releaseType = args[0];

if (VALID_RELEASE_TYPES.indexOf(releaseType) === -1) {
  console.error('release must be one of', VALID_RELEASE_TYPES);
  process.exit(1);
}

const releaseDate = buildReleaseDate();

// Start by editing CHANGELOG.md
fs.readFile(CHANGELOG_FILENAME, 'utf8', function(err, data) {
  if (err) {
    throw err;
  }

  const changelogContentArray = data.split('\n');
  const versionMatch = PREVIOUS_VERSION_REGEX.exec(data);
  let previousVersion = versionMatch[1].split('.').map((versionNum) => {
    return parseInt(versionNum, 10);
  });
  let nextVersion;

  switch (releaseType) {
    case 'major':
      nextVersion = '' + (previousVersion[0] + 1) + '.0.0';
      break;
    case 'minor':
      nextVersion = '' + previousVersion[0] + '.' + (previousVersion[1] + 1) + '.0';
      break;
    case 'patch':
      nextVersion = '' +previousVersion[0] + '.' + previousVersion[1] + '.' + (previousVersion[2] + 1);
      break;
  }

  previousVersion = previousVersion.join('.');
    
  console.log('previous version was v' + previousVersion);
  console.log('next version is v' + nextVersion);
  console.log('release date', releaseDate);
  
  const newUnreleasedLink = '[Unreleased]: '+ PROJECT_GITHUB_LINK + '/compare/v' + nextVersion + '...HEAD'
  const newVersionLink = '[v' + nextVersion + ']: '+ PROJECT_GITHUB_LINK + '/compare/v' + previousVersion + '...v' + nextVersion;
  let githubChangeLinkIndex = 0;

  changelogContentArray.some((lineStr, index) => {
    githubChangeLinkIndex = index;
    return lineStr.indexOf(UNRELEASED_LINK_TARGET) !== -1;
  })

  changelogContentArray[githubChangeLinkIndex] = newUnreleasedLink;
  changelogContentArray.splice(githubChangeLinkIndex + 1, 0, newVersionLink);

  const newVersionHeading = '## [v' + nextVersion + '] - ' + releaseDate;

  changelogContentArray.splice(CHANGELOG_NEW_VERSION_LINE, 0, '', newVersionHeading);

  var result = changelogContentArray.join('\n');

  // Save CHANGELOG.md
  fs.writeFile(CHANGELOG_FILENAME, result, 'utf8', function (err) {
    if (err){
      return console.log(err);
    }

    fs.readFile('package.json', 'utf8', function(err, packageData) {
      if (err) {
        throw err;
      }

      const packageArray = packageData.split('\n');

      packageArray[PACKAGE_JSON_VERSION_INDEX] = PACKAGE_JSON_VERSION_PREFIX + '"' + nextVersion + '",';

      const packageResult = packageArray.join('\n');

      fs.writeFile('package.json', packageResult, 'utf8', function (err) {
        if (err){
          return console.log(err);
        }

        exec('git --no-pager diff', (err, stdout, stderr) => {
          if (err) {
            // node couldn't execute the command
            return;
          }

          // the *entire* stdout and stderr (buffered)
          console.log('**************** START COMMIT SUMMARY ****************');
          console.log(`stdout: ${stdout}`);
          console.log('***************** END COMMIT SUMMARY *****************');
          console.log('**************** END CNT Releaser ****************');
        });
      });
    });
  });
});
