# Riz (ALPHA)
Static site generator using [Mithril](https://mithril.js.org) and [Parcel](https://parceljs.org). Name taken from the first three letters of the last name of the Philippines' national hero, Jose Rizal, whose written works helped shape the Philippine nation today.

API's are not stable yet and are subject to change. Thus, it will be released as an `alpha`-staged package.

## Features
- Mixing server-side + client-side rendering
- Convention over configuration
- Small-sized app bundles
- App State Explorer
- Plugin system
- Balanced between configuration and convention.


## Why I created it
[Gatsby](https://gatsbyjs.org) changed the landscape of Javascript-based static-site generators. One of the most flexible ones that could cater different needs and I loved it - except for small sites. Small sites don't require a heavy JS framework runtime nor big bundles that are necessary in rendering the page - neither a big set of node modules to be installed. Besides, Mithril is a hidden gem that many Javascript developers don't realize. With a no non-sense approach and a smaller size containing necessary tools for creating a full-fledge site (routing, requests, and etc.), it's worth trying when using it in such applications like this.

## Install
Install globally using NPM / Yarn:
```
> npm install --global @nedpals/riz
```

```
> yarn global add @nedpals/riz
```

or if you want to install it on your own project only:
```
> npm install --save-dev @nedpals/riz
```
```
> yarn add -D @nedpals/riz
```

## Getting Started
To start, create first a new Riz project. Open up your terminal and type:
```
riz new my_website
```

Once it is done, proceed to the directory and install it's dependencies (`npm install`).

### Folder Structure
The structure of a Riz website project is simple and unopinionated. We made it structured so that other developers can contribute to the website's source code easily.
```
src/ - Source code folder of the website
 |- components/ - Components used in your website
 |- layouts/ - Layout components that be used in other parts of your site.
 |- pages/ - Obviously where all static pages be created.
 |- templates/ - This is where you put your page templates if you are generating routes from a set of data (e.g "blog posts").
```
### Page Components
Page components in Riz are Mithril components which are object-based with the exception of wrapping it into a function. This is required as this is where Riz will inject page props such as the data and the current page context.

```javascript
const m = require('mithril');

module.exports = (props) => {
    return {
        movie: {},
        oninit(vnode) {
            vnode.state.movie = props.data.movies.find(({ id }) => id === props.contexts.id);
        },
        view(vnode) {
            return m("div", [
                m("h1", movie.title),
                m("p", movie.description)
            ])
        }
    }
}

```
### Layout Components
Layouts aren't fully implemented yet but they're providing a seamless way to use different layouts in various parts of your site without the hassle of putting it inside the `view()` section of your page component. They are located inside the `src/layouts` directory and can be easily set into your page.

```javascript
// bar.js
const m = require('m');

module.exports = (page, site, content) => ({
    view() {
        return m("html", [
            m("head", [
                m("title", `${page.hasOwnProperty('title') && page.title}${site.hasOwnProperty('title') ? " - " + site.title : ""}`),
                page.hasOwnProperty('stylesheet') ? m("style", { rel: "stylesheet", href: page.stylesheet }) : undefined,
                page.hasOwnProperty('style') ? m("style", { type: "text/css" }, page.style) : undefined
            ]),
            m("body", [
                m("div", { id: "page" }, m(content)),
                scripts.map(script => (m("script", { src: script })))
            ])
        ])
    }
})
```

```javascript
// foo.js
const m = require('m');

module.exports = (props) => {
    page: {
        layout: "bar"
    },
    // ... view()
}
```

Or if you want to set a default layout to your site, you can set it in `riz-config.js` inside the `site` key.

```javascript
// riz-config.js
module.exports = {
    site: {
        title: "My first site",
        layout: "bar"
    }
}
```
This will apply to all pages which weren't configured with a custom layout.

## Generate pages in custom data
Using custom data in generating pages is one of the most often used things in a static site generator whether it's a set of markdown files or data from a REST API. Doing them in Riz is easy. Barrowed from Gatsby, albeit in a different name. They are located inside the `riz-api.js` file. These events are `async` functions or you may even use Promises instead.

**NOTE:** There is a limitation on how Mithril reacts on Node-based environments, and thus relies on a built-in testing mock for it to work. However, data of the requests are also mocked too. Hence, they cannot be used in getting live data from HTTP API. Use the fetch API or other libraries such as [axios](https://github.com/axios/axios) instead.

```javascript
// riz-api.js
const m = require('mithril');
const path = require('path');
const axios = require('axios').default;

// This is where you fetch all the data you want to include in your website.
exports.fetchData = async function() {
    const studioGhibli = { films: [] };
    const response = await axios.get('http://ghibliapi.herokuapp.com/films');

    studioGhibli.films = response.data;

    return { studioGhibli };
}

// This is where you programatically add your routes from the data.
exports.fetchRoutes = async (actions, data) => {
    const { addRoute } = actions;
    const { studioGhibli } = data;

    studioGhibli.films.forEach(f => {
        addRoute({
            path: `/films/${f.id}`,
            component: "film.js",
            client: false,
            contexts: {
                id: f.id
            }
        });
    });
};
```

## Plugins
TODO.

## Contribute
- Fork / Clone this repo. (git clone https://github.com/nedpals/kuman.git)
- Create your feature branch (git checkout -b my-new-feature)
- Commit your changes (git commit -am 'Add some feature')
- Push to the branch (git push origin my-new-feature)
- Create a new Pull Request

#### &copy; 2019 nedpals
