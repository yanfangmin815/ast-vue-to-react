<template>
 <!-- class="hello" -->
  <div>
     <ul v-if='name===123'>
        <p v-for='(arr,index) in arrs' v-if='arr===3'>{arr}---{index}</p>
    </ul>
    <br/>
    <ul v-if='name===456'>
        <p v-for='(arr, index) in arrs'>
            <span v-if='arr==3'>{arr}</span>
            <span v-else-if='arr==4'>{arr}---{index}</span>
            <span v-else-if='arr==5'>{arr}+++{index}</span>
            <span v-else-if='arr==6'>{arr}.....{index}</span>
            <span v-else>{arr},,,,,{index}</span>
        </p>
    </ul>
     <!-- <div v-if='a===1'>
      <p v-if='b===1'><span>gfdgdfgsdf</span></p>
      <div v-else-if='b===2' class='bbbb'><p>123</p></div>
      <div v-else-if='b===3' class='eeee'><p>123</p></div>
      <div v-else-if='b===4' class='bbbb'><p>123</p></div>
      <div v-else-if='b===5' class='bbbb'><p>123</p></div> -->
      <!-- <div v-else-if='b===4' class='bbbb'><p>123</p></div> -->
      <!-- <div v-else class='cccc'><p>1234567890</p></div>
     </div> -->
     <!-- <div v-else class='names'>
       <span>123</span>
       <span>123</span>
     </div> -->
    <!-- <p v-if='b===1'><span>123</span></p>
    <div v-else-if='b===2' class='bbbb'><p>123</p></div>
    <div v-else class='bbbb'><p>123</p></div> -->
    <!-- <p v-if='b===2'><span>123</span></p>
    <div v-else class='bbbb'><p>123</p></div>

    <p v-if='b===3'><span>123</span></p> -->
    <!-- <div v-else class='cccc'><p>123</p></div> -->
    <!-- <div v-else>123</div>  -->
     <div class='vvv'>123</div> 
  </div>
  <!-- <div class='cvb' v-else>12345</div> -->
</template>

<script>
import { Dialog, Toast, Table, Tree } from 'i-mayfly';
import 'i-mayfly/lib/component/table/style/css';

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
@import "@/assets/components/css/main.less";
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
