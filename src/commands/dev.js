// Develop mode process
// 1. Delete and create build folder
// 2. Create entry.js
// 3. Create pages
// 4. Bundle CSS and JS

const fs = require('fs');
const glob = require('glob');
const chokidar = require('chokidar');

const initialize = require('../initialize');
const { siteDir, checkAndCreateDir } = require('../utils');
const compileAndBundle = require('../compiler');
const rimraf = require('rimraf');

const runDevServer = require('../devServer');
const tempOutFolder = siteDir('./.temp');
const outFolder = siteDir('./dist');

const render = async () => await compileAndBundle({outputs: { temp: tempOutFolder, out: outFolder }});

module.exports = async function() {    
    await initialize();
    await checkAndCreateDir(tempOutFolder);
    await (async function() {
        console.log("Deleting previous build");
        if (fs.existsSync(outFolder)) {
            rimraf(outFolder, (err) => {
                if (err) console.log(err);

                console.log("Previous build deleted.");
            });
        } else {
            await checkAndCreateDir(outFolder);
        }
    })();

    compileAndBundle({outputs: { temp: tempOutFolder, out: outFolder, bundlerOptions: { detailedReport: false } }})
        .then(() => {
            runDevServer();
        });

    const files = chokidar.watch([glob.sync(siteDir('./src/pages/**/*.js')), glob.sync(siteDir('./src/layouts/**/*.js')), glob.sync(siteDir('./src/templates/**/*.js'))]);

    files.on('add', async path => {
        console.log(`File ${path} has been added.`)
    });

    files.on('change', async path => {
        console.log(`File ${path} has been changed.`)

        await render();
    });

    files.on('remove', async path => {
        console.log(`File ${path} has been removed.`)

        await render();
    });

    // process.on('SIGINT', function() {
    //     console.log("Stopping...");
    //     console.log("Deleting .temp...")
    //     rimraf(tempOutFolder, (err) =>{
    //         if (err) {
    //             console.log(err);
    //         }
    //         process.exit();
    //     });
    // });
}