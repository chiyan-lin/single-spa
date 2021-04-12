/**
 * @file
 * Created by zhangyatao on 2019/10/21.
 */


(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, global.app2 = factory());
}(this, function () {
    

    const vueLifecycles = singleSpaVue({
        Vue: window.Vue,
        appOptions: {
            template: `<div>hello single-spa for Vue; <br> this content made for app2! Time:{{now}}</div>`,
            data: function () {
                return {
                    now: 0,
                    timer: null
                };
            },
            beforeMount: function () {
                let that = this;
                this.timer = setInterval(function () {
                    that.now = Date.now();
                }, 1000);
            },
            beforeDestroy: function () {
                clearInterval(this.timer);
            }
        }
    });


    return {
        bootstrap: [vueLifecycles.bootstrap],
        mount: [vueLifecycles.mount],
        unmount: [vueLifecycles.unmount]
    };
}));
