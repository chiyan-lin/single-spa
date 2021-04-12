(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, global.app1 = factory());
}(this, function () {
    
    return {
        container: null,
        bootstrap: [async (props) => {
            this.container = document.getElementById('app');
            this.container.innerHTML = 'bootstrapping'
        }],
        mount: [async (props) => {
            this.container.innerHTML = 'hello single-spa; <br> this content made for app1!';
        }],
        unmount: [async (props) => {
            this.container.innerHTML = '';
        }],
        unload: [async (props) => {
            delete this.container;
        }]
    };
}));
