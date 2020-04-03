<template>
 <!-- class="hello" -->
  <div>
    <!-- <ul class='ttt' v-if='a'>
        <li class="div1" v-for='item in arrs'></li>
        <li class="div1" v-if='c'></li>
    </ul>  -->
     <!--<input class='inputStyle' v-model='value'/>-->
    <p v-if='b===1'><span>123</span></p>
    <div v-else-if='b===3' class='bbbb'><p>123</p></div>
    
    <p v-if='b===1'><span>123</span></p>
    <div v-else class='bbbb'><p>123</p></div>
    <!-- <div v-else>123</div> 
     <div class='vvv'>123</div>  -->
  </div>
  <!-- <div class='cvb' v-else>12345</div> -->
</template>

<script>
import { Dialog, Toast, Table, Tree } from 'i-mayfly';
import 'i-mayfly/lib/component/table/style/css';
// import 'i-mayfly/lib/component/dialog/style/css';
export default {
  // name: 'HelloWorld',
  data () {
    return {
      obj: {
         a: 1
      },
      msg: 'Welcome to Your Vue.js App'
    }
  },
  mounted() {
    if (this.obj && this.msg) {
      console.log(Table, '3414321')
    }
  },
  beforeMount() {
    console.log('4134341413')
  },
  methods: {
    initialMethod() {
      console.log('vue method')
    },
    secondMethod() {
      console.log('vue method second')
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.div1 {
        /* width:500px;
        height:400px; */
        border:1px solid black;
        /* display: flex;
        justify-content: center;
        align-items: center; */
        display: table-cell;
        vertical-align: middle;
    }
    .div1 img  {
        max-width: 90%;
        max-height: 90%;
        display: block;
        margin: auto;
    }
</style>
