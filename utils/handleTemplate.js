
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const { 
  tags } = require('../config')
const { 
  isEqualExpression,
  trim,
  isEquals,
  handleFor,
  ifArrs,
  eventNames,
  selfNames,
  produceString,
  isLogicalOperatorsExsits,
  splitString,
  isArgsExist } = require('./utils')
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
let arrClassName
let ifStatements
let classDeclaration
let globalAst

const handleClass = (templateAst) => {
    for (key in templateAst.attrsMap) {
        if (key.indexOf('v-on:') !== -1) {
          const str = key.replace(/v-on:/, '@')
          templateAst.attrsMap[str] = templateAst.attrsMap[key]
          delete templateAst.attrsMap[key]
        }
        if (key.indexOf('v-bind:') !== -1 || key.indexOf(':') === 0 ) {
          const str = key.replace(/v-bind:|:/, '')
          templateAst.attrsMap[str] = templateAst.attrsMap[key]
          delete templateAst.attrsMap[key]
        }
        if (key === 'class') {
            templateAst.attrsMap[maps[key]] = templateAst.attrsMap[key]
            delete templateAst.attrsMap[key]
        }
    }
}

const getIfCondition = (ifCondition) => {
  if (isEquals(ifCondition.length, 1)) return 1
  if (isEquals(ifCondition.length, 2)) return 2
  if (ifCondition.length >= 3) return 3
}

const getClassName = (ast) => {
  let arr = []
  ast.program.body.some((item,index) => {
    if (t.isClassDeclaration(item)) {
      item.body.body.map((subItem,subIndex) => {
        arr.push(subItem.key.name)
      })
      return true
    }
  })
  return arr
}

//处理v-show
const handleVShow = (vals) => {
  const types = isEqualExpression(vals) ? handleEqualExpression(vals).binaryExpression : t.identifier(vals)
  return t.jsxAttribute(t.jsxIdentifier('style'), 
            t.jsxExpressionContainer(t.objectExpression([t.objectProperty(t.identifier('display'),
                  t.conditionalExpression(types,t.stringLiteral('block'),t.stringLiteral('none')))])))
}

// 解析二元表达式-1
const handleEqualExpression = (val) => {
  const valNew = trim(val)
  const splitedArr = valNew.split(/(===|==)/)
  const leftVal = t.identifier(splitedArr[0])
  const operator = splitedArr[1]
  const rightVal = typeof splitedArr[2] === 'string' ? t.stringLiteral(splitedArr[2]) : t.numericLiteral(splitedArr[2])
  return {leftVal, rightVal, binaryExpression: t.binaryExpression(operator,leftVal,rightVal)}
}

// 处理v-if/v-model/v-for
const handleVIf = (item, vals) => {
  return t.jsxAttribute(t.jsxIdentifier(item),t.stringLiteral(vals))
}

const handleItem = (item) => {
  if (eventNames.hasOwnProperty(item)) return 'event'
  else if (selfNames.includes(item)) return item
  else return 'custom'
}

const getArgsName = (vals) => {
  const val = trim(vals)
  const args = isArgsExist(val) ? val.slice(val.indexOf('(') + 1, val.indexOf(')')).split(',') : ''
  const name = val.slice(0, val.indexOf('('))
  return { args, name }
}

const handleEvent = (item, val) => {
  const { args, name } = getArgsName(val)
  const argArr = args && args.length && args.map((arg, index) => {
    return t.identifier(arg)
  })
  const memberExpression = t.memberExpression(t.thisExpression(), t.identifier(name)) 
  const expression = isArgsExist(val) === 1 
  ? memberExpression
  : t.callExpression(t.memberExpression(memberExpression, t.identifier('bind')),[t.thisExpression(), ...argArr])
  return t.jsxAttribute(t.jsxIdentifier(eventNames[item]),t.jsxExpressionContainer(expression))
}

const handleRef = (tag, item, val) => {
  return tags.includes(tag) ? handleTag(item, val) :handleComponent(item, val)
}

const getMemberExpressionSingle = (val) => {
  return t.memberExpression(t.thisExpression(),t.identifier(val))
}

