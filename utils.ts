import { spawn, ChildProcess } from "child_process";
import * as tty from "tty";

let Reset = "\x1b[0m";
let Bright = "\x1b[1m";
let Dim = "\x1b[2m";
let Underscore = "\x1b[4m";
let Blink = "\x1b[5m";
let Reverse = "\x1b[7m";
let Hidden = "\x1b[8m";

let FgBlack = "\x1b[30m";
let FgRed = "\x1b[31m";
let FgGreen = "\x1b[32m";
let FgYellow = "\x1b[33m";
let FgBlue = "\x1b[34m";
let FgMagenta = "\x1b[35m";
let FgCyan = "\x1b[36m";
let FgWhite = "\x1b[37m";

let StyleGreen = FgGreen + "_" + Reset;
let StyleRed = FgRed + "_" + Reset;

export class Logger {
    public logMessage(message: string) {
        process.stdout.write(message + "\n");
    }
    public colorStdout(string: string) {
        return FgGreen + string + Reset;
    }
    public colorStderr(string: string) {
        return FgYellow + string + Reset;
    }
    public colorMain(string: string) {
        return FgMagenta + string + Reset;
    }
}

export class BufferedPrintLine {
    private _buffer: Buffer;
    private _prefix: string;
    private _logger: Logger;

    constructor(logger: Logger, prefix: string = "") {
        this._buffer = new Buffer(0);
        this._prefix = prefix;
        this._logger = logger;
    }

    public feed(chunk: Buffer) {
        while(chunk.length > 0) {
            let i;
            for(i = 0; i < chunk.length; i++) {
                if(chunk[i] == 0x0A) break;
            }
            if(i == chunk.length) {
                this._buffer = Buffer.concat([this._buffer, chunk]);
                break;
            } else {
                let line = Buffer.concat([this._buffer, chunk.slice(0, i)]).toString("utf8");
                if(line.trim().length >= 0) {
                    this._logger.logMessage(this._prefix + line);
                }
                chunk = chunk.slice(i + 1);
                this._buffer = new Buffer(0);
            }
        }
    }
};

export class ProcessManager {
    private _processes: { [ name: string ] : { p: ChildProcess } };
    private _logger: Logger;

    constructor(logger: Logger) {
        this._processes = {};
        this._logger = logger;

        let kill_signal = "SIGHUP";
        if(process.platform == "win32") {
            // Windows doesn't support SIGHUP
            kill_signal = "SIGINT";
        }

        process.on('SIGHUP', () => {
            this._logger.logMessage(this._logger.colorMain("SIGHUP received, broadcasting to processes."));
            for(let name in this._processes) {
                this._processes[name].p.kill("SIGHUP");
            }
        });

        process.on('SIGTERM', () => {
            this._logger.logMessage(this._logger.colorMain("SIGTERM received, broadcasting to processes."));
            for(let name in this._processes) {
                this._processes[name].p.kill("SIGHUP");
            }
        });

        process.on('SIGINT', () => {
            this._logger.logMessage(this._logger.colorMain("SIGINT received, broadcasting to processes."));
            for(let name in this._processes) {
                this._processes[name].p.kill("SIGHUP");
            }
        });
    }

    public launchProcess(name: string, cmd: string, args: string[]) {
        let p = spawn(cmd, args, {
            stdio: [ 'ignore', 'pipe', 'pipe' ]
        });
        let prefixMain = this._logger.colorMain('(' + name + ') ');
        let prefixStdout = this._logger.colorStdout('(' + name + ') ');
        let prefixStderr = this._logger.colorStderr('(' + name + ') ');
        p.on('error', (err) => {
            this._logger.logMessage(prefixMain + 'Error: ' + err.toString());
        });
        p.on('close', (code, signal) => {
            this._logger.logMessage(prefixMain + 'terminated with code ' + code + ' signal ' + signal);
            delete this._processes[name];
        });
        let print_stdout = new BufferedPrintLine(this._logger, prefixStdout);
        let print_stderr = new BufferedPrintLine(this._logger, prefixStderr);
        p.stderr.on('data', (chunk: Buffer) => {
            print_stderr.feed(chunk);
        });
        p.stdout.on('data', (chunk: Buffer) => {
            print_stdout.feed(chunk);
        });
        p.stderr.resume();
        p.stdout.resume();
        this._processes[name] = { p: p };
    }
}