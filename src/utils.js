const path = require('path');
const fs = require('fs');

module.exports = {
    siteDir: function(p) {
        return path.resolve(process.cwd(), p);
    },
    checkAndCreateDir: async function(name) {
        const folder = path.resolve(name);
    
        if (!fs.existsSync(folder)) {
            console.log("Directory does not exist. Creating...")
            fs.mkdirSync(folder, { recursive: true });

            return folder;
        }

        return;
    },
    moduleExists: function(name, options) {
        try {
            return require.resolve(name, options);
        } catch(e) {
            return false;
        }
    },
    requireResolveAsync: function (path, options) {
        return new Promise((resolve,reject) => {
            const mod = require.resolve(path, options);
    
            if (typeof mod === "string") {
                resolve(mod);
            }
    
            if (typeof mod === "object" && mod.code === 'MODULE_NOT_FOUND') {
                reject(mod);
            }
        });
    },
    printAndUpdate (text) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(text);
    }
};