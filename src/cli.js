#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const build = require('./index');

const configFile = path.join(process.cwd(), 'ssg.json');
fs.exists(configFile, exists => {
    const userOptions = exists ? require(configFile): null;
    (async () => {
        await build(userOptions);
    })();
});

