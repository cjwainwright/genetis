const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('data', () => {
    const outputDir = './test/data/dist/';

    beforeAll(async () => {
        await build({ 
            input: './test/data/src',
            output: './test/data/dist'
        });
    });

    it('creates an html file for each page', async () => {
        let stats = await fs.promises.stat(path.join(outputDir, 'page1.html'));
        expect(stats.isFile()).toBe(true);

        stats = await fs.promises.stat(path.join(outputDir, 'page2.html'));
        expect(stats.isFile()).toBe(true);

        stats = await fs.promises.stat(path.join(outputDir, 'nested/nested/nested.html'));
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

            it('ignores normal meta data for var3', () => {
                expect(doc.querySelector(`[itemprop='var3']`).textContent).toEqual(``);
            });            
        });
    });

    describe(`nested.html`, () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, `nested/nested/nested.html`), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has correct var1 (from template)', () => {
            expect(doc.querySelector(`[itemprop='var1']`).textContent).toEqual(`nested-template-var1`);
        });

        it('has correct var2 (page overriding template)', () => {
            expect(doc.querySelector(`[itemprop='var2']`).textContent).toEqual(`nested-page-var2`);
        });            

        it('has correct var3 (page only)', () => {
            expect(doc.querySelector(`[itemprop='var3']`).textContent).toEqual(`nested-page-var3`);
        });            
    });
});
