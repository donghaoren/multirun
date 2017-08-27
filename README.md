multirun: Run multiple processes simultaneously
====

Install
----

    npm install multirun

Usage
----

## Run multiple npm commands simultaneously

multirun can be used for running npm commands:

    multirun --npm npm-script-1 npm-script-2 ...

This will start the `npm run ...` commands simultaneously.

## Running custom commands
----

To use multirun for custom commands, first create a `multirun.json` file for your project, then run:

    multirun [multirun.json] [config-name]

The syntax of the `multirun.json` file is the following:

    {
      "default": "default-config-to-run",
      "configs": [
        {
          "name": "default-config-to-run",
          "commands": {
            "command1": [ "command", "arg1", "arg2", ... ],
            "command2": [ "command", "arg1", "arg2", ... ]
          }
        },
        ...
      ]
    }

As shown above, you can define multiple config entries, each of then has a set of commands. By default, multirun executes the entry specified in `default`. You can specify the entry by commandline: `multirun multirun.json config` to override that.

License
----

MIT
