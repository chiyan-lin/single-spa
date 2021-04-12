import * as singleSpa from "../single-spa";
import { mountService } from "../services";

export function getProps (app) {
    return {
        ...app.customProps,
        name: app.name,
        // 将此方法传入app中，让app可以在内部自由挂载服务
        mountService: mountService.bind(app),
        singleSpa,
    };
}

// 判断是否为 promise
export function smellLikeAPromise (promise) {
    if (promise instanceof Promise) {
        return true;
    }
    return typeof promise === "object" && promise.then === "function" && promise.catch === "function";
}

export function validateLifeCyclesFn (fn) {
    if (typeof fn === "function") {
        return true;
    }
    if (Array.isArray(fn)) {
        return fn.filter((item) => typeof item !== "function").length === 0;
    }
    return false;
}

// app的生命周期函数何以传入数组或函数，但是它们都必须返回一个Promise，为了方便处理，
// 判断：如果传入的不是Array，就会用数组将传入的函数包裹起来。
export function flattenFnArray (fns = [], description) {
    if (!Array.isArray(fns)) {
        fns = [fns];
    }
    return function (props) {
        return new Promise(async (resolve, reject) => {
            for (let item of fns) {
                try {
                    await item(props)
                } catch (e) {
                    reject(e)
                }
            }
            resolve()
        });
    };
}
