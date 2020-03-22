const fs = require('fs')

const isExist = (path) => {
  return fs.existsSync(path)
}

const isObject = (obj) => {
  if (!obj) return false
  return Object.prototype.toString.call(obj) === '[object Object]'
}

const isArray = (obj) => {
  if (!obj) return false
  return Object.prototype.toString.call(obj) === '[object Array]'
}

module.exports = {
  isExist,
  isObject,
  isArray
}