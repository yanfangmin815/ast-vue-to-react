
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
  // 将class处理为className
  const handleClass = (templateAst) => {
    templateAst.children.forEach((item, index) => {
        if (item.attrsMap && Object.keys(item.attrsMap).length) {
            for (key in item.attrsMap) {
                if (key === 'class') {
                    item.attrsMap[maps[key]] = item.attrsMap[key]
                    delete item.attrsMap[key]
                }
            }
        }
        if (item.children && item.children.length >= 1) handleClass(item)
    })
  }

  const handleTemplateAst = (ast, templateAst, filePath, cb) => {
    let basename = transformUppercaseFirstLetter(getBasename(filePath))
    let astContent
    handleClass(templateAst)
    console.log(templateAst.children, '>>>>>>>>>>>>>>>>')

    // cb(templateAst)
    return astContent
  }

  module.exports = {
    handleTemplateAst
  }