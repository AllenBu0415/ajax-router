const Rule = require('./lib/rule')

const OPTIONS = {
  mock: false,  // 是否开启mock

  prefixMock: '/mock',  // mock 前缀

  isRegExp: true, // mock 方法返回的 URL 是否为 RegExp

  lazy: null,  // 延迟加载 mock

  prefixAjax: '',  // 请求前缀

  ruleData: {},   // 路由信息

  ajax: function () {}  // 请求体
}

const REQUEST_OPTIONS = {
  mock: false // 请求方法开启 mock ,优先级高
}

function AjaxRouter (options = {}) {
  if (!(this instanceof AjaxRouter)) {
    return new AjaxRouter()
  }

  // 默认参数
  this._options = Object.assign(OPTIONS, options)

  // 路由数据
  this._rule = new Rule(this._options.ruleData)

  return this
}

// 请求方法
AjaxRouter.prototype.request = function (url, params = {}, options = {}) {
  return new Promise((resolve, reject) => {

    let _options = Object.assign(REQUEST_OPTIONS, options)

    // 判断 mock 是否为 true，为 true 则加载 lazyMock
    if (this._options.mock != false && this._options.lazy != null) {
      this._options.lazy()
    }


    let ruleObj = this._rule.parse(url)

    // 处理参数
    ruleObj = Rule.paramsPlant(ruleObj, params)

    // 只有当请求传递了 mock 为true,request 的 mock 优先级高，且当前允许开启 mock 的情况下才开启 mock 模式
    if ((_options.mock || (_options.mock == null && ruleObj.mock)) && this._options.mock) {
      ruleObj.path = this._options.prefixMock.concat(ruleObj.path)
    } else if (this._options.prefixAjax != null) {
      ruleObj.path = this._options.prefixAjax.concat(ruleObj.path)
    }

    this._options.ajax({
        method: ruleObj.type,
        ruleType: ruleObj.ruleType,
        url: ruleObj.path,
        params: params,
        originPath: ruleObj.originPath
      },
      resolve,
      reject
    )
  })
}

// mock 方法,params 只有 GET 请求下有用
AjaxRouter.prototype.mock = function (url) {

  let ruleObj = this._rule.parse(url)

  return {
    url: new RegExp(this._options.prefixMock.concat(ruleObj.path)),
    method: ruleObj.type
  }
}

module.exports = AjaxRouter
