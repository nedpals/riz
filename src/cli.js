const kuman = require('kuman');
const cli = kuman.CLI();

const buildCommand = require('./commands/build');
const devCommand = require('./commands/dev');
const getStateCommand = require('./commands/getState');

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

module.exports = cli;