#!/usr/bin/env node
import { Logger, ProcessManager } from "./utils";
import * as fs from "fs";

interface MultirunConfigFile {
    default?: string;
    configs: {
        name: string;
        commands: { [name: string]: string[] }
    }[];
}

let logger = new Logger();
let manager = new ProcessManager(logger);

if (process.argv[2] == "--npm") {
    for (let name of process.argv.slice(3)) {
        manager.launchProcess(name, "npm", ["run", name]);
    }
} else {
    let configFile = "multirun.json";
    if (process.argv[2]) {
        configFile = process.argv[2];
    }
    let config: MultirunConfigFile;
    try {
        config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    } catch (e) {
        logger.logMessage(`Cannot load config file '${configFile}'`);
        process.exit(-1);
    }
    if (config.configs.length > 0) {
        let defaultName = config.default || config.configs[0].name;
        let nameToRun = process.argv[3] || defaultName;
        let item = config.configs.filter(x => x.name == nameToRun)[0];
        if (!item) {
            logger.logMessage(`Config '${nameToRun}' is undefined`);
            process.exit(-1);
        }
        for (let command in item.commands) {
            if (item.commands.hasOwnProperty(command)) {
                let cmd = item.commands[command];
                manager.launchProcess(command, cmd[0], cmd.slice(1));
            }
        }
    } else {
        logger.logMessage("Nothing to run");
        process.exit(-1);
    }
}