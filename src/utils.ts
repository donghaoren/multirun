import { spawn, ChildProcess } from "child_process";
import { Transform } from "stream";

// Color commands
const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const Dim = "\x1b[2m";
const Underscore = "\x1b[4m";
const Blink = "\x1b[5m";
const Reverse = "\x1b[7m";
const Hidden = "\x1b[8m";
const FgBlack = "\x1b[30m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan = "\x1b[36m";
const FgWhite = "\x1b[37m";

function color(str: string, name: string) {
    if (!process.stdout.isTTY) {
        return str;
    }
    switch (name) {
        case "success":
            return FgGreen + str + Reset;
        case "fail":
            return FgRed + str + Reset;
        case "message":
            return FgGreen + str + Reset;
        case "process":
            return FgBlue + str + Reset;
        case "command":
            return FgYellow + str + Reset;
    }
    return str;
}

export class PrefixTransform extends Transform {
    private prefix: Buffer;
    private _rest: Buffer;

    constructor(prefix: string) {
        super();
        this.prefix = Buffer.from(prefix, "utf-8");
    }
    processLine(line: Buffer) {
        return Buffer.concat([this.prefix, line]);
    }

    _transform(chunk: Buffer, encoding: string, callback: any) {
        if (this._rest && this._rest.length > 0) {
            this._rest = Buffer.concat([this._rest, chunk]);
        } else {
            this._rest = chunk;
        }

        let index;
        while (true) {
            index = this._rest.indexOf("\n");
            if (index >= 0) {
                let line = this._rest.slice(0, index + 1);
                index += 1;
                this._rest = this._rest.slice(index);
                this.push(this.processLine(line));
            } else {
                break;
            }
        }
        callback();
    }

    flush(callback: (buffer: Buffer) => void) {
        if (this._rest && this._rest.length > 0) {
            return callback(this.processLine(this._rest));
        }
    }
}

export class ProcessManager {
    private _processes: { [name: string]: { p: ChildProcess } };

    public logMessage(str: string, c?: string) {
        if (color) {
            console.log(color(str, c));
        } else {
            console.log(str);
        }
    }

    constructor() {
        this._processes = {};

        let kill_signal = "SIGHUP";
        if (process.platform == "win32") {
            // Windows doesn't support SIGHUP
            kill_signal = "SIGINT";
        }

        process.on('SIGHUP', () => {
            this.logMessage(color("SIGHUP received, broadcasting to processes.", "message"));
            for (let name in this._processes) {
                this._processes[name].p.kill(kill_signal);
            }
        });

        process.on('SIGTERM', () => {
            this.logMessage(color("SIGTERM received, broadcasting to processes.", "message"));
            for (let name in this._processes) {
                this._processes[name].p.kill(kill_signal);
            }
        });

        process.on('SIGINT', () => {
            this.logMessage(color("SIGINT received, broadcasting to processes.", "message"));
            for (let name in this._processes) {
                this._processes[name].p.kill(kill_signal);
            }
        });

        process.stdout.setMaxListeners(1000);
        process.stdin.setMaxListeners(1000);
    }

    public launchProcess(name: string, cmd: string, args: string[] = null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let p: ChildProcess;
            p = spawn(cmd, args || [], {
                shell: true,
                stdio: ['ignore', 'pipe', 'pipe']
            });
            if (name == null) {
                name = cmd.split(" ")[0] + "(" + p.pid + ")";
            }

            let prefixMain = color(name + " ", "process");
            let prefixStdout = color(name + " ", "process");
            let prefixStderr = color(name + " ", "fail");

            this.logMessage(prefixMain + color(cmd + (args != null ? " " + args.join(" ") : ""), "command"));

            let tr1 = new PrefixTransform(prefixStdout);
            let tr2 = new PrefixTransform(prefixStderr);
            p.stdout.pipe(tr1).pipe(process.stdout);
            p.stderr.pipe(tr2).pipe(process.stdout);

            p.on('error', (err) => {
                this.logMessage(prefixMain + 'Error: ' + err.toString());
            });
            p.on('exit', (code, signal) => {
                delete this._processes[name];
                if (code == 0) {
                    resolve();
                } else {
                    if (code != null && signal != null) {
                        this.logMessage(prefixMain + 'terminated with code ' + code + ' signal ' + signal);
                    } else if (code != null) {
                        this.logMessage(prefixMain + 'terminated with code ' + code);
                    } else if (signal != null) {
                        this.logMessage(prefixMain + 'terminated with signal ' + signal);
                    } else {
                        this.logMessage(prefixMain + 'terminated');
                    }
                    if (code != null) {
                        reject(new Error(prefixMain + 'terminated with code ' + code));
                    } else {
                        reject(new Error(prefixMain + 'terminated with signal ' + signal));
                    }
                }
            });
            this._processes[name] = { p: p };
        });
    }
}