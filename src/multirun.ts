// The multirun module

import { ProcessManager } from "./utils";

let manager = new ProcessManager();

export function shell(command: string) {
    return manager.launchProcess(null, command);
}

// Command:
// string: single shell command
// () => Promise<void>: custom command
// array of command: run them in parallel
export function run(command: any): Promise<void> {
    if (typeof (command) == "string") {
        return shell(command);
    } else if (command instanceof Array) {
        return Promise.all(command.map(run)).then(() => { });
    } else {
        return command();
    }
}

export async function sequence(commands: any[]) {
    for (let cmd of commands) {
        await run(cmd);
    }
}

export async function runCommands(commands: { [name: string]: any }, sequence: string[], prefix: string = "multirun") {
    try {
        for (let name of sequence) {
            manager.logMessage(prefix + ": " + name, "message");
            await run(commands[name]);
        }
    } catch (e) {
        manager.logMessage(prefix + ": Error: " + e.message, "fail");
        return;
    }
    manager.logMessage(prefix + ": Success.", "message");
}