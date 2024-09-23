// Implementing arrays in javascript

class MyArray {
    constructor() {
        this.length = 0
        this.data = {}
    }

    push(...elements) {
        // Loop through each element and add it to the array
        for (let i = 0; i < elements.length; i++) {
            this.data[this.length] = elements[i];
            this.length++;
        }

        return this; // Return the instance for chaining
    }

    // implement pop method
    pop() {
        // Return undefined when the array is empty
        if (this.length === 0) {
            return undefined;  
        }

        const lastElement = this.data[this.length-1] ?? null;
        delete this.data[this.length-1];
        this.length--
        return lastElement;
    }

    // remove the first element from the data;
    shift() {
        const firstElement = this.data[0];

        for(let index = 0; index < this.length; index++) {
            this.data[index] = this.data[index + 1]
        }

        delete this.data[this.length-1];
        this.length--
        return firstElement
    }

    // add at the start of the element
    unshift(...elements) {
      // Shift existing elements to the right
        for (let i = this.length - 1; i >= 0; i--) {
            this.data[i + elements.length] = this.data[i];
        }

        // Insert the new elements at the beginning in correct order
        for (let i = 0; i < elements.length; i++) {
            this.data[i] = elements[i];
        }

        // Update the length of the array
        this.length += elements.length;

        return this.length; // Return the new length of the array
    }

    // get the element from the key;
    at(index) {
        if(index < 0) {
            return this.data[this.length + index] ?? null
        } else {
            return this.data[index] ?? null
        }
    }

    // remove by index()
    deleteByIndex(index = 0) {
        if (index < 0 || index >= this.length) return null;
        const elementToDelete = this.data[index];

        for(let i = index; i < this.length - 1; i++) {
            this.data[i] = this.data[i + 1]
        }

        delete this.data[this.length-1];
        this.length--
        return elementToDelete;
    }

    // Implementing the map method
    map(callback) {
        const result = new MyArray(); // Create a new MyArray instance
    
        for (let i = 0; i < this.length; i++) {
            // Apply the callback to each element and store in the result
            result.push(callback(this.data[i], i, this));
        }
    
        return result; // Return the new MyArray instance with mapped values
    }

    filter(callback) {
        const result = new MyArray(); 
    
        for (let i = 0; i < this.length; i++) {
            if (callback(this.data[i], i, this)) {
                result.push(this.data[i]);
            }
        }
    
        return result; 
    }
    
    
}

// const array = new MyArray();
// array.push(1)
// array.push(2)
// array.push(3)
// array.push(4)
// array.push(5)
// // array.pop()
// array.shift()
// console.log(array)
// array.deleteByIndex(2)
// console.log(array)

// console.log(array.get(0))

// console.log(array.at(4))



// const mappedArray = array.map(el=> el * 2)
// console.log(mappedArray.filter(el=> el % 2 != 0))


// array.unshift(2,3,5,5)

// array.push("apple", "mango", "orange")

// console.log(array)

const arr = new MyArray();
arr.push(10, 20, 30);
console.log(arr.at(0));  // 10
console.log(arr.at(-1)); // 30

arr.unshift(1,2,3,4,5)
// console.log(arr)
// arr.shift(1)
console.log(arr)
arr.deleteByIndex(3)
console.log(arr)