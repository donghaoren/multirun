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

    Copyright (c) 2017 Donghao Ren

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.