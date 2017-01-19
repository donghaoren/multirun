#!/usr/bin/env node
import { Logger, ProcessManager } from "./utils";

let isWin = /^win/.test(process.platform);
let logger = new Logger();
let manager = new ProcessManager(logger);
for(let name of process.argv.slice(2)) {
    if(isWin) {
        manager.launchProcess(name, "npm.cmd", [ "run", name ]);
    } else {
        manager.launchProcess(name, "npm", [ "run", name ]);
    }
}