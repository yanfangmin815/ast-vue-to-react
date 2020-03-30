const chokidar = require('chokidar');
const { parse } = require('@babel/parser');
const fs = require('fs');
const babylon = require('babylon');
const compiler = require('vue-template-compiler');
const path = require('path');
const traverse = require("@babel/traverse").default;
const generator = require('@babel/generator').default; // https://www.babeljs.cn/docs/6.26.3/babel-types
const t = require('@babel/types');
const _ = require('lodash');

const { handleJsAst } = require('./utils/handleScript')
const { handleTemplateAst } = require('./utils/handleTemplate')

const generateCatchClause = () => {
  // param-2
  const identifier3 = t.identifier('err')
  const identifier1 = t.identifier('console')
  const identifier2 = t.identifier('log')
  const memberExpression = t.memberExpression(identifier1, identifier2)
  /**
   * operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=" (required)
   * left: Expression (required)
   * right: Expression (required)
   */
  const StringLiteral = t.stringLiteral('err is:')
  const identifier = t.identifier('err')
  const binaryExpression = t.binaryExpression('+',StringLiteral, identifier)
  /**
   * callee: required
   * arguments: required
   */
  const callExpression = t.callExpression(memberExpression, [binaryExpression])
  const expressionStatement = t.expressionStatement(callExpression)

  const blockStatement = t.blockStatement([expressionStatement])
  const catchClause = t.catchClause(identifier3, blockStatement) // param-2
  return catchClause
}

const generateBlockStatement2 = () => {
   // param-3
   const identifier = t.identifier('console')
   const identifier1 = t.identifier('log')
   const memberExpression = t.memberExpression(identifier, identifier1)
  
   const StringLiteral = t.stringLiteral('exec finally')
   /**
    * callee: required
    * arguments: required
    */
   const callExpression = t.callExpression(memberExpression, [StringLiteral])
   const expressionStatement = t.expressionStatement(callExpression)
   const blockStatement = t.blockStatement([expressionStatement])

   return blockStatement
}

/**
 * generateTryStatement:获取最终的被try...catch包裹的函数
 */
const generateTryStatement = ({body=[]}) => {
  const nodeBody = t.blockStatement(body)
  const catchClause = generateCatchClause()
  const blockStatement = generateBlockStatement2()
  /**
   * block: BlockStatement (required)
   * handler: CatchClause (default: null)
   * finalizer: BlockStatement (default: null)
   */
  const tryStatement = t.tryStatement(nodeBody, catchClause, blockStatement)
  return tryStatement
}


class AutoTryCatch {
  constructor(options = {}) {
    if (!_.isObject(options)) {
      console.log("\x1b[31m Warning: \x1b[0m  \x1b[35m auto-add-try-catch's options should be a object \x1b[0m ");
      options = {dir:['src']};
    } else if (options.dir && !(_.isArray(options.dir) || _.isString(options.dir))) {
      options.dir = ['src'];
      console.log("\x1b[31m Warning: \x1b[0m  \x1b[35m auto-add-try-catch's dir options should be a array  \x1b[0m ");
    } else if (options.ignored && !_.isRegExp(options.ignored)) {
      options.ignored = null;
      console.log("\x1b[31m Warning: \x1b[0m  \x1b[35m auto-add-try-catch's ignored options should be a regexp  \x1b[0m ");
    }

    this.options = options;
    this.isWatching = false; // 是否watch模式

    this.watcher = null;
    this.compileHasError = false;
    this.pattern = ['.vue']
    this.jsAst = null
    this.templateAst = null
  }

