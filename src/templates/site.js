const m = require('mithril');

// Pages created
//componentImports//

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("page").innerHTML = "";

    m.route(document.getElementById("page"), "/", {
        //routeTree//
    });
})