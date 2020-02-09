const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('named slot', () => {
    const outputDir = './test/slotNamed/dist/';

    beforeAll(async () => {
        await build({ 
            input: './test/slotNamed/src',
            output: './test/slotNamed/dist'
        });
    });

    it('creates an html file for each page', async () => {
        let stats = await fs.promises.stat(path.join(outputDir, 'page1.html'));
        expect(stats.isFile()).toBe(true);

        stats = await fs.promises.stat(path.join(outputDir, 'page2.html'));
        expect(stats.isFile()).toBe(true);
    });

    describe(`page1.html`, () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, `page1.html`), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has populated slot', () => {
            expect(doc.querySelector('main > h1').textContent).toEqual(`page1`);
        });
    });

    describe(`page2.html`, () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, `page2.html`), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has not populated slot', () => {
            expect(doc.querySelector('main > h1')).toBe(null);
        });
    });
});