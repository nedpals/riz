const m = require('mithril');
const pill = require('pill');

document.addEventListener("DOMContentLoaded", () => {
    // pill('#page', {
    //     onReady() {
            document.getElementById("page").innerHTML = "";
    
            const component = require('//appPath//');
            const props = '//appProps//';

            m.mount(
                document.getElementById("page"), 
                typeof component === "function" ? component(props) : component
            );
    //     }
    // })
});