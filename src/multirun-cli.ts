#!/usr/bin/env node
import { ProcessManager } from "./utils";
import * as fs from "fs";

interface MultirunConfigFile {
    default?: string;
    configs: {
        name: string;
        commands: { [name: string]: string[] }
    }[];
}

let manager = new ProcessManager();

if (process.argv[2] == "--npm") {
    for (let name of process.argv.slice(3)) {
        if (process.platform == "win32") {
            manager.launchProcess(name, "npm.cmd", ["run", name]);
        } else {
            manager.launchProcess(name, "npm", ["run", name]);
        }
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
        manager.logMessage(`Cannot load config file '${configFile}'`);
        process.exit(-1);
    }
    if (config.configs.length > 0) {
        let defaultName = config.default || config.configs[0].name;
        let nameToRun = process.argv[3] || defaultName;
        let item = config.configs.filter(x => x.name == nameToRun)[0];
        if (!item) {
            manager.logMessage(`Config '${nameToRun}' is undefined`);
            process.exit(-1);
        }
        for (let command in item.commands) {
            if (item.commands.hasOwnProperty(command)) {
                let cmd = item.commands[command];
                manager.launchProcess(command, cmd[0], cmd.slice(1));
            }
        }
    } else {
        manager.logMessage("Nothing to run");
        process.exit(-1);
    }
}