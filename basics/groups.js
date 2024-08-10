
const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

const animals = [
  ['Lion', 'Panthera leo'],
  ['Elephant', 'Loxodonta africana'],
  ['Giraffe', 'Giraffa camelopardalis']
];

const car = {
  make: 'Tesla',
  model: 'Model S',
  year: 2023,
  color: 'Red'
};

const cars = [
  {
    make: 'Tesla',
    model: 'Model S',
    year: 2023,
    color: 'Red'
  },
  {
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Blue'
  },
  {
    make: 'Ford',
    model: 'Mustang',
    year: 2021,
    color: 'Black'
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    color: 'White'
  }
];

console.group('Car');
console.log(car);
console.groupEnd();

console.group('Fruits');
console.log(fruits);
console.groupEnd();

console.group('Animals');
console.log(animals);
console.groupEnd();


console.group('Cars');
console.log(car)
console.log(cars);
console.groupEnd();
