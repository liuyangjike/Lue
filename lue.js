/**
 * 构造函数
 * options为实例化时的选项
 * @class Lue
 */
class Lue {
  constructor (options) {
    const vm = this
    vm.$options = options
    let data = vm._data = vm.$options.data
    for (let key in  vm._data) {
      proxy(vm, '_data', key)
    }
    observer(vm._data)
    this.$compile = new Compile(options.el || document.body, this)
  }
}


/**
 * 将data每一项代理到实例上
 * @param {*} target
 * @param {*} sourceKey
 * @param {*} key
 */
function proxy (target, sourceKey, key) {
  Object.defineProperty(target, key, {
    configurable: true,
    get: function proxyGetter () {
      return target[sourceKey][key]
    },
    set: function proxySetter (newVal) {
      target[sourceKey][key] = newVal
    }
  })
}