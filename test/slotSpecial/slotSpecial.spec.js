const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('special slot', () => {
    const outputDir = './test/slotSpecial/dist/';

    beforeAll(async () => {
        await build({ 
            input: './test/slotSpecial/src',
            output: './test/slotSpecial/dist'
        });
    });

    it('creates an html file for each page', async () => {
        let stats = await fs.promises.stat(path.join(outputDir, 'page.html'));
        expect(stats.isFile()).toBe(true);
    });

    describe(`page.html`, () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, `page.html`), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has populated head with the meta tag', () => {
            expect(doc.querySelector('head > meta').getAttribute('name')).toEqual(`author`);
            expect(doc.querySelector('head > meta').getAttribute('content')).toEqual(`test`);
        });

        it('has populated head with the link tag', () => {
            expect(doc.querySelector('head > link').getAttribute('rel')).toEqual(`test`);
        });
    });
});