import { getAppsToLoad, getAppsToMount, getAppsToUnmount, getMountedApps } from '../applications/apps';
import { initApp } from '../lifecycles/load';
import { toBootstrapPromise } from '../lifecycles/bootstrap';
import { toMountPromise } from '../lifecycles/mount';
import { toUnmountPromise } from '../lifecycles/unmount';
import { isStarted } from '../start';
import { callCapturedEvents } from './hijackLocations';

let loadAppsUnderway = false;
let pendingPromises = [];

// 核心 invoke 各个应用的挂载和卸载
export function invoke (pendings, eventArgs) {
    if (loadAppsUnderway) {
        return new Promise((resolve, reject) => {
            console.log('程序正在执行中，存入的事件为', eventArgs)
            pendingPromises.push({ success: resolve, failure: reject, eventArgs });
        });
    }
    // 设置加载中，避免多个 invoke 同时触发
    loadAppsUnderway = true;
    if (isStarted()) {
        return performAppChanges(pendings, eventArgs);
    }
    return loadApps(pendings, eventArgs);
}

// 启动app
function performAppChanges (pendings, eventArgs) {
    console.log('微前端抓手启动')
    console.log('查询卸载应用')
    let unmountApps = getAppsToUnmount();
    console.log('需要被卸载的程序有', unmountApps.map(ua => ua.name))
    let unmountPromises = Promise.all(unmountApps.map(toUnmountPromise));
    console.log('查询路由匹配应用')
    let loadApps = getAppsToLoad();
    console.log('需要被加载的程序有', loadApps.map(la => la.name))
    let loadPromises = loadApps.map(app => {
        return initApp(app).then(app => toBootstrapPromise(app))
            .then(() => unmountPromises).then(() => toMountPromise(app))
    });
    // 发生过在首次，在已经注册好的 app 将符合路由挂载的 app 拿出来
    let mountApps = getAppsToMount().filter(app => loadApps.indexOf(app) === -1);
    console.log('挂载的应用有', mountApps.map(ma => ma.name))
    let mountPromises = mountApps.map(app => {
        return toBootstrapPromise(app).then(() => unmountPromises).then(() => toMountPromise(app));
    });
    // 先将旧的app进行卸载
    return unmountPromises.then(() => {
        // 将 load 和 mounte prmoise 执行掉，并出发 finish 进行事件循环
        let loadAndMountPromises = loadPromises.concat(mountPromises);
        return Promise.all(loadAndMountPromises).then(finish, err => {
            pendings.forEach(item => item && item.reject(err));
            throw err;
        });
    }, e => {
        console.log(e);
        throw e;
    }).finally(() => {
        callAllLocationEvents(pendings, eventArgs);
    })
}


// 找到需要load的app
function loadApps (pendings, eventArgs) {
    console.log('子应用加载')
    const loadApps = getAppsToLoad()
    console.log('需要加载子应用有', loadApps.map(la => la.name))
    return Promise.all(loadApps.map(initApp)).then(() => {
        return finish(pendings, eventArgs, 'loadApps ');
    }).catch(e => {
        console.log(e);
    }).finally(() => {
        callAllLocationEvents(pendings, eventArgs);
    })
}

// 执行所有location事件
function callAllLocationEvents (pendings, eventArgs) {
    console.log('callAllLocationEvents', pendings)
    pendings && pendings.length && pendings.filter(item => item.eventArgs).forEach(item => callCapturedEvents(item.eventArgs));
    eventArgs && callCapturedEvents(eventArgs);
}

// 执行成功，有正在加载的
function finish (pendings, eventArgs, from = '') {
    console.log(from + '执行成功')
    let resolveValue = getMountedApps();
    console.log('挂载成功，当前挂载应用为', resolveValue, '队列中正在等待的应用有 ', pendingPromises)
    if (pendings) {
        pendings.forEach(item => item && item.success(resolveValue));
    }
    loadAppsUnderway = false;
    if (pendingPromises.length) {
        const backup = pendingPromises;
        console.log('backup', backup)
        pendingPromises = [];
        return invoke(backup, eventArgs);
    }
    return resolveValue;
}