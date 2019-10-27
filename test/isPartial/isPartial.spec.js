const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('isPartial', () => {
    const outputDir = './test/isPartial/dist';

    beforeAll(async () => {
        await build(config => { 
            config.input = './test/isPartial/src'
            config.output = './test/isPartial/dist'
            config.isPartial = (file) => path.extname(file) == '.html' && (file != 'notPartial.html');
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