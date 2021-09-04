function Rule (ruleData = {}) {
  if (!(this instanceof Rule)) {
    return new Rule()
  }

  this._ruleData = ruleData

  this._METHODS = ['post', 'put', 'get', 'delete']

  return this
}

// 处理参数
Rule.paramsPlant = function (ruleObj, params) {

  ruleObj.originPath = ruleObj.path

  ruleObj.path = ruleObj.path.replace(/(:[^/]+)/ig, (match, pot) => {
    const key = pot.substr(1)

    if (!params[key]) {
      throw new Error(`参数缺少 ${key}`)
    }

    const pathParams = params[key].toString()

    delete params[key]

    return pathParams
  })

  // 处理 get 请求
  if (ruleObj.type.toLowerCase() === 'get') {

    let path = ''
    for (let key in params) {
      if (path.length <= 0) {
        path = path.concat(`?${key}=${params[key]}`)
      } else {
        path = path.concat(`&${key}=${params[key]}`)
      }
    }

    ruleObj.path = ruleObj.path.concat(path)
  }

  return ruleObj
}

Rule.prototype.parse = function (url) {
  try {
    let result = {}

    if (!url.startsWith('/')) {
      throw new Error('The path error')
    }

    const urlArr = url.substr(1).split('/')

    if (urlArr[0] == 'pub') {
      // 公共路径
      if (urlArr.length == 2) {
        result = this._parsePub(urlArr[1])
      } else {
        throw new Error('Common rule length error, length should be 2')
      }

    } else {
      //  非公共路径
      result = this._parse(urlArr, this._ruleData.children)
    }

    return result

  } catch (e) {
    throw new Error(`${url} : ${e}`)
  }
}

// 公共路径
Rule.prototype._parsePub = function (ruleName = '') {

  let result = this._ruleData.pubRule[ruleName]

  // 判断当前路径是否存在
  if (!result) {
    throw new Error(`The current rule does not exist`)
  }

  // 判断当前路径类型是否为常用
  if (!this._METHODS.includes(result.type.toLowerCase())) {
    console.warn(`The current rule type is not a common type`)
  }

  result.path = this._ruleData.pubBaseUrl.concat(result.path)

  // 注入路由类型
  result.ruleType = 'public'

  return result
}

// 路径
Rule.prototype._parse = function (ruleArr = [], ruleData) {
  if (!ruleData[ruleArr[0]]) {
    throw new Error('Routing is empty')
  }
  if (ruleArr.length > 2) {
    return this._parse(ruleArr.slice(1), ruleData[ruleArr[0]].children)
  } else {
    // 防止修改到原有数据
    let result = { ...ruleData[ruleArr[0]].rule[ruleArr[1]] }

    // 判断当前路径是否存在
    if (!result) {
      throw new Error(`The current rule does not exist`)
    }

    // 判断是否存在 rename
    if (Object.keys(result).includes('rename')) {
      // rename 优先级高，存在时转去 pub 路由查询
      return this._parsePub(result.rename)

    } else {
      // 判断当前路径类型是否为常用
      if (!this._METHODS.includes(result.type.toLowerCase())) {
        console.warn(`The current rule type is not a common type`)
      }

      // 判断path是否有值
      if (!result.path) {
        throw new Error('Path should be String, now undefined')
      }

      result.path = ruleData[ruleArr[0]].baseUrl.concat(result.path)

      // 注入路由类型
      result.ruleType = 'module'

      return result
    }
  }
}

module.exports = Rule
