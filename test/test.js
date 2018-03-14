let m = require("..");

m.run("ls -lh").then(() => {
    console.log("ls -lh finished");
});
m.run("ps").then(() => {
    console.log("ps finished");
});

m.run("ls -E").catch(() => {
    console.log("ls -E run into an error");
});

m.sequence([
    "ls -lh",
    "sleep 1",
    "ps"
]).then(() => {
    console.log("sequence finished");
});

m.sequence([
    "ls -E",
    "sleep 1",
    "ps"
]).catch(() => {
    console.log("sequence error");
});