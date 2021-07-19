import axios from 'axios'

// 引入nprogress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function (config) {
    // 1、创建axios实例对象

    const instance = axios.create({
        baseURL: '/api',
    });

    // 2、让外界调用的时候拿到实例对象
    //config 是配置信息 调用axios时传递的配置信息
    // 添加请求拦截器
    instance.interceptors.request.use(function (config) {
        // 在发送请求之前做些什么
        // 如果请求路径是登陆或注册 请求头不需要携带数据
        if (config.url == 'login') {
            return config;
        } else {
            // 在request拦截器中展示进度条
            NProgress.start()

            config.headers.Authorization = window.sessionStorage.getItem('token');
            
        }
        // console.log(config);
        return config;

    }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    });

    // 添加响应拦截器
    instance.interceptors.response.use(function (response) {
        // 在respons拦截器中隐藏进度条
        NProgress.done();
        // 响应时直接响应到resx下面data的数据
        return response.data;



    }, function (error) {
        // 对响应错误做点什么
        return Promise.reject(error);
    });

    // 2、让外界调用的时候拿到实例对象
    //config 是配置信息 调用axios时传递的配置信息

    return instance(config);
}