const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('link', () => {
    const outputDir = './test/link/dist/';

    beforeAll(async () => {
        await build(config => { 
            config.input = './test/link/src'
            config.output = './test/link/dist'
        });
    });

    it('creates an html file for each page', async () => {
        let stats = await fs.promises.stat(path.join(outputDir, 'index.html'));
        expect(stats.isFile()).toBe(true);

        stats = await fs.promises.stat(path.join(outputDir, 'nested/index.html'));
        expect(stats.isFile()).toBe(true);
    });

    describe('index.html', () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, 'index.html'), encoding);
            doc = new JSDOM(html).window.document;
        });

        describe('template link', () => {
            it('has correct absolute link', () => {
                expect(doc.getElementById('template-absolute').getAttribute('href')).toEqual('http://example.com');
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('template-root').getAttribute('href')).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('template-relative').getAttribute('href')).toEqual('a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('template-relative-dot').getAttribute('href')).toEqual('a'); // note: removes ./
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('template-relative-dot-dot').getAttribute('href')).toEqual('../a');
            });   

            it('has correct relative hash link', () => {
                expect(doc.getElementById('template-relative-hash').getAttribute('href')).toEqual('#a');
            });   
        });
        
        describe('page link', () => {
            it('has correct absolute link', () => {
                expect(doc.getElementById('page-absolute').getAttribute('href')).toEqual('http://example.com');
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('page-root').getAttribute('href')).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('page-relative').getAttribute('href')).toEqual('a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('page-relative-dot').getAttribute('href')).toEqual('a'); // note: removes ./
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('page-relative-dot-dot').getAttribute('href')).toEqual('../a');
            });

            it('has correct relative hash link', () => {
                expect(doc.getElementById('page-relative-hash').getAttribute('href')).toEqual('#a');
            });
        });
    });

    describe('nested/index.html', () => {
        let doc;

        beforeAll(async () => {
            const html = await fs.promises.readFile(path.join(outputDir, 'nested/index.html'), encoding);
            doc = new JSDOM(html).window.document;
        });

        describe('template link', () => {
            it('has correct absolute link', () => {
                expect(doc.getElementById('template-absolute').getAttribute('href')).toEqual('http://example.com');
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('template-root').getAttribute('href')).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('template-relative').getAttribute('href')).toEqual('../a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('template-relative-dot').getAttribute('href')).toEqual('../a');
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('template-relative-dot-dot').getAttribute('href')).toEqual('../../a');
            });   
            
            it('has correct relative hash link', () => {
                expect(doc.getElementById('template-relative-hash').getAttribute('href')).toEqual('../#a');
            });   
        });
        
        describe('page link', () => {
            it('has correct absolute link', () => {
                expect(doc.getElementById('page-absolute').getAttribute('href')).toEqual('http://example.com');
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('page-root').getAttribute('href')).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('page-relative').getAttribute('href')).toEqual('a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('page-relative-dot').getAttribute('href')).toEqual('a'); // note: removes ./
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('page-relative-dot-dot').getAttribute('href')).toEqual('../a');
            });
            
            it('has correct relative hash link', () => {
                expect(doc.getElementById('page-relative-hash').getAttribute('href')).toEqual('#a');
            });
        });
    });
});