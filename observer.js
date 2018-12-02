
function observer (value) {
  // 如果不是对象的话直接return
  if (!value || typeof value !== 'object') return
  return new Observer(value)
}

class Observer {
  constructor (value) {
    this.walk(value)
  }
  walk (obj) {
    Object.keys(obj).forEach((key)=> {
      // 如果是对象,则递归调用walk,保证每个属性都可以被defiineReactive
      if (typeof obj[key] === 'object') {
        this.walk(obj[key])
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
        console.log(obj)
        console.log(key)
        debugger
        dep.depend(Dep.target)
      }
      console.log(dep, 'dep')
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
  addSub (sub) {
    console.log(sub)
    this.subs.push(sub)
  }
  // 通知
  notify () {
    this.subs.forEach( sub => {
      sub.update()
    })
  }
}

Dep.target = null