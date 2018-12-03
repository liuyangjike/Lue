## Vue数据响应实现

### 前言
> 大家对`Vue`的数据响应已经着迷已久了吧, 下面项目实现

```html
<div id="app">
  <input type="text" v-model="test.a">
  <div>{{test.a}}</div>
  <div>list: {{list}}</div>
  <div v-class="className" class="init">Hello Class</div>
  <button v-on:click="changeClass">Button</button>
</div>
<script>
  var lue = new Lue ({
    el: '#app',
    data: {
      className: 'active',
      list: [1, 2, 3],
      test: {
        a: 1
      }
    },
    methods: {
      changeClass() {
        this.className = 'big-font'
      }
    }
  })
</script>
```

### 效果图

![](./image/1.gif)