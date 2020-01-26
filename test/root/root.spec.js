const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('root', () => {
    const outputDir = './test/root/dist/';

    beforeAll(async () => {
        await build(config => { 
            config.input = './test/root/src'
            config.output = './test/root/dist'
        });
    });

    it('creates an html file for each page', async () => {
        let stats = await fs.promises.stat(path.join(outputDir, 'index.html'));
        expect(stats.isFile()).toBe(true);

        stats = await fs.promises.stat(path.join(outputDir, 'nested/index.html'));
        expect(stats.isFile()).toBe(true);
    });

    describe(`index.html`, () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, `index.html`), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has used main template', () => {
            expect(doc.querySelector('main > h1').textContent).toEqual('Main Template');
        });
    });
    
    describe(`nested/index.html`, () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, `nested/index.html`), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has used the nested template only', () => {
            expect(doc.querySelector('main > h1').textContent).toEqual('Nested Template');
        });
    });
});