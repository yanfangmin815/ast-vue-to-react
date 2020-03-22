const fs = require('fs')
const path = require('path')
const t = require('babel-types');
const { 
  defaultKind,
  defaultProps,
  DEFAULTCONSTRUCTOR } = require('./constant')
 

const isExist = (path) => {
  return fs.existsSync(path)
}

const plugins = {
  beforeCreate: 'beforeCreate',
  created: 'created',
  beforeMount: 'componentWillMount',
  mounted: 'componentDidMount',
  beforeUpdate: 'componentWillUpdate',
  updated: 'componentDidUpdate',
  data: 'state'
};

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

module.exports = {
  isExist,
  plugins,
  transformToReactCycle
}