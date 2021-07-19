module.exports = {
    devServer:{
        proxy:{
            '/api':{
                target:'http://47.100.99.171:8888/api/private/v1/',
                pathRewrite:{
                    '^/api':''
                }
            }
        }
    }
}