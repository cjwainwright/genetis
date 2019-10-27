const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('test2', () => {
    const outputDir = './test/test2/dist/';

    beforeAll(async () => {
        await build(config => { 
            config.input = './test/test2/src'
            config.output = './test/test2/dist'
        });
    });

    it('has an index.html', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'index.html'));
        expect(stats.isFile()).toBe(true);
    });

    it('has a logo.png', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'logo.png'));
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

        it('has correct heading', () => {
            const heading = doc.querySelector('body > h1');
            expect(heading.textContent).toEqual('Welcome');
        });

        it('has remaining content in the unnamed slot', () => {
            const aside = doc.querySelector('body > section > p');
            expect(aside.textContent.trim()).toEqual('Welcome to My Site!');
        });

        it('has correct link to logo.png', () => {
            const img = doc.querySelector('body > img');
            expect(img.src).toEqual('logo.png');
        });
    });

    it('has a things/thing1/index.html', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'things/thing1/index.html'));
        expect(stats.isFile()).toBe(true);
    });
    
    it('has a things/thing1/thing1.png', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'things/thing1/thing1.png'));
        expect(stats.isFile()).toBe(true);
    });

    describe('things/thing1/index.html', () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, 'things/thing1/index.html'), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has correct title', () => {
            expect(doc.title).toEqual('Thing 1 | My Site');
        });

        it('has correct heading', () => {
            const heading = doc.querySelector('body > h1');
            expect(heading.textContent).toEqual('Thing 1');
        });

        it('has correct link to logo.png', () => {
            const img = doc.querySelectorAll('body > img')[0];
            expect(img.src).toEqual('../../logo.png');
        });

        it('has correct link to image1.png', () => {
            const img = doc.querySelectorAll('body > img')[1];
            expect(img.src).toEqual('image1.png');
        });

        it('has contents of desc slot populated', () => {
            const desc = doc.querySelector('body > p');
            expect(desc.textContent).toEqual('This is thing 1');
        });
    });
    
    it('has a things/thing2/index.html', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'things/thing2/index.html'));
        expect(stats.isFile()).toBe(true);
    });
    
    it('has a things/thing2/thing2.png', async () => {
        const stats = await fs.promises.stat(path.join(outputDir, 'things/thing2/thing2.png'));
        expect(stats.isFile()).toBe(true);
    });

    describe('things/thing2/index.html', () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, 'things/thing2/index.html'), encoding);
            doc = new JSDOM(html).window.document;
        });

        it('has correct title', () => {
            expect(doc.title).toEqual('Thing 2 | My Site');
        });

        it('has correct heading', () => {
            const heading = doc.querySelector('body > h1');
            expect(heading.textContent).toEqual('Thing 2');
        });

        it('has correct link to logo.png', () => {
            const img = doc.querySelectorAll('body > img')[0];
            expect(img.src).toEqual('../../logo.png');
        });

        it('has correct link to image2.png', () => {
            const img = doc.querySelectorAll('body > img')[1];
            expect(img.src).toEqual('image2.png');
        });

        it('has contents of desc slot populated', () => {
            const desc = doc.querySelector('body > p');
            expect(desc.textContent).toEqual('This is thing 2');
        });
    });
});