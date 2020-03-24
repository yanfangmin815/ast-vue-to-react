
const path = require('path')
const t = require('babel-types');
const traverse = require("@babel/traverse").default;
const { 
    isObject,
    isArray } = require('./utils')
const { 
    defaultKind,
    defaultProps,
    DEFAULTCONSTRUCTOR } = require('./constant')

const plugins = {
    beforeCreate: 'beforeCreate',
    created: 'created',
    beforeMount: 'componentWillMount',
    mounted: 'componentDidMount',
    beforeUpdate: 'componentWillUpdate',
    updated: 'componentDidUpdate',
    data: 'state'
  };
  
  const objectMethodCompile = ({path, proper}) => {
      // 如果为普通函数 转为箭头函数
      const keyName = proper.key.name
      const nodeBody = proper.body
      const nodeParams = proper.params
      let classProperty = null
      classProperty = t.classProperty(t.identifier(keyName),
                t.arrowFunctionExpression(nodeParams, nodeBody))     
      return classProperty
  }
const transformToConstructor = ({ path }) => {
    const argument = path.node.body.body[0].argument
    return t.classMethod(DEFAULTCONSTRUCTOR, 
            t.identifier(DEFAULTCONSTRUCTOR), 
            [t.identifier(defaultProps)], 
            t.blockStatement([
              t.expressionStatement(t.callExpression(t.super(), [t.identifier(defaultProps)])),
              t.expressionStatement(t.assignmentExpression('=', 
                      t.memberExpression(t.thisExpression(),t.identifier('state')), argument))
            ]))
  }
  
  const transformToLifeCycle = ({ keyName, nodeParams, nodeBody }) => {
    return t.classMethod(defaultKind, t.identifier(plugins[keyName]), nodeParams, nodeBody)
  }
  
  const transformToReactCycle = (args) => {
    return plugins[args.keyName] === 'state' ? transformToConstructor(args) : transformToLifeCycle(args)
  }
  const handleJsAst = (ast, filePath, cb) => {
    let astContent
    traverse(ast, {
        Program: {
          enter(path) {

          },
          exit() {
            astContent = ast
            // cb(ast, filePath)
          }
      },
      ImportDeclaration(path) {
        ast.program.body.unshift(path.node)
        path.remove()
      },
      ObjectMethod(path) {
        const keyName = path.node.key.name
        const nodeBody = path.node.body
        const nodeParams = path.node.params
        let classProperty = null
        // 如果为生命周期函数
        if (plugins[keyName]) {
          // 转为相应的生命周期函数
          classProperty = transformToReactCycle({path, keyName, nodeParams, nodeBody})
          path.replaceWith(classProperty)
        } 
      },
      ObjectProperty(path) {
        const properties = path.node.value.properties
        let bool = false
        const arrs = properties && properties.length && properties.map((proper,index) => {
          // 处理objectMethod
          return t.isObjectMethod(proper) && objectMethodCompile({path, proper})
        })
        if (!isArray(arrs)) {
           bool = true
        }
        isArray(arrs) && arrs.length && arrs.map((arr, index) => {
          if(!isObject(arr)) {
            bool = true
          }
        })
        !bool && path.replaceWithMultiple(arrs)
      },
      // 处理this
      MemberExpression(path) {
        if ( t.isThisExpression(path.node.object) 
             && t.isIdentifier(path.node.property) 
             && path.node.property.name !== 'state') {
          path.get('object').replaceWith(t.memberExpression(t.thisExpression(), t.identifier('state')))
        }
      }
    })
    return astContent
  }

  module.exports = {
    handleJsAst
  }