// 处理标签ref
const handleTag = (item, val) => {
  let bool = false
  const programBody = globalAst.program.body
  for (let i=0;i<programBody.length;i++) {
    const item = programBody[i]
    if (t.isClassDeclaration(item)) {
      const body = item.body.body
      body.some((b,i) => {
        const bBody = b.body.body
        if (t.isClassMethod(b) && isEquals(b.kind, 'constructor')) {
          const expressionStatementObj = t.expressionStatement(t.assignmentExpression('=', 
          getMemberExpressionSingle('$refs'), t.objectExpression([])))
          const expressionStatement = t.expressionStatement(t.assignmentExpression(
                '=', getMemberExpressionSingle(val), 
                t.arrowFunctionExpression([t.identifier('e')], t.blockStatement([
                t.expressionStatement(t.assignmentExpression('=', 
                t.memberExpression(getMemberExpressionSingle('$refs'), t.identifier(val)), t.identifier('e')))
              ]))))
          bBody.push(expressionStatementObj)
          bBody.push(expressionStatement)
          bool = true
          return true
        }
      })
    }
    if(bool) break; 
  }
  return t.jsxAttribute(t.jsxIdentifier(item), t.jsxExpressionContainer(getMemberExpressionSingle(val)))
}

// 处理组件ref
const handleComponent = (item, val) => {
  const jsxIdentifier = t.jsxIdentifier(val)
  const jsxExpressionContainer = t.jsxExpressionContainer(t.arrowFunctionExpression([t.identifier('el')],
      t.assignmentExpression('=', getMemberExpressionSingle(val), t.identifier('el'))))
  return t.jsxAttribute(jsxIdentifier, jsxExpressionContainer)
}


