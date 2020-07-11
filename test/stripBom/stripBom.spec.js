const build = require('../../src/index');
const fs = require('fs');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('stripBom default', () => {
    const outputFile = './test/stripBom/dist/default/index.html';

    beforeAll(async () => {
        await build({ 
            input: './test/stripBom/src',
            output: './test/stripBom/dist/default'
        });
    });

    describe('index.html', () => {
        let html;

        beforeAll(async () => {
            html = await fs.promises.readFile(outputFile, encoding);
        });

        it('has no BOM', () => {
            expect(/\uFEFF/.test(html)).toEqual(false);
        });
    });
});

describe('stripBom false', () => {
    const outputFile = './test/stripBom/dist/false/index.html';

    beforeAll(async () => {
        await build({ 
            input: './test/stripBom/src',
            output: './test/stripBom/dist/false',
            stripBom: false
        });
    });

    describe('index.html', () => {
        let html;

        beforeAll(async () => {
            html = await fs.promises.readFile(outputFile, encoding);
        });

        it('has a BOM in the content', () => {
            expect(/\uFEFF<p>/.test(html)).toEqual(true);
        });
    });
});