'use strict';

var Promise = require('bluebird');
var fs = require("fs");
var path = require('path');
var Queue = require('./queue');

var fileQueue = new Queue;

function newReader(context, opConfig, jobConfig) {
    return function(msg) {
        var data = fs.readFileSync(msg, 'utf-8');
        return JSON.parse(data);
    }
}

function newSlicer(context, job, retryData) {
    var opConfig = getOpConfig(job.jobConfig, 'file_import');
    var jobConfig = job.jobConfig;
    var slicers = [];
    //TODO review performance implications
    getFileNames(jobConfig, opConfig, fileQueue);

    slicers.push(function() {return fileQueue.dequeue()});

    return Promise.resolve(slicers)
}

function schema() {
    return {
        path: {
            doc: 'Path to where the directory is located to read from',
            default: null,
            format: 'required_String'
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

function getFileNames(jobConfig, opConfig, fileQueue) {
    var logger = jobConfig.logger;
    logger.info("getting all file paths");

    walk(opConfig.path, function(filePath, rootDir, filename) {
        if (filename.charAt(0) !== '.') {
            fileQueue.enqueue(filePath)
        }
    });

    logger.info("All file paths have been enqueued");
}

function getOpConfig(job, name){
    return job.operations.filter(function(op){
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