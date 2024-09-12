/**
 * ABOUT SFunctions
 */


// here a function is treated as a variable
const sum = function(a, b) {
    return a + b;
}

console.log(sum(4, 6));


function doSomething(fn, num) {
    return fn() + num;
}

console.log(doSomething(()=> sum(2,5),10)) // 17
console.log(doSomething(function(){return 3 * 10}, 5)) // 35

// console.log(doSomething(sum(3, 4), 5)) // not valid
console.log(typeof sum);


function asValue() {
    return function(a, b) {
        return a + b;
    }
}

console.log(asValue()) // [Function (anonymous)]

const value = asValue();
console.log(value(2,4));


const operations = {
    add: function(a, b) { return a + b; },
    multiply: function(a, b) { return a * b; }
  };
  
console.log(operations.add(2, 3)); // 5
console.log(operations.multiply(2, 3)); // 6


function asObjects() {}
  

  
console.log("Function has a name property:", asObjects.name); 

console.log(asObjects instanceof Object) // true
console.log(Object.keys(asObjects)) // []

// Adding a property to the function
asObjects.description = "This is a function acting as an object";
console.log(asObjects.description); // "This is a function acting as an object"

asObjects.logger = function() {
    console.log(`the name is coming from the method`,asObjects.name)
}
asObjects.logger();

//constructor funcitons

function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.sayHello = function() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
};
  
const alice = new Person('Alice', 30);
const bob = new Person('Bob', 25);
  
console.log(alice.name); // Alice
console.log(bob.age);   // 25
  
alice.sayHello(); // Hello, my name is Alice and I am 30 years old.
bob.sayHello();   // Hello, my name is Bob and I am 25 years old.


function logger(fn) {
    return function(...args) {
      console.log('Arguments:', args);
      const result = fn(...args);
      console.log('Result:', result);
      return result;
    };
  }
  
  const add = (a, b) => a + b;
  const loggedAdd = logger(add);
  
  loggedAdd(2, 3);

const nums = [1,2,3,4,5,6,7,8,9]

const sumOfNums = nums.reduce((total, currentValue) => {
    return total + currentValue;
}, 0);

const duplicatedArray = nums.map((el, index) => el + index);
const evenNums = nums.filter(el => (el & 1) === 0)
console.log("SUM OF NUMS ARRAY:",sumOfNums); // SUM OF NUMS ARRAY: 45
console.log(duplicatedArray) // [1,  3,  5,  7, 9, 11, 13, 15, 17]
console.log(evenNums) // [ 2, 4, 6, 8 ]



function displayUser({ name, age }) {
    return `Name: ${name}, Age: ${age}`;
}

const user = { name: 'Alice', age: 30 };
console.log(displayUser(user)); // Outputs: Name: Alice, Age: 30


function sumOfArray([a, b]) {
    return a + b;
}

console.log(sumOfArray([1, 2])); // Outputs: 3

function sum2(num1 = 0, num2 = 0) {
    return num1 + num2;
}

console.log(sum2(1)) // 1


function withoutParameters() {
    let total = 0
    console.log(arguments) // [Arguments] { '0': 1, '1': 2, '2': 3, '3': 4, '4': 5, '5': 6 }
    for(let i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }

    return total
}

console.log(withoutParameters(1,2,3,4,5,6)) // 21


function withArgs(...args) {
    console.log(args)
    return args.reduce((total, num) => total + num, 0);
}

console.log(withArgs(1, 2, 3, 4)); // 10

function withRest(a,b,...c) {
    console.log(c)
    return a + b + c.reduce((total, num) => total + num, 0);
}

console.log(withRest(1, 2, 3, 4)); // 10


const shortHandSum = () => {
    console.log(arguments) // this is not there
}

shortHandSum(1,2,3,4,5,6);


(function() {
    const message = 'Hello, world!';
    console.log(message); // Hello, world!
})();