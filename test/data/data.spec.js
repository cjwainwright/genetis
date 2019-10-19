const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('slot', () => {
    const outputDir = './test/data/dist/';

    beforeAll(async () => {
        await build({ base: './test/data/src', output: '../dist'});
    });

    it('creates an html file for each page', async () => {
        let stats = await fs.promises.stat(path.join(outputDir, 'page1.html'));
        expect(stats.isFile()).toBe(true);

        stats = await fs.promises.stat(path.join(outputDir, 'page2.html'));
        expect(stats.isFile()).toBe(true);
    });

    [1, 2].forEach((n) => {

        describe(`page${n}.html`, () => {
            let doc;
    
            beforeAll(async () => {
                const html = await fs.promises.readFile(path.join(outputDir, `page${n}.html`), encoding);
                doc = new JSDOM(html).window.document;
            });
    
            it('has correct var1', () => {
                expect(doc.querySelector(`[itemprop='var1']`).textContent).toEqual(`page${n}-var1`);
            });
    
            it('has correct var2', () => {
                expect(doc.querySelector(`[itemprop='var2']`).textContent).toEqual(`page${n}-var2`);
            });            
        });
    });
});