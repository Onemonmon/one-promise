const Promise = require("./index.js");

let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("hello");
  }, 1000);
});
let promise2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("world");
  }, 3000);
});

// Promise.all([promise1, promise2, 3, 5]).then(
//   (data) => {
//     console.log(data);
//   },
//   (error) => {
//     console.log(error);
//   }
// );

Promise.race([promise1, promise2]).then(
  (data) => {
    console.log(data);
  },
  (error) => {
    console.log(error);
  }
);

// Promise.resolve(promise1).then((data) => {
//   console.log("data", data);
// });
// Promise.resolve(1).then((data) => {
//   console.log("data", data);
// });
