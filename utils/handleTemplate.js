
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const { 
  isEqualExpression } = require('./utils')
const maps = {
    class: 'className',
    'v-show': 'style'
}

// let expressionStatement = t.expressionStatement()
let jsxElement
const handleClass = (templateAst) => {
    for (key in templateAst.attrsMap) {
        if (key === 'class') {
            templateAst.attrsMap[maps[key]] = templateAst.attrsMap[key]
            delete templateAst.attrsMap[key]
        }
    }
}

//处理v-show
const handleVShow = (templateAst) => {
    for (key in templateAst.attrsMap) {
      if (key === 'v-show') {
        templateAst.attrsMap[maps[key]] = templateAst.attrsMap[key]
        delete templateAst.attrsMap[key]
      }
  }
}

const handleClassContainer = (templateAst) => {
  handleClass(templateAst) // class处理为className
  // handleVShow(templateAst)
  const { attrsMap } = templateAst
  const attrs = Object.keys(attrsMap)

  const attrsSet = attrs.length && attrs.map((item, index) => {
    const vals = attrsMap[item]
    switch(item) {
      case 'className':
        return t.jsxAttribute(t.jsxIdentifier(item), t.stringLiteral(vals))
      case 'v-show':
        const types = isEqualExpression(vals) ? t.binaryExpression() : t.identifier(vals)
        return t.jsxAttribute(t.jsxIdentifier('style'), 
                    t.jsxExpressionContainer(t.objectExpression([t.objectProperty(t.identifier('display'),
                          t.conditionalExpression(types))])))
    }
    // return t.jsxAttribute(t.jsxIdentifier(item), t.stringLiteral(vals))
  })
  // console.log(attrsSet, '?????')
  return !attrsSet ? [] : attrsSet
}

const handleToJSXElement = (templateAst) => {
    const attrsSet = handleClassContainer(templateAst)
    let jsxOpeningElement = t.jsxOpeningElement(t.jsxIdentifier(templateAst.tag),attrsSet)
    let jsxClosingElement = t.jsxClosingElement(t.jsxIdentifier(templateAst.tag))

    let chilrenNodes = templateAst.children.length && templateAst.children.map((item, index) => {
        let jsxElement
        let chilren = []
        if (item.children && item.children.length) {
          chilren = handleToJSXElement(item)
        }
        if (item.type == '1') {
          const attrsChildSet = handleClassContainer(item)
          jsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
        }
        if (item.type == '3') {
          jsxElement = t.jsxText('\n')
        }

        return jsxElement
    })
    if (!chilrenNodes) {
      chilrenNodes = []
    }

    jsxElement = t.jsxElement(jsxOpeningElement, jsxClosingElement, chilrenNodes)
    return chilrenNodes
}

const handleTemplateAst = (ast, templateAst, filePath, cb) => {
  let astContent
  handleToJSXElement(templateAst)
  // handleShow(templateAst)
  // console.log(jsxElement.children[2].openingElement.attributes, 'templateAst')

  // cb(templateAst)
  return astContent
}

module.exports = {
  handleTemplateAst
}