const beautifier = require('js-beautify');
const path = require('path');
const fs = require('fs');

const router = (routes) => ({
    addRoute: function(route) {
        routes[route.path] = {
            component: route.component,
            clientRoute: route.hasOwnProperty('client') ? route.client : true,
            contexts: route.contexts || {}
        }
    },
    addRoutes: function(route) {
        route.keys.map(key => {
            routes[route.path.replace(":key", key)] = {
                component: route.component,
                clientRoute: false,
                contexts: route.contexts
            }
        });

        route[route.path] = {
            component: route.component,
            clientRoute: true,
            contexts: route.contexts
        };
    },
    generateClientRoutes: function() {
        const clientRoutes = Object.keys(routes).filter(path => {
            return routes[path].clientRoute = true;
        }).map(path => ({ [path]: routes[path] })).reduce((routesObj, route) => {
            const path = Object.keys(route)[0];

            routesObj[path] = route[path];

            return routesObj;
        }, {});

        return clientRoutes;
    },
    generateRouterJS: function() {
        const r = Object.keys(router(routes).generateClientRoutes());

        const componentName = (path) => {
            if (path.length > 1 && path !== "/") {
                return path.split("/")[path.split("/").length-1];
            } else {
                return "index";
            }
        };

        const createComponentImports = r.map(path => {
            const componentPath = routes[path].component;

            return `const _${componentName(path)}_ = require('${componentPath.replace(/\\/g, "\\\\")}')`;
        }).join("\n");

        const createRouteTree = r.map(path => {
            return `'${path}': _${componentName(path)}_`
        }).join();

        const siteJs = fs.readFileSync(path.resolve(__dirname, './templates/site.js'), { encoding: 'utf-8' });

        return beautifier.js(
            siteJs.replace("//componentImports//", createComponentImports)
                  .replace("//routeTree//", createRouteTree)
        );
    }
});

module.exports = router;