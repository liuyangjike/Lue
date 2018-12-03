
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

// 将变异的数组方法加工一下


methodsToPatch.forEach(function (method) {
  const original = arrayProto[method]
  var mutator = function (...args){
    const result = original.apply(this, args)
    const ob = this.__ob__
    ob.notify()
    return result
  }
  Object.defineProperty(arrayMethods, method, {
    value: mutator,
    enumerable: false,
    writable: true,
    configurable: true
  })

})


