const path = require('path')

// it gives you the basename of the provided directory
console.log("THIS IS PATH", path.basename('/d/codecript/path/index.js'))

// it gives you the prefix basename of the provided directory
console.log("THIS IS PATH", path.basename('/d/codecript/path/index.js', '.js'))

// dirname is for directory name
console.log("THIS IS PATH", path.dirname('/d/codecript/path/index.js'))

//this gives you current directory, not comming from path, its just usefull in projects
console.log("Present working director", __dirname)

// don't user _dirname with dirname
console.log("this is going to extract the current directory and you will have the path of only Parent Director")
console.log(path.dirname(__dirname))

//useful for joining paths in the current directory
console.log(path.join(__dirname, '/i18n/'));

// path.extname is for getting the extension name of the file
console.log(path.extname('/d/codecript/path/index.js'))
