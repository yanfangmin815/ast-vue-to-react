<template>
  <div v-if='a===4' v-on:blur='clickTap' :property='a?abcdefg:2' >
     <div class='vvv'>123</div> 
     <input class='inputStyle' ref='setTextInputRef'/>
     <CustomTextInput ref='inputElement'/>
  </div>
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
<style scoped lang='stylus'>
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
