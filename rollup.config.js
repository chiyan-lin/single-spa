/**
 * @file
 * Created by zhangyatao on 2019/10/21.
 */

import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve'

export default {
    input: './src/single-spa.js',
    output: {
        file: './lib/umd/single-spa.js',
        format: 'umd',
        name: 'singleSpa',
        sourcemap: true
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true
        }),
        process.env.SERVE ? serve({
            open: true,
            contentBase: '',
            openPage: '/toutrial/quick/index.html',
            host: 'localhost',
            port: 10001
        }) : null
    ]
}
