#!/usr/bin/env bun

import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

import * as path from "node:path";
import { CommanderCore } from "@vanner/core";

new CommanderCore().start();
