const fs = require('fs');

const data = `this is the data that needs to be created`
const filePath = `${__dirname}/${Date.now()}-sample.txt`;
fs.writeFileSync(filePath, data, 'base64');
console.log("fileCreated");

fs.readFile(filePath, 'base64', (err, data) => {
    if(err) {
        return Error("Something went worng")
    } else {
       console.log(data)
    }
});



fs.unlinkSync(filePath)

