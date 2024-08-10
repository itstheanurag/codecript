/**
 * A DIVE INTO THE CONSOLE OBJECT IN JAVSCRIPT
 */


const FORMAT_SPECIFIERS = {
    DIGIT:'%d',
    INTEGER: '%i',
    FLOAT: '%f',
    STRING: '%s',
    CSS: '%c',
    OBJECT: '%o',
    OBJECT_WITH_DETAILS: '%O', // reverse %o in nodejs
    NEXT_LINE: '\n' // this everyone knows dumb of me to add but still...
}


console.log('%s is writing an article about the console', 'CodeCript');
//CodeCript is writing an article about the console

console.log('%d reads is all i need', 1000);
//1000 reads is all i need

console.log('but i am probably gonna get %i reads and %d likes', 10, 1);
//but i am probably gonna get 10 reads and 1 likes

// no type checing
console.log('%s is writing an article about the console', 12345);
//12345 is writing an article about the console

// colors aren't supported in node
console.log('%cDo you think its an useful article?', 'color:green')

const fruits = ['Apple', 'Banana', 'Cherry'];
console.log('fruits array is: %o', fruits);
console.log('fruits array is: %O', fruits);

console.error("SOME ERROR OCCURED") // its for errors
console.warn("SOME WARNING") // its for warning

const employee = {
    id: 1,
    team: 'engineering',
    name: 'CodeCript'
}

// console.log('employee details: %o', employee);
// console.log('employee details: %O', employee); 

console.table(employee) // creates a table
console.table(fruits)
console.assert(employee.id === 2, 'Employee is not the first');


// COUNT METHOD
function greet(user) {
    return `hi ${user}`;
}

let range = Math.floor(Math.random() * 100);
console.log(range)

for(let i = 1; i <= range; i++) {
    console.count('CALL GREET'); // going to count how many times its been called
    greet(employee.name)
}


// time
function timeGreet(user) {
    return `hi ${user}`;
}

let timeRange = Math.floor(Math.random() * 100);

console.time("Looping")
for(let i = 1; i <= timeRange; i++) {
    timeGreet(employee.name);
}
console.timeEnd("Looping")


// error method
try {
    someUndefinedFunction();
} catch (error) {
    console.error(error);
}

//debug : gives undefined in chrome
function calculateSum(a, b) {
    console.debug("Calculating sum:", { a, b });
    return a + b;
}

let sum = calculateSum(5, 10);
console.debug("Sum result:", sum);

// warn

let age = -5;
if (age < 0) {
    console.warn("Age cannot be negative:", age);
}

// doesn't output anything in node
console.info('30 Days Of JavaScript challenge is trending on Github')


const Employees = [
  employee,
  employee,
  employee
];

const formaters = [FORMAT_SPECIFIERS,FORMAT_SPECIFIERS,FORMAT_SPECIFIERS]


console.group('Fruits');
console.log(fruits);
console.groupEnd();

console.group('Employee');
console.log(Employees);
console.groupEnd();

console.group('Formatters');
console.log(formaters);
console.groupEnd();


console.group("Group 1");
console.log("Message in group 1");
console.group("Nested Group");
console.log("Message in nested group");
console.groupEnd();
console.groupEnd();



console.dir(console)


// console.trace("Trace example");

/**
 * Trace: Trace example
    at Object.<anonymous> (d:\codecript\basics\console.js:144:9)
    at Module._compile (node:internal/modules/cjs/loader:1376:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1435:10)
    at Module.load (node:internal/modules/cjs/loader:1207:32)
    at Module._load (node:internal/modules/cjs/loader:1023:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:135:12)
    at node:internal/main/run_main_module:28:49
 */


const person = {
    name: 'Alice',
    age: 30,
    address: {
        city: 'Wonderland',
        country: 'Fantasy'
    }
};
      
console.dir(person);
      


function foo() {
    console.trace('Trace in foo function');
}

function bar() {
    foo();
}

function baz() {
    bar();
}

baz();



console.log(Object.keys(console))