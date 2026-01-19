#!/usr/bin/env bun

import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: [resolve(__dirname, "../.env")], quiet: true });

import { CommanderCore } from "@vanner/core";

new CommanderCore().start();
