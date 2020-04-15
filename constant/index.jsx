import React, { Component, PropTypes } from "react";
import { Dialog, Toast, Table, Tree } from 'i-mayfly';
import 'i-mayfly/lib/component/table/style/css';
import "index.less";

class Index extends React.Component {
  // name: 'HelloWorld',
  constructor(props) {
    super(props);
    this.state = {
      obj: {
        a: 1
      },
      msg: 'Welcome to Your Vue.js App'
    };
  }

  componentDidMount() {
    if (this.state.obj && this.state.msg) {
      console.log(Table, '3414321');
    }
  }

  componentWillMount() {
    console.log('4134341413');
  }

  initialMethod = () => {
    console.log('vue method');
  };
  secondMethod = () => {
    console.log('vue method second');
  };

  render() {
    {
      return <div onBlur={this.clickTap}><div className="vvv">123</div></div>;
    }
  }

}