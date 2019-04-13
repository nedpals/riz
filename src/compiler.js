const Bundler = require('parcel-bundler');
const beautifier = require('js-beautify');
const renderer = require('mithril-node-render');
const m = require('mithril');
const fs = require('fs');
const path = require('path');

const store = require('./store');
const { siteDir, printAndUpdate } = require('./utils');

function buildPage (pageComponent, options) {
    const _component = typeof pageComponent === "function" ? pageComponent(options.props) : pageComponent;
    const { page } = _component;
    const pageContent = _component;
    
    const pageHelpers = {
        // pageStylesheets: [
        //     ...(page.hasOwnProperty('stylesheets') && page.stylesheets)
        // ].map(sHref => m("style", { rel: "stylesheet", href: sHref })),
        pageInlineStyle: page.hasOwnProperty('style') && m("style", { type: "text/css" }, page.style),
        pageScripts: [...(options.scripts || [])].map(scriptSrc => m("script", { src: beautifier.css(scriptSrc) })),
        generatePageTitle: (separator) => {
            return `${page.title || ''}${page.hasOwnProperty('title') ? " "+ (separator || "-") +" "  : ""}${store.site.hasOwnProperty('title') ? store.site.title : ""}`
        }
    };

    return m({
        view() {
            return m("html", [
                m("head", [
                    m("title", pageHelpers.generatePageTitle()),
                    pageHelpers.pageStylesheets,
                    pageHelpers.pageInlineStyle,
                ]),
                m("body", [
                    m("div", { id: "page" }, m(pageContent)),
                    pageHelpers.pageScripts
                ])
            ])
        }
    });
}

function renderPage (pagePath, outDir) {
    const currentRoute = store.routes[pagePath];
    const { clientRoute } = currentRoute;
    const pageProps = {
        data: store.data,
        contexts: currentRoute.contexts
    }; 

    const component = buildPage(require(currentRoute.component), {
        props: pageProps,
        scripts: [
            clientRoute ? path.relative(
                path.resolve(outDir, `./`), 
                path.resolve(outDir, `./${pagePath}${pagePath.split("/").filter(Boolean).length === 0 ? "main" : ""}.js`)
            ).replace(/\\/g, "/") : '',
            // siteDir(`.${pagePath}${pagePath.split("/").filter(Boolean).length === 0 ? "index" : ""}.js`)
            // clientRoute ? siteDir(`.${pagePath}${pagePath.split("/").filter(Boolean).length === 0 ? "index" : ""}.js`) :
            //            siteDir(`./${[...pagePath.split("/").filter(Boolean)].splice(0, pagePath.split("/").filter(Boolean).length-1).join("/")}.js`)
        ],
        stylesheets: []
    });

    return renderer(component);
}

async function saveDataJson(outDir) {
    console.log("Creating data.json");

    fs.writeFileSync(
        path.resolve(outDir, `./data.json`), 
        JSON.stringify(store.data)
    );

    return path.resolve(outDir, `./data.json`);
}

async function savePages(outDir) {
    const _routes = Object.keys(store.routes);

    await Promise.all(_routes.map(async pagePath => {
        const name = (() => {
            let levels = pagePath.split("/").filter(Boolean);
            let final = pagePath;

            // if (levels.length === 0) {
            //     final = pagePath.split().concat("index").join("");
            // }

            return final;
        })();
        const currentRoute = store.routes[pagePath];
        const { clientRoute } = currentRoute;
        const html = await renderPage(pagePath, outDir);
        const beautifiedHtml = beautifier.html(html);

        printAndUpdate("Building " + pagePath);

        await (async function () {
            const folders = pagePath.split("/") || [];
            const dirLocation = path.resolve(path.join(outDir, ...folders));

            if (folders.length !== 0 && !fs.existsSync(dirLocation)) {
                fs.mkdirSync(dirLocation, { recursive: true });
            }
        })();
        
        const pageJs = fs.readFileSync(path.resolve(__dirname, './templates/page.js'), { encoding: 'utf-8' });

        fs.writeFileSync(path.resolve(outDir, `.${name}/index.html`), beautifiedHtml);
                        
        if (clientRoute) {
            let pathArr = pagePath.split("/");
            let lastPath = pathArr[pathArr.length-1];

            fs.writeFileSync(
                path.resolve(outDir, `.${name}/${lastPath.length === 0 ? "main" : lastPath}.js`), 
                pageJs.replace("//appPath//", siteDir(`./src/pages/${pagePath}${pathArr.filter(Boolean).length === 0 ? "index" : ""}.js`).replace(/\\/g, "\\\\"))
                      .replace("'//appContext//'", JSON.stringify(currentRoute.contexts))
            );
        }

        printAndUpdate(`${pagePath} has been generated`);
    }));
}

async function compileAndBundle (options) {
    const bundlerOptions = {
        outDir: options.outputs.out,
        watch: false,
        ...options.bundlerOptions,
        ...store.bundlerOptions
    };
    const bundler = new Bundler(path.join(options.outputs.temp, `./**/*.html`), bundlerOptions);
    
    await savePages(options.outputs.temp);

    try {
        const bundle = await bundler.bundle();
        await saveDataJson(options.outputs.out);
        return bundle;
    } catch(e) {
        throw e;
    }
}
module.exports = compileAndBundle;