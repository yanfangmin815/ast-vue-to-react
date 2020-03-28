
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

// let expressionStatement = t.expressionStatement()
let jsxElement
const handleSubClass = (templateAst) => {
    for (key in templateAst.attrsMap) {
        if (key === 'class') {
            templateAst.attrsMap[maps[key]] = templateAst.attrsMap[key]
            delete templateAst.attrsMap[key]
        }
    }
}

// 将class处理为className
// const handleClass = (templateAst) => {
//   handleSubClass(templateAst)
//   templateAst.children.forEach((item, index) => {
//       handleSubClass(item)
//       if (item.children && item.children.length >= 1) handleClass(item)
//   })
// }

const handleToJSXElement = (templateAst) => {
    handleSubClass(templateAst) // class处理为className
    const { attrsMap } = templateAst
    const attrs = Object.keys(attrsMap)

    const attrsSet = attrs.length && attrs.map((item, index) => {
      return t.jsxAttribute(t.jsxIdentifier(item), t.stringLiteral(attrsMap[item]))
    })

    let jsxOpeningElement = t.jsxOpeningElement(t.jsxIdentifier(templateAst.tag),attrsSet)
    let jsxClosingElement = t.jsxClosingElement(t.jsxIdentifier(templateAst.tag))

    let chilrenNodes = templateAst.children.length && templateAst.children.map((item, index) => {
        let jsxElement
        let chilren = []
        if (item.children && item.children.length) {
          chilren = handleToJSXElement(item)
        }

        if (item.type == '1') {
          jsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),[]), 
                t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
        }
        if (item.type == '3') {
          jsxElement = t.jsxText('\n')
        }
        // console.log(jsxElement, '??????????')

        return jsxElement
    })
    if (!chilrenNodes) {
      chilrenNodes = []
    }

    jsxElement = t.jsxElement(jsxOpeningElement, jsxClosingElement, chilrenNodes)
    return chilrenNodes
}

//处理v-show
const handleShow = (templateAst) => {
  
}

const handleTemplateAst = (ast, templateAst, filePath, cb) => {
  let astContent
  handleToJSXElement(templateAst)
  // handleShow(templateAst)
  // console.log(jsxElement, 'templateAst')

  // cb(templateAst)
  return astContent
}

module.exports = {
  handleTemplateAst
}