const fs = require("fs");
const path = require("path");

module.exports = function RollupCleanDir() {
    return {
        name: "clean-output-dir",
        generateBundle(options) {
            const filePath = path.dirname(options.file);
            fs.rmSync(path.resolve(filePath), { recursive: true, force: true });
        },
    };
};
