const kuman = require('kuman');
const cli = kuman.CLI();

const buildCommand = require('./commands/build');
const devCommand = require('./commands/dev');
const getStateCommand = require('./commands/getState');
const newSiteCommand = require('./commands/new');

cli.command("build", buildCommand, {
    description: "Build pages from scratch"
});

cli.command("get-cwd", () => console.log(process.cwd()), {
    description: "Get current working directory"
})

cli.command("dev", devCommand, {
    description: "Develop page in development mode"
});

cli.command("state", getStateCommand, {
    description: "Get the site configuration and it's current state"
})

cli.command("new", newSiteCommand, {
    arguments: 1,
    description: "Creates a new Riz website project."
})

module.exports = cli;