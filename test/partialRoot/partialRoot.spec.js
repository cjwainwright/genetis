const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('partial root', () => {
    const outputDir = './test/partialRoot/dist';

    beforeAll(async () => {
        await build({ 
            input: './test/partialRoot/src',
            output: './test/partialRoot/dist'
        });
    });

    it('creates a single index.html', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'index.html'));
        expect(stats.isFile()).toBe(true);
    });
    
    it('creates a single notPartial.html', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'notPartial.html'));
        expect(stats.isFile()).toBe(true);
    });

    describe('index.html', () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, 'index.html'), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has correct title', () => {
            expect(doc.title).toEqual('Home | My Site');
        });
    });

    describe('notPartial.html', () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, 'notPartial.html'), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has correct title', () => {
            expect(doc.title).toEqual('Not a partial');
        });
    });

});