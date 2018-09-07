multirun: A simple task runner for your projects
====

multirun is a simple task runner for building projects.

Install
----

    npm install multirun

Usage
----

Import the module:

    const multirun = require("multirun");

Run a shell command:

    multirun.run("ls -lh")

Run a JavaScript task. The expected input is a function that returns a Promise:

    let fs = require("fs-extra")
    multirun.run(() => fs.mkdirs("dir"))

Run a list of tasks sequentially:

    // If input is an array, run all items in sequentially.
    multirun.run(["ls -lh", "ps ux"]);

Run a set of tasks in parallel:

    // If input is an dict-like object, run all items in parallel.
    multirun.run({
        ls: "ls -lh",
        ps: "ps ux"
    });

multirun can run a mixture of sequential and parallel tasks:

    // Run task1, then task2s1 and task2s2 in parallel, then task3.
    multirun.run([
        "echo 'Task1'",
        {
            s1: "echo 'Task2s1'",
            s2: "echo 'Task2s2'",
        }
        "echo 'Task3'"
    ]);


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