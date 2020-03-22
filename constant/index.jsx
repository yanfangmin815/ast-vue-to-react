import React, {Component, PropTypes} from 'react';
// import { Dialog, Toast, Table, Tree } from 'i-mayfly';
class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            obj: {
                a: 1,
                b: 2,
                c: false,
              },
            msg: 'Welcome to Your Vue.js App'
        }
    }

    componentWillMount() {
        if (this.obj && this.obj.a && this.obj.c) {
            // console.log(Table, '3414321')
        }
    }

    initialMethod = () => {
        console.log('this is vue method')
      }

    render() {
        return(
            <div class="hello">
                <ul>
                    <li class="div1"></li>
                </ul>
            </div>
        )
    }
}