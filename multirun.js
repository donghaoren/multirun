#!/usr/bin/env node
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');

/* Usage:
 *  multirun config arguments
 */

// Escape a command-line argument for shell.
var escapeshell = function(cmd) {
    return '"' + cmd.replace(/(["'$`\\])/g,'\\$1') + '"';
};

// Prefix a string to each line of the input string.
var prefix_string = function(prefix, str) {
    return prefix + str.replace(/[\r\n]/g, "\n").replace(/[\n]/g, "\n" + prefix);
};

var error_and_exit = function(message) {
    process.stderr.write('multirun: ' + message + '\n');
    process.exit(-1);
}

var log_message = function(message) {
    process.stdout.write(message + "\n");
}

var config_file = [path.join(process.env["HOME"], ".multirun.json"), ".multirun.json", "multirun.json"];
var configs = { };
var default_config = null;
config_file.forEach(function(file) {
    if(fs.existsSync(file)) {
        var data = fs.readFileSync(file, { encoding: "utf8" });
        var json = JSON.parse(data);
        for(var key in json) {
            if(key == "__default__") {
                default_config = json[key];
            } else {
                configs[key] = json[key];
            }
        }
    }
});

var config_name = process.argv[2];
if(!config_name) config_name = default_config;

if(!config_name) {
    error_and_exit("Usage: multirun config [arguments] ...");
}

if(!configs[config_name]) {
    error_and_exit("No such config: '" + config_name + "'");
}

config = configs[config_name];

var processes = { };

var BufferedPrintLine = function(prefix) {
    this.buffer = new Buffer(0);
    this.prefix = prefix;
};

BufferedPrintLine.prototype.feed = function(chunk) {
    while(chunk.length > 0) {
        var i;
        for(i = 0; i < chunk.length; i++) {
            if(chunk[i] == 0x0A) break;
        }
        if(i == chunk.length) {
            this.buffer = Buffer.concat([this.buffer, chunk]);
            break;
        } else {
            var line = Buffer.concat([this.buffer, chunk.slice(0, i)]).toString("utf8");
            if(line.trim().length >= 0) {
                log_message(this.prefix + line);
            }
            chunk = chunk.slice(i + 1);
            this.buffer = new Buffer(0);
        }
    }
};

for(var name in config.commands) {
    var cmd = config.commands[name];
    (function(name, cmd) {
        var args = [];
        for(var i = 1; i < cmd.length; i++) {
            if(cmd[i] == "{MULTIRUN_ARGUMENTS}") args = args.concat(process.argv.slice(3));
            else args.push(cmd[i]);
        }

        var p = spawn(cmd[0], args);
        p.on('error', function(err) {
            log_message('(' + name + '): Error: ' + err.toString());
        });
        p.on('close', function(code, signal) {
            log_message('(' + name + '): terminated with code ' + code + ' signal ' + signal);
            delete processes[name];
            var has_process = false;
            for(var pname in processes) has_process = true;
            if(!has_process) {
                process.stdin.pause();
            }
        });
        var print_stdout = new BufferedPrintLine('(' + name + '): > ');
        var print_stderr = new BufferedPrintLine('(' + name + '): ! ');
        p.stderr.on('data', function(chunk) {
            print_stderr.feed(chunk);
        });
        p.stdout.on('data', function(chunk) {
            print_stdout.feed(chunk);
        });
        p.stderr.resume();
        p.stdout.resume();
        var should_forward_stdin = true;
        if(config.stdin) {
            should_forward_stdin = config.stdin.indexOf(name) >= 0;
        }
        if(!should_forward_stdin) p.stdin.end();

        processes[name] = { p: p };
    })(name, cmd);
}

process.stdin.on('data', function(chunk) {
    for(var name in processes) {
        var should_forward_stdin = true;
        if(config.stdin) {
            should_forward_stdin = config.stdin.indexOf(name) >= 0;
        }
        if(should_forward_stdin) {
            processes[name].p.stdin.write(chunk);
        }
    }
});

process.stdin.on('end', function() {
    for(var name in processes) {
        processes[name].p.stdin.end();
    }
});

process.on('SIGHUP', function() {
    log_message("multirun: SIGHUP received, broadcasting to processes.");
    process.stdin.pause();
    for(var name in processes) {
        processes[name].p.stdin.end();
        processes[name].p.kill("SIGHUP");
    }
});

process.on('SIGTERM', function() {
    log_message("multirun: SIGTERM received, broadcasting to processes.");
    process.stdin.pause();
    for(var name in processes) {
        processes[name].p.stdin.end();
        processes[name].p.kill("SIGHUP");
    }
});

process.on('SIGINT', function() {
    log_message("multirun: SIGINT received, broadcasting to processes.");
    process.stdin.pause();
    for(var name in processes) {
        processes[name].p.stdin.end();
        processes[name].p.kill("SIGHUP");
    }
});
