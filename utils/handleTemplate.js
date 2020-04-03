
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const { 
  isEqualExpression,
  trim,
  isEquals,
  handleFor,
  judgeIfFor } = require('./utils')
const { 
  DEFAULTKIND,
  ONCHANGE,
  SETSTATE,
  DEFAULTPROPS } = require('./constant')
const maps = {
    class: 'className'
}

let jsxElement
let jsxElementContainer
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

// 处理v-if/v-model/v-for
const handleVIf = (item, vals) => {
  return t.jsxAttribute(t.jsxIdentifier(item),t.stringLiteral(vals))
}

const handleClassContainer = (templateAst) => {
  handleClass(templateAst) // class处理为className
  const { attrsMap, ifConditions } = templateAst
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
      case 'v-else-if':
        return handleVIf(item,vals) // 放到render里面处理
      case 'v-else':
        return handleVIf(item,vals) // 放到render里面处理
      case 'v-model':
        return handleVIf(item,vals) // 放到render里面处理
      case 'v-for':
        return handleVIf(item,vals) // 放到render里面处理
    }
  })
  return !attrsSet ? [] : attrsSet
}

const handleConditions = (templateAst) => {
  templateAst.children.length && templateAst.children.forEach((item, index) => {
    if (item.type == '1') {
      const itemIfConditions = item.ifConditions
      if (itemIfConditions && itemIfConditions.length > 1) {
        const i = templateAst.children.indexOf(item)
        templateAst.children.splice(i,1)
        const arr1 = templateAst.children.slice(0,i)
        const arr2 = templateAst.children.slice(i)
        const result = itemIfConditions.map((subItemIfConditions, subIndex) => {
          return subItemIfConditions.block
        })
        templateAst.children = [].concat(arr1,result,arr2)
      } 
    }
  })
}

const handleVIfSingle = (item, attrsMap, chilren) => {
  const value = attrsMap['v-if']
  const types = isEqualExpression(value) ? handleEqualExpression(value) : t.identifier(value)
  delete attrsMap['v-if']
  const attrsChildSet = handleClassContainer(item)
  const nodeJsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                  t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
  jsxElement = t.jsxExpressionContainer(t.conditionalExpression(types,nodeJsxElement,t.nullLiteral()))
  return jsxElement
}

const handleVIfElseIf = (chilrenNodes, item, itemVIf, attrsMap, attrsMapVIf, chilren) => {

  let jsxElement = handleVIfSingle(item, attrsMap, chilren)
  chilrenNodes.push(jsxElement)
 
  const valueVIfElseIf = attrsMapVIf['v-else-if']
  const typesVIfElseIf = isEqualExpression(valueVIfElseIf) ? handleEqualExpression(valueVIfElseIf) : t.identifier(valueVIfElseIf)
  delete attrsMapVIf['v-else-if']
  const attrsChildSetVIfElseIf = handleClassContainer(itemVIf)
  const nodeJsxElementVIfElseIf = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(itemVIf.tag),attrsChildSetVIfElseIf), 
                  t.jsxClosingElement(t.jsxIdentifier(itemVIf.tag)), chilren)
  let jsxElementVIfElseIf = t.jsxExpressionContainer(t.conditionalExpression(typesVIfElseIf,nodeJsxElementVIfElseIf,t.nullLiteral()))
  chilrenNodes.push(jsxElementVIfElseIf)
  return chilrenNodes
}

const handleVIfElse = (chilrenNodes, item, itemVIf, attrsMap, attrsMapVIf, chilren) => {
  const value = attrsMap['v-if']
  const types = isEqualExpression(value) ? handleEqualExpression(value) : t.identifier(value)
  delete attrsMap['v-if']
  const attrsChildSet = handleClassContainer(item)
  const nodeJsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                  t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
  delete attrsMapVIf['v-else']
  const attrsChildSetVIfElse = handleClassContainer(itemVIf)
  const nodeJsxElementVIfElse = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(itemVIf.tag),attrsChildSetVIfElse), 
                  t.jsxClosingElement(t.jsxIdentifier(itemVIf.tag)), chilren)
  jsxElement = t.jsxExpressionContainer(t.conditionalExpression(types,nodeJsxElement,nodeJsxElementVIfElse))
  chilrenNodes.push(jsxElement)
  return chilrenNodes
}

