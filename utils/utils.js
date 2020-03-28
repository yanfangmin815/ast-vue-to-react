const fs = require('fs')
const nodePath = require('path')
const regIsEqual = '/(\w+(\-*|\w*)\w*)(==|===)(\W*\w+\W*)/g' // 匹配 str ==|=== val or str ==|=== 'val'

const isExist = (path) => {
  return fs.existsSync(path)
}

const transformUppercaseFirstLetter = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const getBasename = (pathName) => {
  return nodePath.basename(pathName, '.vue')
}

const isObject = (obj) => {
  if (!obj) return false
  return Object.prototype.toString.call(obj) === '[object Object]'
}

const isArray = (obj) => {
  if (!obj) return false
  return Object.prototype.toString.call(obj) === '[object Array]'
}

const isEqualExpression = (val) => {
  const str = val.replace(/\s*/g,"")
  return regIsEqual.test(str)
}



module.exports = {
  isExist,
  isObject,
  isArray,
  getBasename,
  transformUppercaseFirstLetter,
  isEqualExpression
}