#!/usr/bin/env node

const { name, version } = require("../package.json");
const mvCliCore = require("@mv-cli/core");
mvCliCore.start({ name, version });
