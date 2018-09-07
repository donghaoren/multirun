const m = require("..");

describe("multirun", () => {
    it("command", async () => {
        console.log("test1: ls -lh");
        await m.run("ls -lh");
        console.log("test1: finished");
    });

    it("error", async () => {
        console.log("test2: ls -E");
        try {
            await m.run("ls -E");
        } catch (e) {
            console.log("test2: expected error thrown");
        }
        console.log("test2: finished");
    });

    it("sequence", async () => {
        m.run([
            "echo 'Message 1'",
            "sleep 1",
            "echo 'Message 2'",
            "sleep 1",
            "echo 'Message 3'",
        ]).then(() => {
            console.log("sequence finished");
        });
    });

    it("parallel", async () => {
        await m.run({
            "echo1": "echo 'Message 1'",
            "sleep1": "sleep 1",
            "echo3": "echo 'Message 2'",
            "sleep2": "sleep 1",
            "echo5": "echo 'Message 3'"
        });
        console.log("parallel finished");
    });
});