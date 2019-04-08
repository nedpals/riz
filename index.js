const kuman = require('kuman');
const cli = kuman.CLI();

const buildCommand = require('./src/commands/build');
const devCommand = require('./src/commands/dev');
const getStateCommand = require('./src/commands/getState');

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

cli.run(process.argv.splice(2));