const m = require('mithril');

document.addEventListener("DOMContentLoaded", () => {
    m.request({
        method: "GET",
        url: `${window.location.origin}/data.json`
    })
        .then(d => {
            document.getElementById("page").innerHTML = "";
            
            const component = require('//appPath//');
            const props = {
                data: d,
                context: '//appContext//'
            };

            m.mount(
                document.getElementById("page"), 
                typeof component === "function" ? component(props) : component
            );
        });
});