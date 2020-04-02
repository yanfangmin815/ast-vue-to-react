const fs = require('fs')
const nodePath = require('path')
const cloneDeep = require('lodash').cloneDeep
const regIsEqual = /(\w+(\-*|\w*)\w*)(==|===)(\W*\w+\W*)/g // 匹配 str ==|=== val or str ==|=== 'val'

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
  const str = trim(val)
  return regIsEqual.test(str)
}

const trim = (str) => {
  return str.replace(/\s*/g,"")
}

const isEquals = (val1,val2) => {
  return Object.is(val1, val2)
}

const handleFor = (forValue) => {
  return forValue.split(/\bin\b/)
}

const judgeIfFor = (isAll) => {
  return (isAll.includes('v-if') && isAll.includes('v-for')) 
        || (isAll.includes('v-else') && isAll.includes('v-for')) 
        || (isAll.includes('v-else-if') && isAll.includes('v-for'))
}

// var arr = new Array(6)
// arr[0] = "George"
// arr[1] = "John"
// arr[2] = "Thomas"
// arr[3] = "James"
// arr[4] = "Adrew"
// arr[5] = "Martin"
// var result = [{},{},{}].join('')
// arr.splice(2,1,{a:1},result)
// console.log(arr.slice(0,-1), '<<<<<<<>????????????')

module.exports = {
  isExist,
  isObject,
  isArray,
  getBasename,
  transformUppercaseFirstLetter,
  isEqualExpression,
  trim,
  isEquals,
  cloneDeep,
  handleFor,
  judgeIfFor
}