import { NOT_BOOTSTRAPPED, BOOTSTRAPPING, NOT_MOUNTED, SKIP_BECAUSE_BROKEN } from "../applications/app.helper";
import { reasonableTime } from '../applications/timeouts';
import { getProps } from './helper';


export function toBootstrapPromise (app) {
    if (app.status !== NOT_BOOTSTRAPPED) {
        return Promise.resolve(app);
    }
    app.status = BOOTSTRAPPING;
    // 执行 bootstrap 方法，并且返回一个 promise
    return reasonableTime(app.bootstrap(getProps(app)), `app: ${app.name} bootstrapping`, app.timeouts.bootstrap).then(() => {
        console.log('执行应用 bootstrap 方法')
        app.status = NOT_MOUNTED;
        return app;
    }).catch(e => {
        console.log(e);
        app.status = SKIP_BECAUSE_BROKEN;
        return app;
    });
}
