#!/usr/bin/env node

'use strict';

const md5File = require('md5-file/promise');
const Promise = require('bluebird');
const download = require('download');
const parseCsv = require('csv-parse/lib/sync');
const fs = require('fs-extra');
const url = require('url');

if ( process.argv.length !== 3 ) {
    console.error('Download URL is required');
    return -1;
}

let csvUrl = process.argv[2];
let maxParallelDownloads = 5;
let downloadDir = '/tmp/nodejs-md5-downloader';

fs.emptyDirSync(downloadDir);

download(csvUrl)
    .then((data) => {
       return parseCsv(data);
    })
    .then((records) => {
        return Promise.map(records, record => {
            return processTask({
                fileUrl: record[0],
                filePath: url.parse(record[0]).path,
                expectedMd5: record[1]
            });
        }, {concurrency: maxParallelDownloads});
    })
    .catch((error) => {
        console.error("Failed to process csv: %s, error: %s", csvUrl, error);
    });

function processTask(task) {
  let filePathFull = downloadDir + task.filePath;
  return download(task.fileUrl, downloadDir, { filename: task.filePath })
        .then(() => {
          return md5File(filePathFull);
        })
        .then((receivedMd5) => {
            let message = 'Downloaded file: %s, expected md5: %s, received md5: %s';
            console.log(message, filePathFull, task.expectedMd5, receivedMd5);
        })
        .catch((error) => {
            console.error('Failed to process url: %s, error: %s', task.fileUrl, error);
        });
}
