const PENDING = "pending"; // 等待（默认）
const FULFILLED = "fulfilled"; // 成功
const REJECTED = "rejected"; // 失败

class MyPromise {
  // new MyPromise((resolve, reject) => {})
  constructor(executor) {
    // 默认是等待状态
    this.status = PENDING;
    // 成功的值
    this.value = undefined;
    // 成功的回调
    this.onResolvedCallbacks = [];
    // 成功
    const resolve = (value) => {
      // 状态改变之后，就不能再改变了
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        // 执行对应的成功回调
        this.onResolvedCallbacks.forEach((cb) => cb());
      }
    };
    // 失败的原因
    this.reason = undefined;
    // 失败的回调
    this.onRejectedCallbacks = [];
    // 失败
    const reject = (reason) => {
      // 状态改变之后，就不能再改变了
      if (this.status === PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        // 执行对应的失败回调
        this.onRejectedCallbacks.forEach((cb) => cb());
      }
    };
    try {
      // executor执行器会立刻执行
      executor(resolve, reject);
    } catch (error) {
      // executor执行器内部报错，则reject
      reject(error);
    }
  }
  // 多次调用then方法，会按照调用顺序执行多次
  // 每次执行完then，都会返回一个新的Promise，通过调用新Promise的resolve或reject传值
  // then返回普通值，将这个值作为下一个then成功的值
  // then返回Promise，会执行这个Promise，并采用它执行后的状态，执行下一个then的成功或失败回调
  // then链式调用中，通过返回一个Pending状态的Promise，可以终止下面的then的执行
  // then链式调用中，中间的then失败了，也会继续执行后面的then
  then(onFulFilled, onRejected) {
    // onFulFilled和onRejected是可选参数
    onFulFilled =
      typeof onFulFilled === "function" ? onFulFilled : (data) => data;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };
    const promise2 = new MyPromise((resolve, reject) => {
      // 代码放到新的Promise的执行器里，因为这里的代码会立即执行，而且能拿到新Promise的resolve和reject
      if (this.status === FULFILLED) {
        queueMicrotask(() => {
          try {
            // x可能是普通值或Promise，或则执行onFulFilled直接报错
            let x = onFulFilled(this.value);
            // 判断x的值类型，但是此时拿不到promise2，需要异步
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      if (this.status === REJECTED) {
        queueMicrotask(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      // 如果Promise中的代码是异步的，需要先订阅对应的then回调
      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              let x = onFulFilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
    return promise2;
  }
  catch() {}
  // data为普通值，直接成功
  // data为Promise，等待其完成后再成功
  static resolve(data) {
    return new MyPromise((resolve) => {
      if (data instanceof MyPromise) {
        data.then(resolve);
      }
      // then返回普通值，将这个值作为下一个then成功的值
      else {
        resolve(data);
      }
    });
  }
  // 返回一个Promise，等待promises都成功后状态才变为成功
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const result = [];
      let count = 0;
      function processData(key, value) {
        result[key] = value;
        count++;
        // 每一项都执行完了才resolve
        if (count === promises.length) {
          resolve(result);
        }
      }
      for (let i = 0; i < promises.length; i++) {
        const current = promises[i];
        if (current instanceof MyPromise) {
          // 其中一个Promise失败了，整个Promise就失败了
          current.then((data) => {
            processData(i, data);
          }, reject);
        } else {
          // 普通项直接返回
          processData(i, current);
        }
      }
    });
  }
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const current = promises[i];
        // 利用了Promise状态一旦改变,就不会再变的特性
        if (current instanceof MyPromise) {
          // 其中一个Promise成功了整个就成功
          current.then(resolve, reject);
        } else {
          // 普通项直接成功
          resolve(current);
        }
      }
    });
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // then返回了自己会报错
  if (x === promise2) {
    return reject(TypeError("chain circle"));
  }
  // then返回Promise，并采用它执行后的状态，执行下一个then的成功或失败回调
  if (x instanceof MyPromise) {
    x.then(resolve, reject);
  }
  // then返回普通值，将这个值作为下一个then成功的值
  else {
    resolve(x);
  }
}

module.exports = MyPromise;
