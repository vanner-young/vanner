#!/usr/bin/env node

const { name, version } = require("../package.json");
const mvCliCore = require("../packages/core/index");
mvCliCore.start({ name, version });
console.log(12312321);
