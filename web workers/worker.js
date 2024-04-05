const {workerData, parentPort} = require('worker_threads');

async function loopTillNumber(number) {
    console.log(number)
    let res = 0;

    for(let i = 0; i < number; i++) {
        res = i;
    }

    return res;
}

function startProcessing() {
    console.log(workerData);
    console.log("Starting the process...");

    loopTillNumber(workerData.limit)
        .then(result => {
            console.log("Process finished with result", result);
            parentPort.postMessage(result);
        })
        .catch(error => {
            console.error("An error occurred:", error);
        });
}

startProcessing();