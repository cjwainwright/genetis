const build = require('../src/index');

const file = process.argv[2];
console.log(`Running tests for '${file}'`);

// run a specific test for debugging
(async () => {
    await build({ 
        input: `./test/${file}/src`,
        output: `./test/${file}/dist`
    });
})();
