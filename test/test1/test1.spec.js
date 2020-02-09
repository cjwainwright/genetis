const build = require('../../src/index');
const fs = require('fs');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('test1', () => {
    const outputFile = './test/test1/dist/index.html';

    beforeAll(async () => {
        await build({ 
            input: './test/test1/src',
            output: './test/test1/dist'
        });
    });

    it('creates a single index.html', async () => {
        const stats = await fs.promises.stat(outputFile);
        expect(stats.isFile()).toBe(true);
    });

    describe('index.html', () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(outputFile, encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has correct title', () => {
            expect(doc.title).toEqual('Home | My Site');
        });

        it('has correct heading', () => {
            const heading = doc.querySelector('body > h1');
            expect(heading.textContent).toEqual('Welcome');
        });

        it('has correct published', () => {
            const published = doc.querySelector('body > footer > time');
            expect(published.getAttribute('datetime')).toEqual('2019-10-13 00:00:00');
            expect(published.textContent).toEqual('2019-10-13 00:00:00');
        });

        it('has a correctly populated tldr slot', () => {
            const aside = doc.querySelector('body > main > aside > p');
            expect(aside.textContent.trim()).toEqual('The TL;DR is longer than the article.');
        });

        it('has remaining content in the unnamed slot', () => {
            const aside = doc.querySelector('body > main > section > p');
            expect(aside.textContent.trim()).toEqual('Welcome to My Site!');
        });
    });
});