# genetis

A generator for static sites, using standard html elements, no need to learn some other framework. Compose content into slots in templates, specify variables using meta tags.

## Setup

Install genetis into your project
```
npm install genetis --save-dev 
```

By default genetis will look in a `src` folder for the source to compile, and produce output in a `dist` folder. 

You can create an npm script in your project's `package.json` to easily run genetis as part of your build process
```json
"scripts": {
    "build": "genetis"
}
```
Then to run genetis just run `npm run build`.

You can also run genetis programmatically
```js
var genetis = require('genetis');

(async () => {
    await genetis({
        // config options
    });
})();
```

## A simple example

Create a new project called `my-site`, and install genetis as in the previous section.
```
mkdir my-site
cd my-site
npm init -y
npm install genetis --save-dev
```

Create a 'src' folder for your source html, and add three html files, as follows.
```
📁 my-site
├─ 📁 src
|  ├─ 📄 _template.html
|  ├─ 📄 home.html
|  └─ 📄 contact.html
└─ 📜 package.json
```

`src/_template.html`:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>My Site</title>
    </head>
    <body>
        <h1>My Site</h1>
        <h2 itemprop="page-title"></h2>
        <slot></slot>
    </body>
</html>
```

`src/home.html`:
```html
<meta name="page-title" value="Home">
<p>
    Welcome to my site! Great to have you here :-)
</p>
```

`src/contact.html`:
```html
<meta name="page-title" value="Contact">
<p>
    If you'd like to get in touch, try shouting really loud, I might be nearby!
</p>
```
Note that `home.html` and `contact.html` are not full html documents, they are treated as _document fragments_. As such they do not need the `html` element, nor do they need to be a single element at the top level, we'll refer to them as **partial html files**, or more simply just **partials**.

That's our basic structure, now run genetis (as detailed in the previous section) and see what we end up with.

genetis will process the contents of the `src` folder and output to a `dist` folder by default. In the `dist` folder we have two output html files, one for each of the partial html files. There is no output file for the template, this has been merged in with the partials to create the full output.
```
📁 my-site
├─ 📁 dist
|  ├─ 📄 home.html
|  └─ 📄 contact.html
├─ 📁 src
|  ├─ 📄 _template.html
|  ├─ 📄 home.html
|  └─ 📄 contact.html
└─ 📜 package.json
```

`dist/home.html`:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>My Site</title>
    </head>
    <body>
        <h1>My Site</h1>
        <h2 itemprop="page-title">Home</h2>
        <p>
            Welcome to my site! Great to have you here :-)
        </p>
    </body>
</html>
```

`dist/contact.html`:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>My Site</title>
    </head>
    <body>
        <h1>My Site</h1>
        <h2 itemprop="page-title">Contact</h2>
        <p>
            If you'd like to get in touch, try shouting really loud, I might be nearby!
        </p>
    </body>