const handleToJSXElementSingle = (templateAst) => {
    const attrsSet = handleClassContainer(templateAst)
    let jsxOpeningElement = t.jsxOpeningElement(t.jsxIdentifier(templateAst.tag),attrsSet)
    let jsxClosingElement = t.jsxClosingElement(t.jsxIdentifier(templateAst.tag))
    handleConditions(templateAst)
    let chilrenNodes = []
    if(templateAst.children && templateAst.children.length){
      for(let i=0;i<templateAst.children.length;i++) {
        let item = templateAst.children[i]
        let jsxElement
        let jsxElementVIfElseIf
        let chilren = []
        if (item.children && item.children.length) {
          // 遍历item.children 确认每个children是否都存在ifConditions
          chilren = handleToJSXElementSingle(item).chilrenNodes
        }
        if (item.type == '1') {
            if (item.ifConditions) {
              // console.log(item.ifConditions, ',,,,,,,,,,,,,,,,,')
              const len = item.ifConditions.length
              const attrsMap = item.attrsMap
              switch(len) {
                case 1:
                  jsxElement = handleVIfSingle(item, attrsMap, chilren)
                case 2:
                  const itemVIf = templateAst.children[i+1]
                  const attrsMapVIf= itemVIf.attrsMap
                  const keyArr = Object.keys(attrsMapVIf)
                  if (keyArr.includes('v-else-if')) {
                    chilrenNodes = handleVIfElseIf(chilrenNodes, item, itemVIf, attrsMap, attrsMapVIf, chilren)
                  } else if (keyArr.includes('v-else')) {
                    chilrenNodes = handleVIfElse(chilrenNodes, item, itemVIf, attrsMap, attrsMapVIf, chilren)
                  }
                  i++
                // case 3:

              }
            } else {
              const attrsChildSet = handleClassContainer(item)
              jsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                              t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
              chilrenNodes.push(jsxElement)
            }
        }
        if (item.type == '3') {
          const text = item.text ? item.text : "\n"
          jsxElement = t.jsxText(text)
          chilrenNodes.push(jsxElement)
        }
        // chilrenNodes.push(jsxElement)
      }
    }
    if (!chilrenNodes) {
      chilrenNodes = []
    }
    jsxElement = t.jsxElement(jsxOpeningElement, jsxClosingElement, chilrenNodes)
    return {chilrenNodes, jsxElement}
  }

const handleToJSXElementSingle1 = (templateAst) => {
    const attrsSet = handleClassContainer(templateAst)
    let jsxOpeningElement = t.jsxOpeningElement(t.jsxIdentifier(templateAst.tag),attrsSet)
    let jsxClosingElement = t.jsxClosingElement(t.jsxIdentifier(templateAst.tag))
    handleConditions(templateAst)
    let chilrenNodes = templateAst.children.length && templateAst.children.map((item, index) => {
        let jsxElement
        let chilren = []
        if (item.children && item.children.length) {
          // 遍历item.children 确认每个children是否都存在ifConditions
          chilren = handleToJSXElementSingle(item).chilrenNodes
        }
        if (item.type == '1') {
            const attrsChildSet = handleClassContainer(item)
            jsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                            t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
        }
        if (item.type == '3') {
          const text = item.text ? item.text : "\n"
          jsxElement = t.jsxText(text)
        }
        return jsxElement
    })
    if (!chilrenNodes) {
      chilrenNodes = []
    }
    jsxElement = t.jsxElement(jsxOpeningElement, jsxClosingElement, chilrenNodes)
    return {chilrenNodes, jsxElement}
}

const handleToJSXElement = (templateAst) => {
    // 若为顶级标签元素 弄n套顶级container出来
    const temIfConditions = templateAst.ifConditions
    if (!templateAst.parent && temIfConditions && temIfConditions.length) {
      jsxElementContainer = temIfConditions.map((item,index) => {
        return handleToJSXElementSingle(item.block).jsxElement
      })
    } else handleToJSXElementSingle(templateAst)

}

const pushToAst = (ast) => {
  if (jsxElementContainer && jsxElementContainer.length) {

  } else {
    ast.program.body.push(t.classMethod(DEFAULTKIND,t.identifier('render'),[],
        t.blockStatement([t.returnStatement(jsxElement)])))
  }
}

const removeInstruction = (path, value, key) => {
  path.traverse({
    // 移除指令
    JSXAttribute(path) {
      const { name: { name }, value: { value: subValue }  } = path.node
      isEquals(value, subValue) && isEquals(name, key) && path.remove()
    }
  })
}

const handleTemplateAst = (ast, templateAst, filePath, cb) => {
  let astContent
  handleToJSXElement(templateAst)
  pushToAst(ast)
  // console.log(templateAst)
  traverse(ast, {
    JSXElement(path) {
      const { node } = path
      const attributes = node.openingElement.attributes
      const isAll = attributes.map((item, index) => {
        return item.name.name
      })
      for (let index=0; index<attributes.length; index++) {
        const { name: { name }, value: { value } } = attributes[index]
        break;
        if (isEquals(name, 'v-if')) {
          removeInstruction(path, value, 'v-if')
          const types = isEqualExpression(value) ? handleEqualExpression(value) : t.identifier(value)
          const jsxExpressionContainer = t.jsxExpressionContainer(t.conditionalExpression(types,node,t.nullLiteral()))
          path.replaceWith(jsxExpressionContainer)
        }
        if (isEquals(name, 'v-for')) {
          removeInstruction(path, value, 'v-for')
          const [val1, val2] = handleFor(value)
          let item, expression
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