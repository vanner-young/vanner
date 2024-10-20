#!/usr/bin/env node

const { name, version } = require("../package.json");
const mvCliCore = require("@mvanner/core");
mvCliCore.start({ name, version });