</html>
```

## Features

### Templates and slots

Each partial html file in your source will produce a corresponding html file in your output with the same name and path. Template files (which by default are those named `_template.html`) will not be output but rather utilised to build the final structure of the other html files.

When processing a partial html file, if the html contains a root `<html>` element then no template will be used and the partial html will be passed to the output as is. If the partial html does not have a root `<html>` element, then genetis will look for a template file in which to include this partial's contents.

genetis will first look for a template file in the same folder as the partial. If it doesn't find one it will proceed searching higher and higher folders, until the root of the source folder.

Once a template file is found, it is checked for `<slot>` elements. If a slot element is found (and it is not a named slot) then new html for the output of this partial is created by taking the template html and replacing the slot element with the contents of the current partial's html.

If the resulting html has a root `<html>` element, then the process stops. However if this is not the case, then the process repeats, looking for a template at higher levels in which to slot the contents from the current  html. And so on, until a root html element is produced.

### Named slots

An unnamed `<slot>` consumes the entire contents of the partial html file. However you may wish for more control, placing certain elements in certain regions of the template. To achieve this you can use "named slots".

Named slots, such as 
```html
<slot name="something"></slot>
```
will first consume all html elements with a slot attribute for that name, e.g. 
```html
<p slot="something">Some content</p>
```
After all elements consumed by named slots have been processed, any remaining elements are then inserted into the default unnamed slot, if present.

### Special slots

Note, it is not possible to put a slot element in certain locations of your template, the prime example being in the `<head>` of the document. To work around this restriction genetis has the concept of special slots, these are slots with a predetermined name and behaviour.

genetis comes with a special slot predefined to handle the case of the `<head>` element. Any element in your partial html with slot attribute whose value is `head` will get appended to the end of the `<head>` element in your template. This is useful for things such as page specific stylesheets, e.g.
```html
<link slot="head" rel="stylesheet" href="page.css">
```

It is possible to define your own custom special slots by overriding the `specialSlots` property on the config, the format is `{ <name>: <css-selector> }`. If you wish to preserve the "head" special slot along with your own, you'll have to include it in your override, e.g.
```json
"specialSlots": {
    "head": "head",
    "footer": "main > footer"
}
```

### Variables

It is possible to consume _variables_ in your template files, and specify the values these variables should take in your partial html files. We achieve this by making use of the [HTML Microdata specification](https://html.spec.whatwg.org/multipage/microdata.html).

When including partial html into a template the following process is followed.

The partial html is scanned for meta tags which have been given an `itemprop` attribute. For example
```html
<meta itemprop="heading" content="Home">
```
this is the way we set the value of the variable, in this case setting the variable `heading` to the value `Home`.

The html from the template is then scanned for _any_ element with an `itemprop` attribute whose value matches the name of the variable, e.g.
```html
<h1 itemprop="heading"></h1>
```
The _content_ of this element is then updated to match the value of variable set for this partial, e.g. resulting in
```html
<h1 itemprop="heading">Home</h1>
```

What it means to update the element's content depends on the type of element, and is determined by the HTML Microdata specification. The `<h1>` above has no special handling, and as such the text content of the element is set to the variable's value. Other elements are treated differently; the following logic is applied.

* If an element has a `content` attribute, then the value of that attribute will be set.
* If the element is an element that uses a `src` attribute, then the value of that attribute will be set.
* If the element is an element that uses a `href` attribute, then the value of that attribute will be set.
* If the element is an `<object>` element, then the `data` attribute will be set.
* If the element is a `<time>` element, then both the `datetime` attribute and the text content will be set.
* If the element is a `<meter>` or `<data>` element, then both the `value` attribute and the text content will be set.
* Otherwise, the text content of the element will be set.

### Assets

Any files that are not `html` files are by default copied across _as-is_ to your output folder. For example, assets such as scripts, stylesheets, and images. The path to these files relative to the source folder is preserved in the output folder.

### Links and URLs

Any absolute URLs are left unchanged in the output. Relative URLs are treated as if they are locating a resource relative to the source file they are written in. For example, suppose you have a template file one level above a partial html and an image file.
```
📁 src
├─ 📄 _template.html
└─ 📁 page
   ├─ 📄 index.html
   └─ 🖼 image.png
```
Then to refer to image.png inside `index.html`, you can use
```html
<img src="image.png">
```
But if you wanted to refer to the same image from inside `_template.html`, you would have
```html
<img src="pages/image.png">
```
As the html in your output will be at the same level as the image, genetis will internally rewrite this URL in the template to point to the correct file in the output. If you wish to prevent this, you can give the element a special attribute `data-link-relative`. E.g. if you include the following in your template
```html
<img src="image.png" data-link-relative>
```
Then the resulting html will refer to the image at the partial's level, not the template level. This can be useful, for example, with something like the following, where each image.png is a different image for that page, but follows a name and path convention 
```
📁 src
├─ 📄 _template.html
├─ 📁 page1
│  ├─ 📄 index.html
│  └─ 🖼 image.png
└─ 📁 page2
   ├─ 📄 index.html
   └─ 🖼 image.png
```

## Configuration
genetis has the following default options
```json
{
    "input": "./src",
    "output": "./dist",
    "include": ["**/*"],
    "exclude": [],
    "templateName": "_template.html",
    "partialExtensions": [".html", ".htm"],
    "clean": true,
    "fileEncoding": "utf8",
    "specialSlots": {
        "head": "head"
    }
}
```

To override these options you may include a `genetis.json` configuration file at the root of your project, and specify which options you wish to override. E.g.
```json
{
    "output": "./www",
    "partialExtensions": [".htm"]
}
```


If running genetis programmatically you may override the default options by passing in a config object, for example.
```js
var genetis = require('genetis');
var path = require('path');

(async () => {
    await genetis({
        "output": "./www",
        "partialExtensions": [".htm"]
    });
})();
```
