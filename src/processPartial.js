const fs = require('fs');
const path = require('path');
const url = require('url');
const JSDOM = require('jsdom').JSDOM;
const log = require('./log');
const elementLinkAttributes = require('./elementLinkAttributes');
const isRelativeUrl = require('./isRelativeUrl');
const updateContent = require('./updateContent');
const getTemplates = require('./getTemplates');

module.exports = async function processPartial(file, options) {
    file = path.join(options.input, file);

    log(`Processing partial file ${file}`);
    const templates = await getTemplates(file, options);

    // include the current html in each template in turn
    const base = templates.shift();
    const dom = new JSDOM(base.html);
    tagUrls(dom.window.document, base.relative);

    templates.forEach(template => {
        const fragment = JSDOM.fragment(template.html);
        tagUrls(fragment, template.relative);
        include(dom.window.document, fragment, options.specialSlots);
    });

    updateUrls(dom.window.document);

    const html = dom.serialize();

    const output = path.join(options.output, path.relative(options.input, file));
    await fs.promises.mkdir(path.dirname(output), { recursive: true });
    await fs.promises.writeFile(output, html);
    log(`Written file ${ output }`);
};

function tagUrls(doc, relative) {
    relative = relative.replace('\\', '/');
    if(relative.indexOf('..') >= 0) {
        relative += '/';
    }

    Object.keys(elementLinkAttributes).forEach(element => {
        var attr = elementLinkAttributes[element];
        doc.querySelectorAll(element).forEach(a => {
            const url = a.getAttribute(attr);
            if(!a.hasAttribute('data-link-relative') && (url == null || isRelativeUrl(url))) {
                log(`tagging url as relative for ${element}[${attr}]: ${url}, ${relative}`);
                a.setAttribute('data-link-relative', relative);
            }
        });
    });
}

function updateUrls(doc) {
    Object.keys(elementLinkAttributes).forEach(element => {
        var attr = elementLinkAttributes[element];
        doc.querySelectorAll(`${element}[data-link-relative]`).forEach(a => {
            const uri = a.getAttribute(attr);
            const relative = a.getAttribute('data-link-relative');
            if(uri != null && relative != null) {
                const newUrl = url.resolve(relative, uri);
                log(`updating url for ${element}[${attr}]: ${uri}, ${newUrl}`);
                a.setAttribute(attr, newUrl);
            }
            a.removeAttribute('data-link-relative');
        })
    });
}

function include(doc, fragment, specialSlots) {
    //process variables
    fragment.querySelectorAll('meta[itemprop]').forEach(data => {
        const property = data.getAttribute('itemprop');
        const value = data.getAttribute('content');
        data.parentNode.removeChild(data);

        doc.querySelectorAll(`[itemprop='${property}']`).forEach(item => {
            updateContent(item, value);
        });
    });

    Object.keys(specialSlots).forEach(name => {
        fragment.querySelectorAll(`[slot='${name}']`).forEach(content => {
            content.removeAttribute('slot');
            const element = doc.querySelector(specialSlots[name]);
            if(element == null) {
                log(`special slot ${name} not found`);
            } else {
                element.appendChild(content);
            }
        });
    });

    //include content
    const namedSlots = doc.querySelectorAll('slot[name]');
    namedSlots.forEach(namedSlot => {
        const name = namedSlot.getAttribute('name');
        const content = fragment.querySelector(`[slot='${name}']`);
        if(content == null) {
            namedSlot.parentNode.removeChild(namedSlot);
        } else {
            content.removeAttribute('slot');
            namedSlot.parentNode.replaceChild(content, namedSlot);
        }
    });

    const defaultSlot = doc.querySelector('slot');
    if(defaultSlot) {
        defaultSlot.parentNode.replaceChild(fragment, defaultSlot);
    }
}
