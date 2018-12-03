class Compile{
  constructor (el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el: document.querySelector(el)
    
    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment)
    }
  }
  node2Fragment(el) {
    var fragment = document.createDocumentFragment()

    var child
    // // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }
  init() {
    this.compileElement(this.$fragment)
  }
  compileElement (el) {
    var childNodes = el.childNodes
    var compiler  = this;
    [].slice.call(childNodes).forEach(function(node) {
      console.log(node, 'dom')
      var text = node.textContent
      var reg = /\{\{(.*)\}\}/  //  表达式文本
      // 按元素节点方式编译
      if (compiler.isElementNode(node)) {
        compiler.compile(node)
      } else if (compiler.isTextNode(node) && reg.test(text)) {
        compiler.compileText(node, RegExp.$1)
      }
      // 编译遍历子节点
      if (node.childNodes && node.childNodes.length) {
        compiler.compileElement(node)
      }
    })
  }
  compile(node) {
    var nodeAttrs = node.attributes
    var compiler = this;
    [].slice.call(nodeAttrs).forEach(function (attr) {
      // 规定 : 指令以v-xxx
      var attrName = attr.name //
      if (compiler.isDirective(attrName)) {
        var exp = attr.value
        var dir = attrName.substring(2)
        console.log(attrName, 'arttt')
        if (compiler.isEventDirective(dir)) {
          // 事件指令  如v-on:click
          compileUtil.eventHandler(node, compiler.$vm, exp, dir)
        } else {
          // 普通指令
          compileUtil[dir] && compileUtil[dir](node, compiler.$vm, exp)
        }
        node.removeAttribute(attrName)
      }
    })
  }
  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp)
  }
  isDirective(attr) {
    return attr.indexOf('v-') === 0
  }
  isEventDirective (dir) {
    return dir.indexOf('on') === 0
  }
  isElementNode (node) {
    return node.nodeType == 1
  }
  isTextNode (node) {
    return node.nodeType == 3
  }
}

var compileUtil = {
  text: function(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  html: function (node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },
  model: function (node, vm, exp) {
    this.bind(node, vm,  exp, 'model')  // 订阅的
    var me = this
    var val = this._getVMVal(vm, exp)
    node.addEventListener('input', function (e) {
      var newValue = e.target.value
      if (val === newValue) {
        return
      }
      me._setVMVal(vm, exp, newValue)
      val = newValue
    })
  }, 
  class: function (node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },
  bind: function (node, vm, exp, dir) {
    var updaterFn = updater[dir + 'Updater']  // 更新对应dom的值
    console.log(dir, exp, '---')
    // 第一次初始化视图
    updaterFn && updaterFn(node, this._getVMVal(vm, exp)) // 可能是嵌套的结构, 所以用this._getVMVal(vm, exp)
    // 实例化订阅者, 此操作会在对应的属性信息订阅器中添加了改订阅watcher
    new Watcher(vm, exp, function(value, oldValue) {
      // 一旦属性值有变化, 会收到通知执行此更新函数,更新视图
       // 闭包引用了node
      updaterFn && updaterFn(node, value, oldValue)
    })
  },
  eventHandler: function (node, vm, exp, dir) {
    var eventType = dir.split(":")[1]
    var fn = vm.$options.methods && vm.$options.methods[exp]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  _getVMVal: function (vm, exp) {
    var val = vm
    exp = exp.split('.')
    exp.forEach(function(key) {
      val = val[key]
    })
    return val
  },
  _setVMVal: function (vm, exp, value) {
     var val = vm
     exp = exp.split('.')
     exp.forEach(function (key, i) {
       // 非最后一个key,更新val的值
       if (i < exp.length - 1) {
         val = val[key]
       } else {
         val[key] = value
       }
     })
  }
}

var updater = {
  textUpdater: function (node, value) {
    node.textContent = typeof value == 'undefined'? '': value
  },
  htmlUpdater: function (node, value) {
    node.inneerHTML = typeof value == 'undefined' ? '':value
  },
  classUpdater: function (node, value, oldValue) {
    var className = node.className
    className = className.replace(oldValue, '').replace(/\s$/,'')  // 替换空白字符
    var space = className && String(value) ? ' ': ''
    node.className = className + space + value
  },
  modelUpdater: function (node, value, oldValue) {
    node.value = typeof value == 'undefined'? '':value
  }
}