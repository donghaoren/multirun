multirun: Run multiple processes simultaneously
====

Install
----

    npm install multirun

Use with NPM scripts
----

    multirun-npm npm-script-1 npm-script-2 ...

Use Standalone
----

To use multirun, first create a config file for your project. Multirun searches for config files in your home directory and the current working directory. Config files are named as `multirun.json` or `.multirun.json`. You can also specify the config file in the command link as `multirun config.json`.

The syntax of the config file is the following:

    {
      "__default__": "watch",
      "entry-name": {
        "commands": {
          "command-name": [ command arguments, ... ]
          ...
        }
      },
      ...
    }

As shown above, you can define multiple entries, each of then has a set of commands. By default, multirun executes the `__default__` entry. You can specify the entry by commandline: `multirun config.json entry`.

License
----

MIT
