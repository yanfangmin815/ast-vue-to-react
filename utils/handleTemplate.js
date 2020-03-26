
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const { 
    isObject,
    isArray,
    getBasename,
    transformUppercaseFirstLetter } = require('./utils')
const maps = {
    class: 'className'
}

const handleSubClass = (templateAst) => {
  if (templateAst.attrsMap && Object.keys(templateAst.attrsMap).length) {
      for (key in templateAst.attrsMap) {
          if (key === 'class') {
              templateAst.attrsMap[maps[key]] = templateAst.attrsMap[key]
              delete templateAst.attrsMap[key]
          }
      }
  }
}

// 将class处理为className
const handleClass = (templateAst) => {
  handleSubClass(templateAst)
  templateAst.children.forEach((item, index) => {
      handleSubClass(item)
      if (item.children && item.children.length >= 1) handleClass(item)
  })
}

const handleTemplateAst = (ast, templateAst, filePath, cb) => {
  let basename = transformUppercaseFirstLetter(getBasename(filePath))
  let astContent
  handleClass(templateAst)
  // console.log(templateAst.children, 'templateAst')

  // cb(templateAst)
  return astContent
}

module.exports = {
  handleTemplateAst
}