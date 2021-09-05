# Ajax-Router

Ajax-Router是一款 Api 管理工具，可用于普通 Web 应用，也可以用于小程序。可以使用该插件配合你常用请求插件使用，例如 Axios、fetch 和 wx.require 等。

### 下载

```shell
npm install ajax-router
```

### 使用

示例文件目录

    ---
     |
     |---- Api
     |    |
     |    |---- index.js
     |    |
     |    |---- main/
     |    |    |
     |    略   ｜---- index.js
     |         |
     |         略 （ 同 main 结构）
     |
     |---- plugins/
     |    |
     |    |---- http.js
     |    
     |---- src/
     |    |
     |    |---- app.js

配置 Api

具体 Api 被划分为 "公共 Api" 和 "普通 Api" ，公共 Api 需在根目录的 pubRule 中定义。

公共 Api 的路径需要 '/pub' 开头，而普通 Api 则以根目录的 children 的 key 开头，以此类推。

例如：想要访问 main 文件夹下的 getKey 路由，则路由为 /main/getKey

```javascript
/**
 *  /Api/index.js
 *
 *  根目录结构必须由 pubBaseUrl、pubRule 和 children 构成，其他结构会被忽略
 */

import main from './main/index';

export default {
    pubBaseUrl: '', // 请求前缀，最终请求地址为 pubBaseUrl + path 
    pubRule: {
        getAll: {   // 请求路径为 '/pub/getAll'
            type: 'get',    // 请求类型 
            path: '/app/getAll',    // 请求地址
        },
    },
    children: {
        main
    },
};

```

```javascript
/**
 *  /Api/main/index.js
 *
 *  普通目录结构必须由 baseUrl、rule 和 children 构成，其他结构会被忽略
 */

export default {
    baseUrl: '',    // 请求前缀，最终请求地址为 baseUrl + path 
    rule: {
        getKey: {   // 请求路径为 '/main/getAll'
            type: 'GET',     // 请求类型 
            path: '/app/main/getKey/:id'    // 请求地址,如果 path 中存在 ':' 开头的字段，则会从请求的参数（params）中自动获取相对应字段的数据替换，如参数中不存在该字段则报错
        },
        user: {     // 请求路径为 '/main/user'
            type: 'GET',    // 请求类型 
            path: '/app/main/user',      // 请求地址
            rename: 'getAll'    // 路由重定向，如果存在该字段，则路由会忽略当前路由的信息，并跳转至 pubRule 中寻找 rename 字段中的的路由
        }
    },
    children: {}
}
```

配置插件

```javascript
/**
 *  http.js
 */


import AjaxRouter from "ajax-router";
import Api from "../Api/index.js";

const ajaxRouter = new AjaxRouter( {
    ruleData: Api,  // Api 数据
    ajax: function ( ruleData, resolve, reject ) {

        // 示例
        wx.request( {
            url: `https:192.168.0.1:9000${ ruleData.url }`,
            method: ruleData.method,
            data: ruleData.params,
            header: ruleData.header,
            success: function ( res ) {

                // 处理请求
                if ( res.data.success ) {
                    resolve( res.data.data );
                } else {
                    reject( res.data.data );
                }

            },
            fail: function ( err ) {

                // 重大错误！
                wx.showToast( {
                    title: '网络错误，请稍后再试',
                    icon: 'none',
                } );

            },
        } );
    },
} );

export default ajaxRouter;
```

页面上使用

```javascript
import Http from '../plugins/http.js';

// 公共 Api
Http.request( '/pub/getAll', {
    // 参数
    id: '10000001'
} ).then( res => {

    // 处理逻辑
    console.log( res )

} ).catch( err => {

    // 处理逻辑
    console.log( err )

} )

// 普通 Api
Http.request( '/main/getKey', {
    // 参数
    id: '10000001'  // getKey 路由有 :id 不传会报错
} ).then( res => {

    // 处理逻辑
    console.log( res )

} ).catch( err => {

    // 处理逻辑
    console.log( err )

} )
```
