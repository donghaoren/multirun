#!/usr/bin/env node
import { Logger, ProcessManager } from "./utils";

let logger = new Logger();
let manager = new ProcessManager(logger);
for(let name of process.argv.slice(2)) {
    manager.launchProcess(name, "npm", [ "run", name ]);
}