const fs = require('fs')
const nodePath = require('path')
const cloneDeep = require('lodash').cloneDeep
const regIsEqual = /(\w+(\-*|\w*)\w*)(==|===)(\W*\w+\W*)/ // 匹配 str ==|=== val or str ==|=== 'val'

const tags = ['input','img','']
const ifArrs = ['v-if', 'v-else-if', 'v-else']
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
  if (!val) return false
  const str = trim(val)
  return regIsEqual.test(str)
}

const isLogicalOperatorsExsits = (val) => {
  return val.indexOf('&&') !== -1 || val.indexOf('||') !== -1
}

const trim = (str, pattern='all') => {
  if (pattern === 'l') return str.replace(/^\s*/g, "")
  if (pattern === 'r') return str.replace(/\s*$/g, "")
  else return str.replace(/\s*/g,"")
}

const isEquals = (val1,val2) => {
  return Object.is(val1, val2)
}

const handleFor = (forValue) => {
  return forValue.split(/\bin\b/)
}

const produceString = (len) => {
  　len = len || 6
    const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz_'    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    const maxPos = $chars.length
    let pwd = ''
    for (i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
}

const splitString = (val) => {
  const value = val.split(/&&|\|\|/)
  const arr = val.split(' ').filter((item,index) => {
    if (item === '&&' || item === '||') return item
  })
  value.forEach((val,index) => {
    value[index] = trim(val)
  })
  return { value, arr }
}

// const str = 'a && b===4 && c===5 || d===6'
// const arr = str.split(' ').filter((item,index) => {
//   if (item === '&&' || item === '||') {
//     return item
//   }
// })

// const arr = [1,2,3,4,5,6,7,8]
// console.log(arr)

// const arr = [1,2,3,4,5,6,7,8]
// arr.splice(0,1)
// const arr1 = arr.slice(0,0)
// const arr2 = arr.slice(0)
// const result = [0,9,11]
// console.log([].concat(arr1,result,arr2))

// const arr = [1,2,3,4,5,6,7,8]
// for(let i=0;i<arr.length;i++) {
//   console.log(i,'--------',353253245)
//   if (i == 1) {
//     i++
//   }
// }

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
  tags,
  ifArrs,
  produceString,
  isLogicalOperatorsExsits,
  splitString
}