// const Promise = require("./index.js");

let promise = new Promise((resolve, reject) => {
  console.log("立即执行");
  setTimeout(() => {
    resolve("hello");
    // reject或者抛出错误，会将Promise置为失败状态
    // throw new Error("lalala");
    // reject("world");
    console.log("resolve&reject之后的代码也会执行");
  }, 1000);
});
console.log("同步代码");
// 多次调用then方法，会按照调用顺序依次执行
promise.then(
  (data) => {
    console.log("then1 success", data);
  },
  (err) => {
    console.log("then1 error", err);
  }
);
promise.then(
  (data) => {
    console.log("then2 success", data);
  },
  (err) => {
    console.log("then2 error", err);
  }
);
