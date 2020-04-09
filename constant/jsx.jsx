
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
      if (a!==3) {
          return
      		<div>123</div>
          } else if (a===3) {
         return(
          <div class="hello">
              <ul v-show='a' class='ttt'>
                <li class="div1"></li>
            </ul>
            <input class='inputStyle'/>
           <p v-if='b===2'>123</p>
           <p v-else>321</p>
           {b===2?<p>123</p>:<p>321</p>}</div>
        )
      }
      
       
    }
}