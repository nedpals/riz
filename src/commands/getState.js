const store = require("../store");
const initialize = require("../initialize");
const router = require("../router")(store.routes);

module.exports = async function() {
    await initialize();
    console.log(store);
};