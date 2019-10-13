const build = require('../src/index');

build({ base: './test/test1/src', output: '../dist'}).then(() => {
    console.log('done');
});

build({ base: './test/test2/src', output: '../dist'}).then(() => {
    console.log('done');
});