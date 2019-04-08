const fs = require('fs');
const rimraf = require('rimraf');

const initialize = require('../initialize');
const { siteDir, checkAndCreateDir } = require('../utils');
const compileAndBundle = require('../compiler');

module.exports = async function() {
    const tempOutFolder = siteDir('./.temp');
    const outFolder = siteDir('./dist');
    
    await initialize();
    await checkAndCreateDir(tempOutFolder);
    await (async function () {
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

    console.log("Creating pages");
    compileAndBundle({ outputs: { temp: tempOutFolder, out: outFolder } });
}