
## Introduction
- transform vue to react via ast
- webpack plugin
- 简化版转化插件

## Install


## Usage
 - v-if/v-else-if/v-else
 - v-for
 - v-show
 - v-bind
 - emiterName={(new) => this.setState({xxx:new})
 - v-model
 - v-on
 - v-bind => 未考虑expression存在的情况
 - v-text(待实现)
 - v-html => dangerousHtml(待实现)
 - class => className
 - data() => this.state
 - Props => props
 - 组件名转驼峰
 - created: ‘componentWillMount’,
 - mounted: ‘componentDidMount’,
 - updated: ‘componentDidUpdate’,
 - beforeDestroy: ‘componentWillUnmount’,
 - errorCaptured: ‘componentDidCatch’,
 - template => render
 - style => index.(less | css | styl | scss | ) 
 - this.$refs
 - v-for/v-if/v-else-if/v-else 同时存在

## Options
- 由于vue与react语法在某些地方转化不可控，因此如果完全使用ast的方式，可能无法满足需求
