const build = require('../src/index');

// run a specific test for debugging
(async () => {
    await build(config => { 
        config.input = './test/test1/src'
        config.output = './test/test1/dist'
    });
})();
