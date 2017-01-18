import { spawn, ChildProcess } from "child_process";

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

    public color(string: string, style: string) {
        return style.replace("_", string);
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

        process.on('SIGHUP', () => {
            this._logger.logMessage("SIGHUP received, broadcasting to processes.");
            for(let name in this._processes) {
                this._processes[name].p.kill("SIGHUP");
            }
        });

        process.on('SIGTERM', () => {
            this._logger.logMessage("SIGTERM received, broadcasting to processes.");
            for(let name in this._processes) {
                this._processes[name].p.kill("SIGHUP");
            }
        });

        process.on('SIGINT', () => {
            this._logger.logMessage("SIGINT received, broadcasting to processes.");
            for(let name in this._processes) {
                this._processes[name].p.kill("SIGHUP");
            }
        });
    }

    public launchProcess(name: string, cmd: string, args: string[]) {
        let p = spawn(cmd, args);
        let prefix = this._logger.color('(' + name + ')', StyleGreen) + ": ";
        let prefixRed = this._logger.color('(' + name + ')', StyleRed) + ": ";
        p.on('error', (err) => {
            this._logger.logMessage(prefixRed + 'Error: ' + err.toString());
        });
        p.on('close', (code, signal) => {
            this._logger.logMessage(prefix + 'terminated with code ' + code + ' signal ' + signal);
            delete this._processes[name];
        });
        let print_stdout = new BufferedPrintLine(this._logger, prefix);
        let print_stderr = new BufferedPrintLine(this._logger, prefixRed);
        p.stderr.on('data', (chunk: Buffer) => {
            print_stderr.feed(chunk);
        });
        p.stdout.on('data', (chunk: Buffer) => {
            print_stdout.feed(chunk);
        });
        p.stderr.resume();
        p.stdout.resume();
        p.stdin.end();
        this._processes[name] = { p: p };
    }
}