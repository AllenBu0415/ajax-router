const Rule = require('./lib/rule')

const OPTIONS = {
  mock: false,  // 是否开启mock
  prefixMock: '/mock',
  lazy: null,  // 延迟加载 mock
  ruleData: {},   // 路由信息
  ajax: function () {}
}

const REQUEST_OPTIONS = {
  mock: false
}

function AjaxRouter (options = {}) {
  if (!(this instanceof AjaxRouter)) {
    return new AjaxRouter()
  }

  // 判断mock的前缀是否为 '/' 开头的，否则直接添加 '/'
  if (options.prefixMock != undefined) {
    if (!options.prefixMock.startsWith('/')) {
      options.prefixMock = `/${options.prefixMock}`
    }
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

    // 判断 mock 是否为 true，为 true 则加载 lazyMock
    if (this._options.mock != false && this._options.lazy != null) {
      this._options.lazy()
    }

    let _options = Object.assign(REQUEST_OPTIONS, options)

    let ruleObj = this._rule.parse(url)

    // 处理参数
    ruleObj = Rule.paramsPlant(ruleObj, params)

    // 只有当请求传递了 mock 为true，且当前允许开启 mock 的情况下才开启 mock 模式
    if (_options.mock && this._options.mock) {
      ruleObj.path = this._options.prefixMock.concat(ruleObj.path)
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

// mock 方法,params 只有 GET 请求下有空
AjaxRouter.prototype.mock = function (url) {

  let ruleObj = this._rule.parse(url)

  return {
    url: new RegExp(this._options.prefixMock.concat(ruleObj.path)),
    method: ruleObj.type
  }
}

module.exports = AjaxRouter
