const git = require('simple-git')(process.cwd());

module.exports = function({ options, _args }) {
    // TOOD: Add new command
    console.log(`Creating ${_args[0]}...`)
    const gitPath = (() => {
        const path = typeof options.temp !== "undefined" ? options.temp : "nedpals/riz-starter-default";
        const host = 'https://github.com/';

        return host + path;
    })();

    git.clone(gitPath, _args[0])
       .exec(() => {
           console.log(`
            Directory created successfully. Install the dependencies first before you start working on your website. Good luck!
           `)
       })
}