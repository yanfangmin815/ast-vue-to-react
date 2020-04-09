import React, { Component, PropTypes } from "react";
import { Dialog, Toast, Table, Tree } from 'i-mayfly';
import "index.less";
import 'i-mayfly/lib/component/table/style/css';

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
}

ji_Dhd = arr => {
  switch (arr) {
    case "3":
      return <span>{arr}</span>;

    case "4":
      return <span>{arr}---{index}</span>;

    case "5":
      return <span>{arr}+++{index}</span>;

    case "6":
      return <span>{arr}.....{index}</span>;

    default:
      return <span>{arr},,,,,{index}</span>;
  }
};

render() {
  return <div>{name === "123" ? <ul>{arr === "3" ? this.props.arrs && this.props.arrs.length && this.props.arrs.map((arr,index) => <p>{arr}---{index}</p>) : null}</ul> : null} <br></br> {name === "456" ? <ul>this.props.arrs && this.props.arrs.length && this.props.arrs.map((arr,index) => <p>{this.ji_Dhd(arr)}</p>)</ul> : null} <div className="vvv">123</div></div>;
}