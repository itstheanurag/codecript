---
title: Functions
order: 6
---

Most programming languages use functions in one way or another, but the way JavaScript utilizes them is straight-up crazy. In JavaScript, functions are more than just simple blocks of code—they are **First-Class Citizens** and instances of **Objects**.

Imagine you have a specific recipe for a cake. Instead of writing down every single step every time someone asks for a cake, you just give them the recipe name. In programming, a **Function** is that recipe—a reusable block of code designed to perform a particular task.

## 1. Declaring a Function

Defining a function is like writing the recipe. You use the `function` keyword, give it a name, and define what it does inside curly braces.

```javascript
function sum(num1, num2) {
  return num1 + num2;
}
```

- **`function` keyword**: Tells JavaScript you are creating a function.
- **Name**: `sum` is the identifier you'll use to run this code later.
- **Parentheses `()`**: This is where you can define inputs (**parameters**).
- **Curly Braces `{}`**: The "body" of the function where your actual code lives.

---

## 2. How to Invoke (Call) a Function

Declaring a function doesn't run the code. To actually execute the logic, you must **Invoke** it by using its name followed by parentheses.

```javascript
sum(2, 4); // This "calls" the function and runs the logic
```

Without the `()`, you are just referring to the function itself as an object, rather than running it.

---

## 3. Parameters vs. Arguments

- **Parameters**: The placeholders inside the function's parentheses. Think of them as variables that only exist inside the function.
- **Arguments**: The actual values you pass into the function when you call it.

```javascript
// 'name' is the PARAMETER (the placeholder)
function greet(name) {
  console.log(`Hello, ${name}!`);
}

// "Alice" is the ARGUMENT (the actual value)
greet("Alice");
```

---

## 4. Advanced Parameters and Arguments

While you pass arguments in one way, you have many ways to handle them inside the function.

### I. Default Parameters

Used if the user does not provide an argument.

```javascript
function sum2(num1 = 0, num2 = 0) {
  return num1 + num2;
}

console.log(sum2(1)); // 1 (num2 defaults to 0)
```

### II. Rest Parameters (`...args`)

Spreads the parameters into a single array.

```javascript
function withArgs(...args) {
  return args.reduce((total, num) => total + num, 0);
}

console.log(withArgs(1, 2, 3, 4)); // 10
```

### III. The `arguments` Object

In non-arrow functions, you can access passed arguments even if you don't define parameters.

```javascript
function withoutParameters() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}
```

### IV. Destructuring Parameters

Unpack Objects or Arrays directly in the parameter list.

```javascript
function displayUser({ name, age }) {
  return `Name: ${name}, Age: ${age}`;
}

const user = { name: "Alice", age: 30 };
console.log(displayUser(user)); // "Name: Alice, Age: 30"
```

> [!NOTE]
> **Learning Path**: We'll dive deep into **[Objects](./007-objects)** and **[Arrays](./008-arrays)** in the next sections. If destructuring looks confusing now, don't worry—it's covered in detail there!

## 5. Arrow Functions (ES6)

Introduced in ES6, **Arrow Functions** provide a more concise syntax for writing function expressions. They are particularly popular for short, one-off functions or callbacks.

```javascript
// Traditional Function Expression
const add = function (a, b) {
  return a + b;
};

// Arrow Function
const addArrow = (a, b) => a + b;
```

### I. Syntax Variations

Arrow functions can be extremely concise depending on the number of parameters and the complexity of the body:

- **Single Parameter**: Parentheses are optional.
  ```javascript
  const square = (x) => x * x;
  ```
- **No Parameters**: Empty parentheses are required.
  ```javascript
  const sayHi = () => console.log("Hi!");
  ```
- **Multiple Parameters**: Parentheses are required.
  ```javascript
  const sum = (a, b, c) => a + b + c;
  ```

### II. Implicit vs. Explicit Return

- **Implicit Return**: If the function body is a single expression, you can omit the curly braces `{}` and the `return` keyword. The expression is returned automatically.
- **Explicit Return**: If you use curly braces, you **must** use the `return` keyword to return a value.

```javascript
// Implicit
const double = (n) => n * 2;

// Explicit (Required if multiple lines)
const greet = (name) => {
  const message = `Hello, ${name}!`;
  return message;
};
```

### III. Lexical `this` Binding

One of the most significant differences is how arrow functions handle the `this` keyword. Traditional functions have their own `this` binding, but arrow functions **inherit** `this` from their surrounding (lexical) scope.

This makes them ideal for methods inside objects where you want to maintain access to the object's properties within a callback (like a `setTimeout` or a `map`).

### IV. Key Limitations

Arrow functions are powerful but cannot replace traditional functions in all scenarios:

- **No `arguments` object**: They do not have their own `arguments` list.
- **Not for Constructors**: They cannot be used with the `new` keyword.
- **No `prototype`**: They do not have a `prototype` property.

---

## 6. IIFE (Immediately Invoked Function Expression)

A function that runs as soon as it is declared. It creates its own private scope.

```javascript
(function () {
  const message = "Hello, world!";
  console.log(message);
})();
```

---

## 7. First-Class Citizens

Functions in JavaScript are "First-Class Citizens," meaning:

1. **Stored as Variables**: `const sum = function(a, b) { ... }`
2. **Passed as Arguments**: Used as callbacks in other functions.
3. **Returned from Functions**: A function can return another function.
4. **Stored in Data Structures**: Can be values inside objects or arrays.

---

## 8. Functions are Objects

In JavaScript, functions are actually instances of `Object`.

```javascript
function asObjects() {}
console.log(asObjects instanceof Object); // true

// You can even add properties or methods to them!
asObjects.description = "I am a function acting as an object";
```

> [!TIP]
> Since functions are objects, they share many of the same traits we'll explore in the **[Objects section](./007-objects)**.

### Constructor Functions

Before modern Classes, functions were used to create objects and handle OOP via **Prototypes**.

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function () {
  console.log(`Hello, my name is ${this.name}`);
};

const alice = new Person("Alice", 30);
```

---

## 9. Higher-Order Functions

A function that takes a function as an argument or returns one. Common examples include Array methods:

```javascript
const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2); // map is a Higher-Order Function
```

---

> [!TIP]
> This guide is inspired by the article: **[Functions are crazy in JavaScript](https://medium.com/@itstheanurag/functions-are-crazy-in-javascript-4978d4d6105b)**. Check it out for more deep dives into JS behavior!
