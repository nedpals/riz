require('mithril/test-utils/browserMock')(global);

const glob = require('glob');
const path = require('path');

const { siteDir, requireResolveAsync, moduleExists } = require('./utils');
const store = require('./store');

let api = {};
const router = require('./router')(store.routes)

async function detectSiteFiles() {
    const options = { paths: [process.cwd()] };

    const siteConfigPath = await requireResolveAsync('./riz-config.js', options);
    const siteNodeAPIPath = await requireResolveAsync('./riz-api.js', options);

    if (typeof siteNodeAPIPath === "string") {
        console.log("Site Node API file found.")
        api = require(siteNodeAPIPath);
    } else {
        console.log('Site Node API\'s not found.');
    }

    if (typeof siteConfigPath === "string") {
        console.log('Config found.')
        store.site = {...store.site, ...require(siteConfigPath)};
    } else {
        console.log('Config not found. Create a new one.');

        process.exit();
    }
}

async function importandInitializePlugins() {
    if (store.site.hasOwnProperty('plugins')) {
        console.log("Importing all plugins");
        const sitePlugins = store.site.plugins.map(plugin => {
            return new Promise((resolve, reject) => {
                const pluginName = typeof plugin === 'string' ? plugin : plugin.resolve;

                moduleExists(pluginName) ? resolve(require.resolve(pluginName)) : reject(`${pluginName} not found.`);
            });
        });

        const resolvedPlugins = Promise.all(sitePlugins.map(async plugin => await plugin));

        store.plugins.push(...await resolvedPlugins.map(plugin => {
            if (typeof plugin === "string") {
                return {
                    resolve: plugin,
                    ...require(plugin)()
                };
            } else {
                let { resolve, options } = plugin;
    
                return {
                    ...plugin,
                    ...require(resolve)(options, { router })
                }
            }
        }));

        console.log(`Initializing plugins`);

        store.plugins.map(async plugin => {
            plugin.hasOwnProperty('onInit') && await plugin.onInit();
        });
    }
}

async function fetchingAllData() {
    console.log("Fetching data");
    
    const dataFromPlugins = store.site.hasOwnProperty('plugins') && store.plugins.map(async plugin => {
        return plugin.hasOwnProperty('fetchData') && await plugin.fetchData();
    }).reduce((dataObj, data) => {
        let key = Object.keys(data)[0];

        dataObj[key] = data[key];
    }, {});

    store.data = {...dataFromPlugins, ...(api.hasOwnProperty('fetchData') && await api.fetchData())};
} 

async function generateRoutes() {
    console.log("Generating routes")
    const routesFromPlugins = await (async () => { 
        if (store.site.hasOwnProperty('plugins')) {
            return store.plugins.map(async plugin => {
                return plugin.hasOwnProperty('fetchRoutes') && await plugin.fetchRoutes();
            }).reduce((routesObj, r) => {
                Object.keys(r).map(path => {
                    routesObj[path] = r[path];
                    routesObj[path].component = siteDir('./templates/' + routesObj[path].component);
                });
        
                return routesObj;
            }, {});
        } else {
            return {};
        }
    })();

    glob.sync("./src/pages/**/*.js").forEach((page) => {
        const pathArray = page.split("/");
        const path = pathArray.filter(p => !["src", "pages"].includes(p))
                            .join("")
                            .replace(".", "/")
                            .replace("index.js", "")
                            .replace(".js", "");

        router.addRoute({
            path,
            component: siteDir(page)
        });
    });

    api.hasOwnProperty('fetchRoutes') && await api.fetchRoutes({ addRoute: router.addRoute, addRoutes: router.addRoutes }, store.data)

    store.routes = {
        ...store.routes, 
        ...routesFromPlugins, 
    };
    
    delete store.site.plugins;
}

module.exports = async function () {
    await detectSiteFiles();
    await importandInitializePlugins();
    await fetchingAllData();
    await generateRoutes();
};