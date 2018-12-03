
function observer (value) {
  // 如果不是对象的话直接return
  if (!value || typeof value !== 'object') return
  return new Observer(value)
}

class Observer {
  constructor (value) {
    this.walk(value)  // 转化成访问属性
  }
  walk (obj) {
    Object.keys(obj).forEach((key)=> {
      // 如果是对象,则递归调用walk,保证每个属性都可以被defiineReactive
      if (typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          protoAugment(obj[key], arrayMethods)  // 通过protoAugment重写每个数组对象的原型方法(pop等)
        } else {
          this.walk(obj[key])
        }
      }
      defineReactive(obj, key)
    })
  }
}

let defineReactive = (obj, key) => {
  var dep = new Dep()
  var value = obj[key]
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: false,
    get () {
      // 由于需要闭包添加watcher, 所以通过Dep定义一个全局target属性,  暂存watcher, 添加完移除
      if (Dep.target) {
        dep.depend(Dep.target)
      }
      if (Array.isArray(value)) { // 让数组的变异方法pop等, 能取到它的订阅器
        Object.defineProperty(value, '__ob__', {
          value: dep,
          enumerable: false,
          writable: true,
          configurable: true
        })
      }
      return value // 这里闭包value变量, 能保存它不被销毁
    },
    set (newVal) {
      if (newVal === value) return
      value = newVal  //  改变value
      observer(value)
      dep.notify()
    }
  })
}


var uid = 0

class Dep {
  constructor () {
    // 观察者存放的地方
    this.subs = []
    this.id = uid++
  }
  depend() {
    Dep.target.addDep(this)  // 在 addDep 内部并不是直接调用 dep.addSub 收集观察者,避免重复搜集
  }
  // 收集观察者
  addSub (sub) {
    this.subs.push(sub)
  }
  // 通知更新
  notify () {
    this.subs.forEach( sub => {
      sub.update()
    })
  }
}

// 代理数组原型上的pop, push等方法达到拦截的作用
function protoAugment (target, src) {
  target.__proto__ = src
}

Dep.target = null  // 全局变量来暂存  当前的观察者