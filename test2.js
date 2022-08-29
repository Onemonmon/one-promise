const Promise = require("./index.js");

let promise = new Promise((resolve, reject) => {
  console.log("立即执行");
  setTimeout(() => {
    resolve("hello");
  }, 1000);
  // resolve("hello");
});
console.log("同步代码");
// 每次执行完then，都会返回一个新的Promise
// then的返回值为普通值，将这个值作为下一个then成功的值
// then的返回值为Promise，会自动执行这个Promise，并采用它执行后的状态，执行下一个then的成功或失败回调
// then链式调用中，通过返回一个Pending状态的Promise，可以终止下面的then的执行
// then链式调用中，中间的then失败了，也会继续执行后面的then
promise
  .then(
    (data) => {
      console.log("then1 success, value is", data);
      console.log("then1 返回一个普通值");
      return "world";
    },
    (err) => {
      console.log("then1 error", err);
    }
  )
  .then(
    (data) => {
      console.log("then2 success, value is", data);
      console.log("then2 返回一个普通值");
      return new Promise((resolve, reject) => {
        console.log("返回Promise");
        setTimeout(() => {
          // resolve("返回Resolved Promise");
          reject("返回Rejected Promise");
        }, 1000);
      });
    },
    (err) => {
      console.log("then2 error", err);
    }
  )
  .then(
    (data) => {
      console.log("then3 success, value is", data);
      console.log("then3 返回一个Pending Promise");
      return new Promise(() => {});
    },
    (err) => {
      console.log("then3 error", err);
      // throw new Error("onRejected");
      return "onRejected";
    }
  )
  .then(
    (data) => {
      console.log("then last success", data);
    },
    (err) => {
      console.log("then last error", err);
    }
  );
