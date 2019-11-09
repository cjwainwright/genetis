const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('link data', () => {
    const outputFile = './test/linkData/dist/page.html';

    beforeAll(async () => {
        await build(config => { 
            config.input = './test/linkData/src'
            config.output = './test/linkData/dist'
        });
    });

    it('creates an html file for the page', async () => {
        let stats = await fs.promises.stat(outputFile);
        expect(stats.isFile()).toBe(true);
    });

    describe(`page.html`, () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(outputFile, encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has correct link when no current href', () => {
            expect(doc.getElementById('no-href').href).toEqual('/var');
        });

        it('has correct link when existing href', () => {
            expect(doc.getElementById('existing-href').href).toEqual('/var');
        });
    });
});