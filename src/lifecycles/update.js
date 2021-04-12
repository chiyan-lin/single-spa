/**
 * service 服务专用的，传入的是一个 symtem 的资源地址
*/
import { MOUNTED, SKIP_BECAUSE_BROKEN, UPDATING } from "../applications/app.helper";
import { reasonableTime } from "../applications/timeouts";
import { getProps } from './helper';

export function toUpdatePromise (service) {
    if (service.status !== MOUNTED) {
        return Promise.resolve(service);
    }
    service.status = UPDATING;
    // 执行 service update 方法，并且返回一个 promise
    return reasonableTime(service.update(getProps(service)), `service: ${service.name} updating`, service.timeouts.mount).then(() => {
        service.status = MOUNTED;
        return service;
    }).catch(e => {
        console.log(e);
        service.status = SKIP_BECAUSE_BROKEN;
        return service;
    });
}
