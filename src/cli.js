#!/usr/bin/env node

const build = require('./index');

(async () => {
    await build(config => {
    });
})();
