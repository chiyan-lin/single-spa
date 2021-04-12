import { invoke } from './navigation/invoke';

let started = false;

export function start () {
    console.log('微前端启动')
    return started ? true : ((started = true) && invoke());
}

export function isStarted () {
    return started;
}
