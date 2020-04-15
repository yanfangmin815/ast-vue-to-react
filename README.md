
## Introduction
- transform vue to react via ast
- webpack plugin
- 简化版转化插件

## Install


## Usage
 - v-if、v-else-if、v-else
 - v-for
 - v-show
 - v-bind v-bind:attr.sync = xxx>
 - emiterName={(new) => this.setState({xxx:new})
 - v-model
 - v-on
 - v-bind => 未考虑expression存在的情况
 - v-text (待实现)
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
 - style => index.(css | stylus | sass | less) 
 - this.\$refs(待实现)
 - v-for v-if v-show 同时存在的情况

## Options
- 由于vue与react语法存在某些地方的不可融合性，因此如果完全使用ast的方式相互转化，工作量会非常大