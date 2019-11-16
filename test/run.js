const build = require('../src/index');

const file = process.argv[2];
console.log(`Running tests for '${file}'`);

// run a specific test for debugging
(async () => {
    await build(config => { 
        config.input = `./test/${file}/src`
        config.output = `./test/${file}/dist`
    });
})();