  getFile(paths) {
    const _this = this;
    paths.map((item, index) => {
      const path1 = _this.getReolve(item)
      fs.stat(path1, (firsterr, firstData) => {
        // 判断是否是文件夹
        const isDirectory1 = firstData && firstData.isDirectory()
        switch(isDirectory1){
          case true: 
            fs.readdir(path1, (err, data) => {
              if (err) throw err;
              // 判断是否是文件夹
              for (let i = 0; i < data.length; i++) {
                let path2 = _this.getReolve(item + '/' + data[i])
                fs.stat(path2, function(err, stats) {
                  const isDirectory = stats.isDirectory()
                  if (isDirectory) {
                    fs.readdir(path2, (suberr, subdata) => {
                      let datas = subdata.map((items, indexes) => {
                        return items = item + '/' + data[i] + '/' + items
                      })
                      _this.getFile(datas)
                    })
                  } else {
                    // const path = item + '/' + data[i]
                    const extname = _this.getExtname(path2)
                    if (_this.pattern.includes(extname)) {
                      let astObj = _this.getAst(path2);
                      _this.handleTraverse(astObj, path2)
                    }
                  }
                });
              }
            });
            break;
          case false:
            const extname = _this.getExtname(path1)
            if (_this.pattern.includes(extname)) {
              let astObj = _this.getAst(path1);
              _this.handleTraverse(astObj, path1)
            }
            break;
          default:
            console.log('\x1b[34m 这不是正确路径，请输入正确路径！ \x1b[0m');
        }
      })
    })
  }

  getExtname(filePath){
    // The path.extname() method returns the extension of the path
    // path.extname('index.html');
    // Returns: '.html'
    return path.extname(filePath)
  }

  getReolve(filePath) {
    // return absolute path
    return path.resolve(filePath)
  }

  init(stats) {
    // 递归获取js文件
    const { pattern, dir } = this.options
    this.pattern = pattern && pattern.length && pattern || this.pattern
    this.getFile(dir)
    this.compileHasError = stats.hasErrors();

    if (this.isWatching && !this.watcher && !this.compileHasError) {
      // https://www.npmjs.com/package/chokidar
      this.watcher = chokidar.watch(dir, {
        usePolling: true,
        ignored: this.options.ignored
      });
      this.watcher.on('change', _.debounce(this.handleChange.bind(this)(), 0))
        .on('unlink', _.debounce(this.handleChange.bind(this)(true), 0));
    }
  }

  // 处理监控文件 判断是否需要重写
  handleChange() {
    return (pathname, stats) => {
      const filePath = this.getReolve(pathname)
      const astObj = this.getAst(filePath)
      this.handleTraverse(astObj, filePath)
    }
  }

  handleTraverse({ast='', templateAst=''}, filePath='') {
      let isChanged = true
      // 如果不符合条件 则不添加try...catch
      if (isChanged) {
        this.handleAst(ast, templateAst, filePath)
      }
  }

  getAst(filename) {
    const content = fs.readFileSync(filename, 'utf8')
    const res = compiler.parseComponent(content.toString(), { pad: 'line' });
    const component = {
      template: res.template.content,
      js: res.script.content.replace(/\/\/\n/g, ''),
      styles: res.styles
    }
    try {
      const ast = babylon.parse(component.js, {
        sourceType: 'module'
      })
      const templateAst = compiler.compile(component.template).ast

      return {ast,templateAst};
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  autoWriteFileSync(ast='', filePath='') {
      const config = {
        quotes: 'single', 
        retainLines: false, 
        compact: false,
        concise: false
      }
      // 设置输出格式
      const output = generator(ast, config);
      console.log(output.code, '??????????')

      // fs.writeFileSync(filePath, output.code);
  }

  handleAst(ast, templateAst, filePath) {
    new Promise((reslove,reject) => {
      this.jsAst = handleJsAst(ast, filePath, this.autoWriteFileSync)
      reslove(this.jsAst)
    }).then((data) => {
      // 处理template
      this.templateAst = handleTemplateAst(data, templateAst, filePath, this.autoWriteFileSync)
    }, err => {})
  }

  watchClose() {
    if (this.watcher) {
      this.watcher.close();
    }
  } 

  // 实例化时调用 apply
  apply(compiler) {
    const init = this.init.bind(this);
    const watchClose = this.watchClose.bind(this);

    if (compiler.hooks) {
      compiler.hooks.watchRun.tap('AutoTryCatch', () => {
        this.isWatching = true;
      });
      compiler.hooks.done.tap('AutoTryCatch', init);
      compiler.hooks.watchClose.tap('AutoTryCatch', watchClose);
    } else {
      compiler.plugin('watchRun', () => {
        this.isWatching = true;
      });
      compiler.plugin('done', init);
      compiler.plugin('watchClose', watchClose);
    }
  }
}

module.exports = AutoTryCatch;