var cluster = require('cluster');
var express = require('express');
var usage = require('usage');
const yargs = require('yargs');

/* Take process count through command line argumanet */
const options = yargs
    .usage("Usage: -n <no of processes>")
    .option("n", { alias: "no of processes", describe: "Process Count", type: "number", demandOption: true })
    .argv;

if (cluster.isMaster) {
    /* Create n workers */
    for (let i = 0; i < options.n; i++) {
        cluster.fork();
    }
} else {
    /* Create an express server */
    const app = express();

    app.listen(8080);
}

/* print memory and cpu info for each process ids */
cluster.on('online', function (worker) {
    const pid = process.pid // you can use any valid PID instead
    usage.lookup(pid, function (err, result) {
        console.log(`Stats for process id ${worker.process.pid}:`, result);
        /* To kill process at regularly */
        setInterval(() => worker.process.kill(), 10000);
    })
});

/* Create a new worker if one of them dies */
cluster.on('exit', function (worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    cluster.fork();
});
