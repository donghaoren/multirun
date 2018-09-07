import { ProcessManager } from "./utils";

// Main process manager
const manager = new ProcessManager();

/**
 * Launch a shell command, return a Promise
 * @param command a shell command to launch
 */
export function shell(command: string, name: string = null) {
    return manager.launchProcess(name, command);
}

/**
 * Run a command and return a Promise
 * @param command
 * string: shell command
 * Array<Command>: run the array of commands sequentially
 * { name: Command, ... }: run the dict of commands in parallel
 */
export function run(command: any, name: string = null): Promise<void> {
    if (typeof (command) == "string") {
        return shell(command, name);
    } else if (command instanceof Function) {
        return command();
    } else if (command instanceof Array) {
        return sequence(command);
    } else {
        return Promise.all(Object.keys(command).map(key => run(command[key], key))).then(() => { });
    }
}

/**
 * Run a list of commands sequentially
 * @param commands commands
 */
export async function sequence(commands: any[]) {
    for (let cmd of commands) {
        await run(cmd);
    }
}