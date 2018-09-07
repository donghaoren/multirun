multirun: Run multiple processes simultaneously
====

Install
----

    npm install multirun

Module usage
----

Import the module:

    const multirun = require("multirun");

Run a single shell command:

    multirun.shell("ls -lh")

Run a command, promise, or a list of them in parallel:

    // If input is a string, run as shell command
    multirun.run("ls -lh");

    // If input is a function, run the function to return a promise.
    let fs = require("fs-extra")
    multirun.run(() => fs.mkdirs("dir"))

    // If input is an array, run all items in sequentially.
    multirun.run(["ls -lh", "ps ux"]);

    // If input is an dict-like object, run all items in parallel.
    multirun.run({
        ls: "ls -lh",
        ps: "ps ux"
    });

Run a set of commands sequentially:

    multirun.sequence([ "ls -lh", "ps ux" ])

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