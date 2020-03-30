
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const { 
  isEqualExpression,
  trim,
  isEquals,
  handleFor } = require('./utils')
const { 
  DEFAULTKIND,
  ONCHANGE,
  SETSTATE,
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

// 处理v-model
const handleVModel = (item, vals) => {
  return t.jsxAttribute(t.jsxIdentifier(item),t.stringLiteral(vals))
}

// 处理v-for
const handleVFor = (item, vals) => {
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
      case 'v-model':
        return handleVModel(item,vals) // 放到render里面处理
      case 'v-for':
        return handleVFor(item,vals) // 放到render里面处理
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
          jsxElement = t.jsxText(item.text ? item.text: '\n')
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
    JSXElement(path) {
      const { node } = path
      const attributes = node.openingElement.attributes
      for (let index=0; index<attributes.length; index++) {
        const { name: { name }, value: { value } } = attributes[index]
        if (isEquals(name, 'v-if')) {
          path.traverse({
            // 移除v-if指令 && 但不移除子标签的v-if指令
            JSXAttribute(path) {
              const { name: { name }, value: { value: subValue }  } = path.node
              isEquals(value, subValue) && isEquals(name, 'v-if') && path.remove()
            }
          })
          const types = isEqualExpression(value) ? handleEqualExpression(value) : t.identifier(value)
          const jsxExpressionContainer = t.jsxExpressionContainer(t.conditionalExpression(types,node,t.nullLiteral()))
          path.replaceWith(jsxExpressionContainer)
          break;
        }
        if (isEquals(name, 'v-for')) {
          path.traverse({
            // 移除v-for指令 && 但不移除子标签的v-for指令
            JSXAttribute(path) {
              const { name: { name }, value: { value: subValue }  } = path.node
              isEquals(value, subValue) && isEquals(name, 'v-for') && path.remove()
            }
          })
          const [val1, val2] = handleFor(value)
          let item,index,expression
          if (val1.includes('(')) {
            const arr = val1.split(',')
            const len = arr.length
            switch (len) {
              case 1:
                item = trim(arr[0].slice(1,-2))
                expression = [t.identifier(item)]
              case 2:
                const sliceArr = [trim(arr[0].slice(1)), trim(arr[1].slice(0,-2))]
                expression = sliceArr.map(subItem => {
                  return t.identifier(subItem)
                })
            } 
          }
          expression = [t.identifier(trim(val1))]
          const jsxExpressionContainer = t.jsxExpressionContainer(t.callExpression(t.memberExpression(t.memberExpression(t.memberExpression(t.thisExpression(),t.identifier(DEFAULTPROPS)),
                    t.identifier(trim(val2))),t.identifier('map')),[t.arrowFunctionExpression(expression,node)]))
          path.replaceWith(jsxExpressionContainer)
        }
      }
    },
    JSXAttribute(path) {
      const { name: { name }, value: { value } } = path.node
      if (isEquals(name, 'v-model')) {
        const jsxAttribute = t.jsxAttribute(t.jsxIdentifier(ONCHANGE),
                  t.jsxExpressionContainer(t.arrowFunctionExpression([t.identifier('val')],
                      t.callExpression(t.memberExpression(t.thisExpression(),t.Identifier(SETSTATE)),
                          [t.objectExpression([t.objectProperty(t.identifier(value),t.identifier('val'))])]))))
        path.replaceWith(jsxAttribute)
      }
    }
  })  
  cb(ast)
  return astContent
}

module.exports = {
  handleTemplateAst
}