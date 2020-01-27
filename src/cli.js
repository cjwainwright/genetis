#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const build = require('./index');

const configFile = path.join(process.cwd(), 'ssg.conf.js');
fs.exists(configFile, exists => {
    const config = exists ? require(configFile): c => {};
    (async () => {
        await build(config);
    })();
});

