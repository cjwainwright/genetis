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

        describe('anchor tag', () => {
            it('has correct link when no current href', () => {
                expect(doc.getElementById('no-href').href).toEqual('/var');
            });
    
            it('has correct link when existing href', () => {
                expect(doc.getElementById('existing-href').href).toEqual('/var');
            });
        });

        describe('audio tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('audio').src).toEqual('/var');
            });
        });
        
        describe('embed tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('embed').src).toEqual('/var');
            });
        });

        describe('iframe tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('iframe').src).toEqual('/var');
            });
        });        
        
        describe('img tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('img').src).toEqual('/var');
            });
        });
        
        describe('script tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('script').src).toEqual('/var');
            });
        });
        
        describe('source tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('source').src).toEqual('/var');
            });
        });
        
        describe('track tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('track').src).toEqual('/var');
            });
        });
        
        describe('video tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('video').src).toEqual('/var');
            });
        });
        
        describe('area tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('area').href).toEqual('/var');
            });
        });
        
        describe('link tag', () => {
            it('has correct link', () => {
                expect(doc.querySelector('link').href).toEqual('/var');
            });
        });
    });
});