const handleClassContainer = (templateAst) => {
  handleClass(templateAst) // class处理为className && 处理事件为react标准
  const { attrsMap, tag } = templateAst
  const attrs = Object.keys(attrsMap)
  const attrsSet = attrs.length && attrs.map((item, index) => {
    const vals = attrsMap[item]
    let instructions = handleItem(item)
    switch(instructions) {
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
      case 'event':
        return handleEvent(item,vals) // 放到render里面处理
      case 'custom':
        return handleVIf(item,vals) // 放到render里面处理
      case 'ref':
        return handleRef(tag,item,vals) // 放到render里面处理
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

const handleJsxElement = (item, attrsMap, key, chilren) => {
  const value = attrsMap[key]
  const types = isEqualExpression(value) ? handleEqualExpression(value).binaryExpression : t.identifier(value)
  delete attrsMap[key]
  const attrsChildSet = handleClassContainer(item)
  const nodeJsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                  t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
  return { types, nodeJsxElement }
}

const handleVIfSingle = (item, attrsMap, key, chilren) => {
  const { types, nodeJsxElement } = handleJsxElement(item, attrsMap, key, chilren)
  jsxElement = t.jsxExpressionContainer(t.conditionalExpression(types,nodeJsxElement,t.nullLiteral()))
  return jsxElement
}

const handleVIfElseIf = ({chilrenNodes, item, itemVIf, attrsMap, attrsMapVIf, chilren, chilrenVIf}) => {

  let jsxElement = handleVIfSingle(item, attrsMap, 'v-if', chilren)
  chilrenNodes.push(jsxElement)
 
  let jsxElementVIfElseIf = handleVIfSingle(itemVIf, attrsMapVIf, 'v-else-if', chilrenVIf)
  chilrenNodes.push(jsxElementVIfElseIf)

  return chilrenNodes
}

const handleVIfElse = ({chilrenNodes, item, itemVIf, attrsMap, attrsMapVIf, chilren, chilrenVIf}) => {
  const value = attrsMap['v-if']
  const types = isEqualExpression(value) ? handleEqualExpression(value).binaryExpression : t.identifier(value)
  delete attrsMap['v-if']
  const attrsChildSet = handleClassContainer(item)
  const nodeJsxElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                  t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren)
  delete attrsMapVIf['v-else']
  const attrsChildSetVIfElse = handleClassContainer(itemVIf)
  const nodeJsxElementVIfElse = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(itemVIf.tag),attrsChildSetVIfElse), 
                  t.jsxClosingElement(t.jsxIdentifier(itemVIf.tag)), chilrenVIf)
  jsxElement = t.jsxExpressionContainer(t.conditionalExpression(types,nodeJsxElement,nodeJsxElementVIfElse))
  chilrenNodes.push(jsxElement)
  return chilrenNodes
}

const handleToJSXElementSingle = (templateAst, ast) => {
    const attrsSet = handleClassContainer(templateAst)
    let jsxOpeningElement = t.jsxOpeningElement(t.jsxIdentifier(templateAst.tag),attrsSet)
    let jsxClosingElement = t.jsxClosingElement(t.jsxIdentifier(templateAst.tag))
    handleConditions(templateAst)
    let chilrenNodes = []
    if(templateAst.children && templateAst.children.length){
      for(let i=0;i<templateAst.children.length;i++) {
        let item = templateAst.children[i]
        let jsxElement
        let chilren = []
        if (item.children && item.children.length) {
          // 遍历item.children 确认每个children是否都存在ifConditions
          chilren = handleToJSXElementSingle(item, ast).chilrenNodes
        }
        if (item.type == '1') {
            if (item.ifConditions) {
              const len = getIfCondition(item.ifConditions)
              const attrsMap = item.attrsMap
              switch(len) {
                case 1:
                  jsxElement = handleVIfSingle(item, attrsMap, 'v-if', chilren)
                  chilrenNodes.push(jsxElement)
                  break;
                case 2:
                  const itemVIf = templateAst.children[i+1]
                  if (itemVIf.children && itemVIf.children.length) {
                    // 遍历item.children 确认每个children是否都存在ifConditions
                    chilrenVIf = handleToJSXElementSingle(itemVIf, ast).chilrenNodes
                  }
                  const attrsMapVIf= itemVIf.attrsMap
                  const keyArr = Object.keys(attrsMapVIf)
                  const afParameter = { chilrenNodes, item, itemVIf, attrsMap, attrsMapVIf, chilren, chilrenVIf }
                  if (keyArr.includes('v-else-if')) {
                    chilrenNodes = handleVIfElseIf(afParameter)
                  } else if (keyArr.includes('v-else')) {
                    chilrenNodes = handleVIfElse(afParameter)
                  }
                  i++
                  break;
                case 3:
                  let functioname
                  let value = attrsMap['v-if']
                  let arrSwitchCase = []
                  let conditionLen = Number(item.ifConditions.length)
                  if (arrClassName.includes(produceString(6))) {
                    produceString(6)
                    return
                  }
                  arrClassName = getClassName(ast).concat([produceString(6)])
                  functioname = produceString(6)
                  let { leftVal } = handleEqualExpression(value)
                  const jsxExpressionContainer = t.jsxExpressionContainer(t.callExpression(
                    getMemberExpressionSingle(functioname),[t.identifier(leftVal)]))
                  chilrenNodes.push(jsxExpressionContainer)
                  templateAst.children.slice(i, i+conditionLen).map((item,index) => {
                    if (item.children && item.children.length) {
                      // 遍历item.children 确认每个children是否都存在ifConditions
                      chilren = handleToJSXElementSingle(item, ast).chilrenNodes
                    }
                    let types
                    let value = item.attrsMap['v-if'] || item.attrsMap['v-else-if'] || item.attrsMap['v-else']
                    if (isEqualExpression(value)) {
                      let { rightVal } = handleEqualExpression(value)
                      types = rightVal
                    } else {
                      types = value ? value.indexOf('!') !== '-1' ? t.booleanLiteral(true) : t.booleanLiteral(false) : null
                    }
                    // 删除指令
                    item.attrsMap['v-if'] && delete item.attrsMap['v-if']
                    item.attrsMap['v-else-if'] && delete item.attrsMap['v-else-if']
                    item.attrsMap.hasOwnProperty('v-else') && delete item.attrsMap['v-else']
                    const attrsChildSet = handleClassContainer(item)
                    const casees = t.switchCase(types, [t.returnStatement(t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(item.tag),attrsChildSet), 
                        t.jsxClosingElement(t.jsxIdentifier(item.tag)), chilren))])
                    arrSwitchCase.push(casees)
                  })
                  // 添加到ast body体中
                  classDeclaration.body.body.push(t.classProperty(t.identifier(functioname),t.arrowFunctionExpression([t.identifier(leftVal)],
                      t.blockStatement([t.switchStatement(t.identifier(leftVal),arrSwitchCase)]))))
                  i+=conditionLen
                  break;
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
      }
    }
    if (!chilrenNodes) {
      chilrenNodes = []
    }
    jsxElement = t.jsxElement(jsxOpeningElement, jsxClosingElement, chilrenNodes)
    return {chilrenNodes, jsxElement}
}

const handleToJSXElement = (templateAst, ast) => {
    getClassDeclaration(ast)
    // 若为顶级标签元素 new n个顶级container
    const temIfConditions = templateAst.ifConditions
    if (!templateAst.parent && temIfConditions && temIfConditions.length) {
      jsxElementContainer = temIfConditions.map((item,index) => {
        return handleToJSXElementSingle(item.block, ast).jsxElement
      })
    } else handleToJSXElementSingle(templateAst, ast)
    pushToAst(ast)
}

const otherExpression = (value) => {
  return isEqualExpression(value) ? handleEqualExpression(value).binaryExpression : t.identifier(value)
}

const getLogicalExpression = (value) => {
  const splitResult = splitString(value).value
  const { arr } = splitString(value)
  const length = splitResult.length - 1
  let logicalExpression
  for (let i=0;i<length;i++) {
    const first = splitResult[i]
    const second = splitResult[i+1]
    let firstVal = isEqualExpression(first) ? handleEqualExpression(first).binaryExpression : t.identifier(first)
    let secondVal = second ? isEqualExpression(second) ? handleEqualExpression(second).binaryExpression : t.identifier(second) : ''
    if (!logicalExpression) {
      logicalExpression = t.logicalExpression(arr[i],firstVal, secondVal) 
    } else {
      logicalExpression = t.logicalExpression(arr[i],logicalExpression, secondVal) 
    }
  }
  return logicalExpression
}

const pushToAst = (ast) => {
  if (jsxElementContainer && jsxElementContainer.length) {
    let len = jsxElementContainer.length
    let conditionVal, testExpression, attributes
    for(let i=len-1;i>=0;i--) {
      jsxElement = jsxElementContainer[i]
      Object.keys(jsxElement).some((item,index) => {
        attributes = jsxElement.openingElement.attributes
        const [{ name: { name }, value: { value } }] = attributes
        if (ifArrs.includes(name)) {
          conditionVal = value
          return true
        }
      })
      // 获取if条件
      if (conditionVal) {
        testExpression = isLogicalOperatorsExsits(conditionVal) ? getLogicalExpression(conditionVal) : otherExpression(conditionVal)
      }
      if (i + 1 == len && ifArrs.includes('v-else')) {
        ifStatements = t.blockStatement([t.returnStatement(jsxElement)])
      }
      if (i + 1 == len && ifArrs.includes('v-if-else')) {
        ifStatements = t.ifStatement(testExpression,t.blockStatement([t.returnStatement(jsxElement)]), null)
      }
      if (i + 1 < len) {
        ifStatements = t.ifStatement(testExpression,t.blockStatement([t.returnStatement(jsxElement)]),ifStatements)
      } 
      for(let index=0;index<attributes.length;index++) {
        const [{ name: { name } }] = attributes
        if (ifArrs.includes(name)) {
          attributes.splice(index,1)
          break;
        }
      }
    }
    const element = [ifStatements]
    pushToAstBody(element)
  } else {
    const element = [t.returnStatement(jsxElement)]
    pushToAstBody(element)
  }
}

const pushToAstBody = (element) => {
  classDeclaration.body.body.push(t.classMethod(DEFAULTKIND,t.identifier('render'),[],
    t.blockStatement(element)))
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

const getMemberExpression = (val2) => {
  return t.memberExpression(t.memberExpression(t.thisExpression(),t.identifier(DEFAULTPROPS)),
    t.identifier(trim(val2)))
}

const getClassDeclaration = (ast) => {
  ast.program.body.some((item,index) => {
    if(t.isClassDeclaration(item)) {
      classDeclaration = item
      return true
    }
  })
}

const handleTemplateAst = (ast, templateAst, filePath, cb) => {
  globalAst = ast
  arrClassName = getClassName(ast)
  handleToJSXElement(templateAst, ast)
  traverse(ast, {
    JSXElement(path) {
      const { node } = path
      const attributes = node.openingElement.attributes
      for (let index=0; index<attributes.length; index++) {
        const { name: { name }, value: { value } } = attributes[index]
        // break
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
          const logicalExpression = t.logicalExpression('&&', t.logicalExpression('&&', 
              getMemberExpression(val2), t.memberExpression(getMemberExpression(val2),t.identifier('length'))
          ), t.callExpression(t.memberExpression(getMemberExpression(val2),
            t.identifier('map')),[t.arrowFunctionExpression(expression,node)]))
          path.replaceWith(logicalExpression)
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
  // cb(ast)
  return ast
}

module.exports = {
  handleTemplateAst
}