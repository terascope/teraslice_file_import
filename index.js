'use strict';

var Promise = require('bluebird');
var fs = require("fs");
var path = require('path');
var Queue = require('queue');
var readline = require('readline');

var fileQueue = new Queue;

function newReader(context, opConfig, executionConfig) {
    if (opConfig.format === 'json_array') {
        return exportFn
    }
    return lineReader
}

function lineReader(msg, logger) {
    return new Promise(function(resolve, reject) {
        var results = [];
        var rl = readline.createInterface({
            input: fs.createReadStream(msg)
        });

        rl.on('line', function(line) {
            results.push(JSON.parse(line))
        });

        rl.on('close', function() {
            resolve(results)
        });

        rl.on('error', function(err) {
            logger.error(`Error reading from file: ${msg}, error: ${err.stack}`);
            reject(err.stack)
        })
    })

}

function exportFn(msg, logger) {
    return new Promise(function(resolve, reject) {
        fs.readFile(msg, 'utf-8', function(err, data) {
            if (err) {
                reject(err.stack)
            }
            resolve(JSON.parse(data))
        });
    })

}

function newSlicer(context, executionContext, retryData, logger) {
    var opConfig = getOpConfig(executionContext.config, 'teraslice_file_import');
    var slicers = [];
    //TODO review performance implications
    getFileNames(logger, opConfig, fileQueue);

    slicers.push(function() {
        return fileQueue.dequeue()
    });

    return Promise.resolve(slicers)
}

function schema() {
    return {
        path: {
            doc: 'Path to where the directory is located to read from',
            default: null,
            format: 'required_String'
        },
        format: {
            doc: 'Path to where the directory is located to read from',
            default: "json_lines",
            format: ["json_lines", "json_array"]
        }
    };
}

function walk(rootDir, callback) {
    fs.readdirSync(rootDir).forEach(function(filename) {
        var filePath = path.join(rootDir, filename);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath, callback);
        } else {
            callback(filePath, rootDir, filename);
        }
    });
}

function getFileNames(logger, opConfig, fileQueue) {
    logger.info("getting all file paths");

    walk(opConfig.path, function(filePath, rootDir, filename) {
        if (filename.charAt(0) !== '.') {
            fileQueue.enqueue(filePath)
        }
    });

    logger.info("All file paths have been enqueued");
}

function getOpConfig(job, name) {
    return job.operations.filter(function(op) {
        return op._op === name;
    })[0]
}

var parallelSlicers = false;

module.exports = {
    newReader: newReader,
    newSlicer: newSlicer,
    schema: schema,
    parallelSlicers: parallelSlicers
};