import axios from 'axios';
const timeout = 10000;
axios.defaults.retry = 3;
axios.defaults.retryDelay = 1000;

function axiosRetryInterceptor(err) {
    var message, config;
    if (axios.isCancel(err)) {
        message = err.message.message;
        config = err.message.config;
    } else {
        message = err.message;
        config = err.config;
    }
    config.clearCancelToken();
    if (!config || !config.retry) return Promise.reject(new Error(message));
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= config.retry) {
        return Promise.reject(new Error(message));
    }
    config.__retryCount += 1;
    var backOff = new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, config.retryDelay || 1);
    });
    return backOff.then(function () {
        return axios(config);
    });
}
axios.interceptors.request.use(function (config) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    let token = setTimeout(() => source.cancel({ message: 'Timeout', config: config }), timeout);
    config.cancelToken = source.token;
    config.clearCancelToken = () => clearTimeout(token);
    return config;
});
axios.interceptors.response.use(function (response) {
    response.config.clearCancelToken();
    return response;
}, axiosRetryInterceptor);
