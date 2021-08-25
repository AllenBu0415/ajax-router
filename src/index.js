const Rule = require('./lib/rule')

function SmartRestful (ruleData = {}) {
  if (!(this instanceof SmartRestful)) {
    return new SmartRestful()
  }
  this._rule = new Rule() //路径处理类

  this._ruleData = ruleData  //  路径规则

  return this
}

module.exports = SmartRestful
