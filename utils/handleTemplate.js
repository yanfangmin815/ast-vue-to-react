
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const { 
  isEqualExpression,
  trim } = require('./utils')
const { 
  DEFAULTKIND,
  DEFAULTPROPS } = require('./constant')
const maps = {
    class: 'className'
}

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
const handleVShow = (vals) => {
  const types = isEqualExpression(vals) ? handleEqualExpression(vals) : t.identifier(vals)
  return t.jsxAttribute(t.jsxIdentifier('style'), 
            t.jsxExpressionContainer(t.objectExpression([t.objectProperty(t.identifier('display'),
                  t.conditionalExpression(types,t.stringLiteral('block'),t.stringLiteral('none')))])))
}

// 解析二元表达式
const handleEqualExpression = (val) => {
  const valNew = trim(val)
  const splitedArr = valNew.split(/(===|==)/)
  const leftVal = t.identifier(splitedArr[0])
  const operator = splitedArr[1]
  const rightVal = typeof splitedArr[2] === 'string' ? t.stringLiteral(splitedArr[2]) : t.numericLiteral(splitedArr[2])
  return t.binaryExpression(operator,leftVal,rightVal)
}

// 处理v-if
const handleVIf = (item, vals) => {
  return t.jsxAttribute(t.jsxIdentifier(item),t.stringLiteral(vals))
}

const handleClassContainer = (templateAst) => {
  handleClass(templateAst) // class处理为className
  const { attrsMap } = templateAst
  const attrs = Object.keys(attrsMap)
  const attrsSet = attrs.length && attrs.map((item, index) => {
    const vals = attrsMap[item]
    switch(item) {
      case 'className':
        return t.jsxAttribute(t.jsxIdentifier(item), t.stringLiteral(vals))
      case 'v-show':
        return handleVShow(vals)
      case 'v-if':
        return handleVIf(item,vals) // 放到render里面处理
    }
  })
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

const pushToAst = (ast) => {
  ast.program.body.push(t.classMethod(DEFAULTKIND,t.identifier('render'),[],
      t.blockStatement([t.returnStatement(jsxElement)])))
}

const handleTemplateAst = (ast, templateAst, filePath, cb) => {
  let astContent
  handleToJSXElement(templateAst)
  pushToAst(ast)
  traverse(ast, {
    JSXIdentifier(path) {
      if (path.node.name === 'v-if') {
        console.log(path.node.name, '???????')

      }
    }
  })  
  // console.log(jsxElement.children[2].openingElement.attributes, 'templateAst')

  // cb(templateAst)
  return astContent
}

module.exports = {
  handleTemplateAst
}