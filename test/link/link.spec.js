const build = require('../../src/index');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const encoding = 'utf8';

describe('slot', () => {
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
                expect(doc.getElementById('template-absolute').href).toEqual('http://example.com/'); // note: href adds trailing /
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('template-root').href).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('template-relative').href).toEqual('a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('template-relative-dot').href).toEqual('a'); // note: removes ./
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('template-relative-dot-dot').href).toEqual('../a');
            });   
        });
        
        describe('page link', () => {
            it('has correct absolute link', () => {
                expect(doc.getElementById('page-absolute').href).toEqual('http://example.com/'); // note: adds trailing /
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('page-root').href).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('page-relative').href).toEqual('a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('page-relative-dot').href).toEqual('a'); // note: removes ./
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('page-relative-dot-dot').href).toEqual('../a');
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
                expect(doc.getElementById('template-absolute').href).toEqual('http://example.com/'); // note: adds trailing /
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('template-root').href).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('template-relative').href).toEqual('../a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('template-relative-dot').href).toEqual('../a');
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('template-relative-dot-dot').href).toEqual('../../a');
            });   
        });
        
        describe('page link', () => {
            it('has correct absolute link', () => {
                expect(doc.getElementById('page-absolute').href).toEqual('http://example.com/'); // note: adds trailing /
            });
    
            it('has correct root link', () => {
                expect(doc.getElementById('page-root').href).toEqual('/a');
            });
            
            it('has correct relative link', () => {
                expect(doc.getElementById('page-relative').href).toEqual('a');
            });   
    
            it('has correct relative dot link', () => {
                expect(doc.getElementById('page-relative-dot').href).toEqual('a'); // note: removes ./
            });  
            
            it('has correct relative dot dot link', () => {
                expect(doc.getElementById('page-relative-dot-dot').href).toEqual('../a');
            });
        });
    });
});