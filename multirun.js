#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var fs = require("fs");
var logger = new utils_1.Logger();
var manager = new utils_1.ProcessManager(logger);
if (process.argv[2] == "--npm") {
    for (var _i = 0, _a = process.argv.slice(3); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        manager.launchProcess(name_1, "npm", ["run", name_1]);
    }
}
else {
    var configFile = "multirun.json";
    if (process.argv[2]) {
        configFile = process.argv[2];
    }
    var config = void 0;
    try {
        config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    }
    catch (e) {
        logger.logMessage("Cannot load config file '" + configFile + "'");
        process.exit(-1);
    }
    if (config.configs.length > 0) {
        var defaultName = config["default"] || config.configs[0].name;
        var nameToRun_1 = process.argv[3] || defaultName;
        var item = config.configs.filter(function (x) { return x.name == nameToRun_1; })[0];
        if (!item) {
            logger.logMessage("Config '" + nameToRun_1 + "' is undefined");
            process.exit(-1);
        }
        for (var command in item.commands) {
            if (item.commands.hasOwnProperty(command)) {
                var cmd = item.commands[command];
                manager.launchProcess(command, cmd[0], cmd.slice(1));
            }
        }
    }
    else {
        logger.logMessage("Nothing to run");
        process.exit(-1);
    }
}
