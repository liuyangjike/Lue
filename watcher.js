

// var observerExp = []
var uid = 0
class Watcher {
  constructor (vm, expression, cb) {
    this.vm = vm
    this.cb = cb
    this.id = uid++
    this.expression = expression
    this.depIds = new Set()  // 类似数组
    this.test = []
    // 此处为了触发属性的getter, 从而在dep上添加自己, 结合Observer
    this.getter = this.parseGetter(expression)
    console.log(this)
    this.value = this.get()
  }
  get () {
    Dep.target = this
    var value = this.getter.call(this.vm, this.vm)  // 这里会触发属性的getter,从而添加订阅者
    Dep.target = null
    return value
  }

  addDep(dep) {
    //2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
    // 则不需要将当前watcher添加到该属性的dep里
    var id = dep.id
    if (!this.depIds.has(id)) {  // 
      dep.addSub(this)
      this.depIds.add(id)
      this.test.push(id)
    }
  }

  run () {
    var value = this.get()  // 取到最新值
    var oldVal = this.value  // 旧的值
    if (value !== oldVal) {
      this.value = value
      this.cb.call(this.vm, value, oldVal)  // 执行Compile中绑定的回调, 更新视图
    }
  }

  update () {
    this.run()
  }

  // 解析深度嵌套数据, 得到值
  parseGetter (expression) {
    if (/[^\w.$]/.test(expression)) return
    var expressions = expression.split('.')
    return function (obj) {
      for (var i = 0; i < expressions.length; i++ ) {
        if (!obj) return
        obj = obj[expressions[i]]
      }
      return obj
    }
  }
}
