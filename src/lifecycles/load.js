import {
    LOAD_ERROR,
    LOAD_RESOURCE_CODE,
    NOT_LOADED,
    SKIP_BECAUSE_BROKEN,
    NOT_BOOTSTRAPPED
} from '../applications/app.helper';

import { getProps, smellLikeAPromise, validateLifeCyclesFn, flattenFnArray } from './helper';

import { ensureAppTimeouts } from '../applications/timeouts';

// 处理注册应用的 promise
export function initApp (app) {
    console.log('初始化应用', app.name)
    // 状态不满足需要被load
    if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
        return Promise.resolve(app);
    }
    app.status = LOAD_RESOURCE_CODE;
    const loadPromise = app.loadApp(getProps(app));
    if (!smellLikeAPromise(loadPromise)) {
        console.error('app loadFunction must return a promise');
        app.status = SKIP_BECAUSE_BROKEN;
        return Promise.resolve(app);
    }
    return loadPromise.then(module => {
        let errorMsg = [];
        if (typeof module !== 'object') {
            errorMsg.push(`app:${app.name} dose not export anything`);
        }
        // 验证一遍传入的子应用是否都存在这三个必备的方法
        ['bootstrap', 'mount', 'unmount'].forEach(lifecycle => {
            if (!validateLifeCyclesFn(module[lifecycle])) {
                errorMsg.push(`app:${app.name} dost not export ${lifecycle} as a function or function array`);
            }
        });
        // 确定有不符合规范的不给予注册
        if (errorMsg.length) {
            app.status = SKIP_BECAUSE_BROKEN;
            return app;
        }
        app.status = NOT_BOOTSTRAPPED;
        app.instance = module
        // 给各个生命周期的 array 处理成一个串型调用的方法，有点像中间件了
        app.bootstrap = flattenFnArray(module.bootstrap && module.bootstrap.map(fn => fn.bind(module)), `app:${app.name} bootstrap functions`);
        app.mount = flattenFnArray(module.mount && module.mount.map(fn => fn.bind(module)), `app:${app.name} mount functions`);
        app.unmount = flattenFnArray(module.unmount && module.unmount.map(fn => fn.bind(module)), `app:${app.name} unmount functions`);
        app.unload = flattenFnArray(module.unload ? module.unload.map(fn => fn.bind(module)) : [], `app:${app.name} unload functions`);
        app.timeouts = ensureAppTimeouts(module.timeouts && module.timeouts.map(fn => fn.bind(module)));
        return app;
    }).catch(e => {
        console.log(e);
        app.status = LOAD_ERROR;
        return app;
    });

}
