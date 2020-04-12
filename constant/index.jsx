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
  cdsmWp = b => {
    switch (b) {
      case "1":
        return <p><span>123</span></p>;

      case "3":
        return <div className="bbbb"><p>123</p></div>;

      default:
        return <div className="cccc"><p>123</p></div>;
    }
  };

  render() {
    {
      return <div><div className="vvv">123</div> {this.cdsmWp(b)}</div>;
    }
  }

}