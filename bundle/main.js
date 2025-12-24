#!/usr/bin/env bun
// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = import.meta.require;

// node_modules/.bun/dotenv@17.2.3/node_modules/dotenv/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "dotenv",
    version: "17.2.3",
    description: "Loads environment variables from .env file",
    main: "lib/main.js",
    types: "lib/main.d.ts",
    exports: {
      ".": {
        types: "./lib/main.d.ts",
        require: "./lib/main.js",
        default: "./lib/main.js"
      },
      "./config": "./config.js",
      "./config.js": "./config.js",
      "./lib/env-options": "./lib/env-options.js",
      "./lib/env-options.js": "./lib/env-options.js",
      "./lib/cli-options": "./lib/cli-options.js",
      "./lib/cli-options.js": "./lib/cli-options.js",
      "./package.json": "./package.json"
    },
    scripts: {
      "dts-check": "tsc --project tests/types/tsconfig.json",
      lint: "standard",
      pretest: "npm run lint && npm run dts-check",
      test: "tap run tests/**/*.js --allow-empty-coverage --disable-coverage --timeout=60000",
      "test:coverage": "tap run tests/**/*.js --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
      prerelease: "npm test",
      release: "standard-version"
    },
    repository: {
      type: "git",
      url: "git://github.com/motdotla/dotenv.git"
    },
    homepage: "https://github.com/motdotla/dotenv#readme",
    funding: "https://dotenvx.com",
    keywords: [
      "dotenv",
      "env",
      ".env",
      "environment",
      "variables",
      "config",
      "settings"
    ],
    readmeFilename: "README.md",
    license: "BSD-2-Clause",
    devDependencies: {
      "@types/node": "^18.11.3",
      decache: "^4.6.2",
      sinon: "^14.0.1",
      standard: "^17.0.0",
      "standard-version": "^9.5.0",
      tap: "^19.2.0",
      typescript: "^4.8.4"
    },
    engines: {
      node: ">=12"
    },
    browser: {
      fs: false
    }
  };
});

// node_modules/.bun/dotenv@17.2.3/node_modules/dotenv/lib/main.js
var require_main = __commonJS((exports, module) => {
  var fs = __require("fs");
  var path = __require("path");
  var os = __require("os");
  var crypto = __require("crypto");
  var packageJson = require_package();
  var version = packageJson.version;
  var TIPS = [
    "\uD83D\uDD10 encrypt with Dotenvx: https://dotenvx.com",
    "\uD83D\uDD10 prevent committing .env to code: https://dotenvx.com/precommit",
    "\uD83D\uDD10 prevent building .env in docker: https://dotenvx.com/prebuild",
    "\uD83D\uDCE1 add observability to secrets: https://dotenvx.com/ops",
    "\uD83D\uDC65 sync secrets across teammates & machines: https://dotenvx.com/ops",
    "\uD83D\uDDC2\uFE0F backup and recover secrets: https://dotenvx.com/ops",
    "\u2705 audit secrets and track compliance: https://dotenvx.com/ops",
    "\uD83D\uDD04 add secrets lifecycle management: https://dotenvx.com/ops",
    "\uD83D\uDD11 add access controls to secrets: https://dotenvx.com/ops",
    "\uD83D\uDEE0\uFE0F  run anywhere with `dotenvx run -- yourcommand`",
    "\u2699\uFE0F  specify custom .env file path with { path: '/custom/path/.env' }",
    "\u2699\uFE0F  enable debug logging with { debug: true }",
    "\u2699\uFE0F  override existing env vars with { override: true }",
    "\u2699\uFE0F  suppress all logs with { quiet: true }",
    "\u2699\uFE0F  write to custom object with { processEnv: myObject }",
    "\u2699\uFE0F  load multiple .env files with { path: ['.env.local', '.env'] }"
  ];
  function _getRandomTip() {
    return TIPS[Math.floor(Math.random() * TIPS.length)];
  }
  function parseBoolean(value) {
    if (typeof value === "string") {
      return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
    }
    return Boolean(value);
  }
  function supportsAnsi() {
    return process.stdout.isTTY;
  }
  function dim(text) {
    return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
  }
  var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function parse(src) {
    const obj = {};
    let lines = src.toString();
    lines = lines.replace(/\r\n?/mg, `
`);
    let match;
    while ((match = LINE.exec(lines)) != null) {
      const key = match[1];
      let value = match[2] || "";
      value = value.trim();
      const maybeQuote = value[0];
      value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
      if (maybeQuote === '"') {
        value = value.replace(/\\n/g, `
`);
        value = value.replace(/\\r/g, "\r");
      }
      obj[key] = value;
    }
    return obj;
  }
  function _parseVault(options) {
    options = options || {};
    const vaultPath = _vaultPath(options);
    options.path = vaultPath;
    const result = DotenvModule.configDotenv(options);
    if (!result.parsed) {
      const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
      err.code = "MISSING_DATA";
      throw err;
    }
    const keys = _dotenvKey(options).split(",");
    const length = keys.length;
    let decrypted;
    for (let i = 0;i < length; i++) {
      try {
        const key = keys[i].trim();
        const attrs = _instructions(result, key);
        decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
        break;
      } catch (error) {
        if (i + 1 >= length) {
          throw error;
        }
      }
    }
    return DotenvModule.parse(decrypted);
  }
  function _warn(message) {
    console.error(`[dotenv@${version}][WARN] ${message}`);
  }
  function _debug(message) {
    console.log(`[dotenv@${version}][DEBUG] ${message}`);
  }
  function _log(message) {
    console.log(`[dotenv@${version}] ${message}`);
  }
  function _dotenvKey(options) {
    if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
      return options.DOTENV_KEY;
    }
    if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
      return process.env.DOTENV_KEY;
    }
    return "";
  }
  function _instructions(result, dotenvKey) {
    let uri;
    try {
      uri = new URL(dotenvKey);
    } catch (error) {
      if (error.code === "ERR_INVALID_URL") {
        const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      throw error;
    }
    const key = uri.password;
    if (!key) {
      const err = new Error("INVALID_DOTENV_KEY: Missing key part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environment = uri.searchParams.get("environment");
    if (!environment) {
      const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
    const ciphertext = result.parsed[environmentKey];
    if (!ciphertext) {
      const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
      err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
      throw err;
    }
    return { ciphertext, key };
  }
  function _vaultPath(options) {
    let possibleVaultPath = null;
    if (options && options.path && options.path.length > 0) {
      if (Array.isArray(options.path)) {
        for (const filepath of options.path) {
          if (fs.existsSync(filepath)) {
            possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
          }
        }
      } else {
        possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
      }
    } else {
      possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
    }
    if (fs.existsSync(possibleVaultPath)) {
      return possibleVaultPath;
    }
    return null;
  }
  function _resolveHome(envPath) {
    return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
  }
  function _configVault(options) {
    const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
    const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
    if (debug || !quiet) {
      _log("Loading env from encrypted .env.vault");
    }
    const parsed = DotenvModule._parseVault(options);
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    DotenvModule.populate(processEnv, parsed, options);
    return { parsed };
  }
  function configDotenv(options) {
    const dotenvPath = path.resolve(process.cwd(), ".env");
    let encoding = "utf8";
    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }
    let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
    let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
    if (options && options.encoding) {
      encoding = options.encoding;
    } else {
      if (debug) {
        _debug("No encoding is specified. UTF-8 is used by default");
      }
    }
    let optionPaths = [dotenvPath];
    if (options && options.path) {
      if (!Array.isArray(options.path)) {
        optionPaths = [_resolveHome(options.path)];
      } else {
        optionPaths = [];
        for (const filepath of options.path) {
          optionPaths.push(_resolveHome(filepath));
        }
      }
    }
    let lastError;
    const parsedAll = {};
    for (const path2 of optionPaths) {
      try {
        const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
        DotenvModule.populate(parsedAll, parsed, options);
      } catch (e) {
        if (debug) {
          _debug(`Failed to load ${path2} ${e.message}`);
        }
        lastError = e;
      }
    }
    const populated = DotenvModule.populate(processEnv, parsedAll, options);
    debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
    quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
    if (debug || !quiet) {
      const keysCount = Object.keys(populated).length;
      const shortPaths = [];
      for (const filePath of optionPaths) {
        try {
          const relative = path.relative(process.cwd(), filePath);
          shortPaths.push(relative);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${filePath} ${e.message}`);
          }
          lastError = e;
        }
      }
      _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
    }
    if (lastError) {
      return { parsed: parsedAll, error: lastError };
    } else {
      return { parsed: parsedAll };
    }
  }
  function config(options) {
    if (_dotenvKey(options).length === 0) {
      return DotenvModule.configDotenv(options);
    }
    const vaultPath = _vaultPath(options);
    if (!vaultPath) {
      _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
      return DotenvModule.configDotenv(options);
    }
    return DotenvModule._configVault(options);
  }
  function decrypt(encrypted, keyStr) {
    const key = Buffer.from(keyStr.slice(-64), "hex");
    let ciphertext = Buffer.from(encrypted, "base64");
    const nonce = ciphertext.subarray(0, 12);
    const authTag = ciphertext.subarray(-16);
    ciphertext = ciphertext.subarray(12, -16);
    try {
      const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
      aesgcm.setAuthTag(authTag);
      return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
    } catch (error) {
      const isRange = error instanceof RangeError;
      const invalidKeyLength = error.message === "Invalid key length";
      const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
      if (isRange || invalidKeyLength) {
        const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      } else if (decryptionFailed) {
        const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
        err.code = "DECRYPTION_FAILED";
        throw err;
      } else {
        throw error;
      }
    }
  }
  function populate(processEnv, parsed, options = {}) {
    const debug = Boolean(options && options.debug);
    const override = Boolean(options && options.override);
    const populated = {};
    if (typeof parsed !== "object") {
      const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      err.code = "OBJECT_REQUIRED";
      throw err;
    }
    for (const key of Object.keys(parsed)) {
      if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
        if (override === true) {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
        if (debug) {
          if (override === true) {
            _debug(`"${key}" is already defined and WAS overwritten`);
          } else {
            _debug(`"${key}" is already defined and was NOT overwritten`);
          }
        }
      } else {
        processEnv[key] = parsed[key];
        populated[key] = parsed[key];
      }
    }
    return populated;
  }
  var DotenvModule = {
    configDotenv,
    _configVault,
    _parseVault,
    config,
    decrypt,
    parse,
    populate
  };
  exports.configDotenv = DotenvModule.configDotenv;
  exports._configVault = DotenvModule._configVault;
  exports._parseVault = DotenvModule._parseVault;
  exports.config = DotenvModule.config;
  exports.decrypt = DotenvModule.decrypt;
  exports.parse = DotenvModule.parse;
  exports.populate = DotenvModule.populate;
  module.exports = DotenvModule;
});

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/index.js
var require_mv_common = __commonJS((exports, module) => {
  var __dirname = "F:\\vanner\\node_modules\\.bun\\mv-common@1.2.4\\node_modules\\mv-common";
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports, __require("fs"), __require("path"), __require("os"), __require("child_process")) : typeof define === "function" && define.amd ? define(["exports", "node:fs", "node:path", "node:os", "node:child_process"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.mvcommon = {}, global.fs, global.path, global.os, global.node_child_process));
  })(exports, function(exports2, fs2, path2, os2, node_child_process) {
    const isValidUrl = (url) => {
      return /^(http|https):\/\//.test(url);
    };
    const getType2 = (value) => {
      const typeResult = Object.prototype.toString.call(value);
      const type = typeResult.slice(typeResult.indexOf(" ") + 1, -1).toLocaleLowerCase();
      if (type === "array") {
        if (Array.isArray(value))
          return "array";
        else
          return null;
      }
      return type;
    };
    const isType2 = (value, type) => {
      const valueType = getType2(value);
      if (valueType === null)
        throw new Error("invalid value...");
      if (typeof type === "string")
        return valueType === type.toLocaleLowerCase();
      return type.map((item) => item.toLocaleLowerCase()).includes(valueType);
    };
    const sleep = (timeout = 1000, sync = false) => {
      if (!sync) {
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            resolve(true);
          }, timeout);
        });
      } else {
        return Promise.resolve(true);
      }
    };
    const debounce = (cb, delay = 0, immediate = false) => {
      let timer;
      return function(...rest) {
        clearTimeout(timer);
        if (!timer && immediate)
          cb.apply(this, rest);
        const handler = () => {
          clearTimeout(timer);
          timer = null;
          if (!immediate)
            cb.apply(this, rest);
        };
        timer = setTimeout(handler, delay);
        if (immediate && !timer)
          cb.apply(this, rest);
      };
    };
    const throttle = (cb, delay = 0) => {
      let loading = false;
      return function(...rest) {
        if (!loading)
          cb.apply(this, rest);
        loading = true;
        const timer = setTimeout(() => {
          clearTimeout(timer);
          loading = false;
        }, delay);
      };
    };
    const hasProperty = (value, attr) => {
      return Reflect.has(value, attr);
    };
    const findString2 = (str, ident, absolute = false) => {
      if (isType2(ident, "array")) {
        const findFunction = absolute ? (item) => !str.includes(item) : (item) => str.includes(item);
        const result = ident.find(findFunction);
        return absolute ? !result : !!result;
      }
      return !!str.includes(ident);
    };
    var src = { exports: {} };
    (function(module2, exports3) {
      Object.defineProperty(exports3, "__esModule", { value: true });
      exports3.isPlainObject = exports3.clone = exports3.recursive = exports3.merge = exports3.main = undefined;
      module2.exports = exports3 = main;
      exports3.default = main;
      function main() {
        var items = [];
        for (var _i = 0;_i < arguments.length; _i++) {
          items[_i] = arguments[_i];
        }
        return merge.apply(undefined, items);
      }
      exports3.main = main;
      main.clone = clone;
      main.isPlainObject = isPlainObject;
      main.recursive = recursive;
      function merge() {
        var items = [];
        for (var _i = 0;_i < arguments.length; _i++) {
          items[_i] = arguments[_i];
        }
        return _merge(items[0] === true, false, items);
      }
      exports3.merge = merge;
      function recursive() {
        var items = [];
        for (var _i = 0;_i < arguments.length; _i++) {
          items[_i] = arguments[_i];
        }
        return _merge(items[0] === true, true, items);
      }
      exports3.recursive = recursive;
      function clone(input) {
        if (Array.isArray(input)) {
          var output = [];
          for (var index = 0;index < input.length; ++index)
            output.push(clone(input[index]));
          return output;
        } else if (isPlainObject(input)) {
          var output = {};
          for (var index in input)
            output[index] = clone(input[index]);
          return output;
        } else {
          return input;
        }
      }
      exports3.clone = clone;
      function isPlainObject(input) {
        return input && typeof input === "object" && !Array.isArray(input);
      }
      exports3.isPlainObject = isPlainObject;
      function _recursiveMerge(base, extend) {
        if (!isPlainObject(base))
          return extend;
        for (var key in extend) {
          if (key === "__proto__" || key === "constructor" || key === "prototype")
            continue;
          base[key] = isPlainObject(base[key]) && isPlainObject(extend[key]) ? _recursiveMerge(base[key], extend[key]) : extend[key];
        }
        return base;
      }
      function _merge(isClone, isRecursive, items) {
        var result;
        if (isClone || !isPlainObject(result = items.shift()))
          result = {};
        for (var index = 0;index < items.length; ++index) {
          var item = items[index];
          if (!isPlainObject(item))
            continue;
          for (var key in item) {
            if (key === "__proto__" || key === "constructor" || key === "prototype")
              continue;
            var value = isClone ? clone(item[key]) : item[key];
            result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
          }
        }
        return result;
      }
    })(src, src.exports);
    var srcExports = src.exports;
    const isEmptyJSON = (value) => {
      if (!isType2(value, "object"))
        throw new Error("invalid isEmptyJSON parameter");
      return !Object.keys(value).length;
    };
    const flatJSON = (obj) => {
      let value = {};
      for (const key in obj) {
        const item = obj[key];
        if (isType2(item, "object")) {
          value = srcExports.recursive(true, value, flatJSON(item));
        } else {
          value[key] = item;
        }
      }
      return value;
    };
    const splitJsonToContent = (content, sep = "") => {
      content = flatJSON(content);
      let fileContent = "";
      for (const key in content) {
        fileContent += `${key}${sep}${content[key]}
`;
      }
      return fileContent;
    };
    const isEmptyArray = (value) => {
      if (!isType2(value, "array"))
        throw new Error("invalid isEmptyArray parameter");
      else
        return !value.length;
    };
    const validType = (type, ...args) => {
      return !args.find((item) => !isType2(item, type));
    };
    const intersectionArrayList = (...args) => {
      return args.reduce((acc, array) => {
        return acc.filter((item) => array.includes(item));
      });
    };
    const differenceArrayList = (baseArray, ...args) => {
      const otherElementsSet = new Set(...args);
      return baseArray.filter((item) => !otherElementsSet.has(item));
    };
    const unionArrayList = (...args) => {
      return [...new Set(args.flat(1))];
    };
    const packageMangerViewer = new Map([
      ["yarn", "yarn.lock"],
      ["npm", "package-lock.json"],
      ["pnpm", "pnpm-lock.yaml"]
    ]);
    const getPackageMangerName = (targetPath = process.cwd()) => {
      for (const [key, value] of packageMangerViewer) {
        if (fs2.existsSync(path2.resolve(targetPath, value))) {
          return key;
        }
      }
    };
    const execCommand2 = (command, options = {}) => {
      return new Promise((resolve, reject) => {
        const commandList = command.split(" "), spawnOption = Object.assign({
          shell: true,
          encoding: "utf8",
          cwd: process.cwd()
        }, options);
        if (!fs2.existsSync(spawnOption.cwd || ""))
          return reject("exec command cwd is not exists...");
        const result = node_child_process.spawnSync(commandList[0], commandList.slice(1), spawnOption);
        const stdout = result.stdout?.trim?.();
        const error = result.error || result.stderr;
        if (error && findString2(error, ["error", "Error", "fatal:"]))
          return reject(error);
        else
          return resolve(stdout);
      });
    };
    const getSystemInfo2 = () => {
      const platform = process.platform;
      const systemDigit = process.arch;
      return {
        platform,
        digit: systemDigit,
        isWindow: platform === "win32",
        isMac: platform === "darwin",
        isWin64: systemDigit === "x64",
        isWin32: systemDigit !== "x64"
      };
    };
    const getHome2 = () => {
      return os2.homedir();
    };
    const getAppData2 = () => {
      const homedir = getHome2();
      return getSystemInfo2().isWindow ? path2.resolve(homedir, "AppData/Roaming") : getSystemInfo2().isMac ? path2.join(homedir, "/") : path2.resolve(__dirname);
    };
    const getReferToAppData = (refer) => {
      return path2.resolve(getAppData2(), refer || "");
    };
    const getPidByName = (name) => {
      const isWindows = getSystemInfo2().isWindow;
      const command = isWindows ? "tasklist" : "ps -ef";
      const pidList = [];
      return new Promise((resolve) => {
        execCommand2(command).then((result) => {
          const lines = result.split(isWindows ? `\r
` : `
`);
          for (let i = 0;i < lines.length; i++) {
            if (lines[i].includes(name)) {
              const columns = lines[i].split(/\s+/);
              const pid = isWindows ? columns[1] : columns[2];
              pidList.push(parseInt(pid));
            }
          }
          resolve(pidList.filter((item) => item));
        }).catch(() => {
          resolve([]);
        });
      });
    };
    const isActiveProcessByName = async (processName) => {
      const processList = await getPidByName(processName);
      return !!processList.length;
    };
    const isActiveProcessByPid = async (pid) => {
      const isWindow = getSystemInfo2().isWindow;
      const command = isWindow ? `tasklist /FI "PID eq ${pid}"` : "ps -p ${pid}";
      return new Promise((resolve) => {
        execCommand2(command).then((res) => {
          resolve(res.includes(pid));
        }).catch(() => {
          resolve(false);
        });
      });
    };
    const killProcessPid = (pid) => {
      if (!pid)
        return Promise.resolve(false);
      if (!isType2(pid, "array"))
        pid = [pid];
      const tasks = [], isWindows = getSystemInfo2().isWindow;
      function killTak(id) {
        const killCommand = isWindows ? `taskkill /F /PID ${id}` : `kill -9 ${id}`;
        return new Promise((resolve) => {
          node_child_process.exec(killCommand, (err) => {
            if (err) {
              resolve(false);
              return;
            }
            resolve(true);
          });
        });
      }
      pid.forEach((id) => tasks.push(killTak(id)));
      return Promise.all(tasks);
    };
    const killProcessName = (processName) => {
      return getPidByName(processName).then((list) => {
        list.forEach((pid) => {
          killProcessPid(pid);
        });
        return list;
      });
    };
    const exists = (filename, cwd = process.cwd()) => {
      return fs2.existsSync(path2.resolve(cwd, filename));
    };
    const readForTypeFileDir = (targetPath, type = "all") => {
      const list = fs2.readdirSync(targetPath);
      if (type === "all")
        return list;
      return list.filter((item) => {
        const itemPath = path2.resolve(targetPath, item);
        const stat = fs2.statSync(itemPath);
        if (typeof type !== "string")
          return type(itemPath, stat);
        return type === "file" ? !stat.isDirectory() : stat.isDirectory();
      });
    };
    const createDir = (targetPath, cover = false) => {
      if (fs2.existsSync(targetPath)) {
        if (!cover)
          return;
        fs2.rmSync(targetPath, { recursive: true });
      }
      fs2.mkdirSync(targetPath, { recursive: true });
    };
    const createFile = (targetPath, content, cover = false) => {
      if (fs2.existsSync(targetPath)) {
        if (!cover)
          return;
        fs2.unlinkSync(targetPath);
      }
      const dirPathName = path2.dirname(targetPath);
      if (!fs2.existsSync(dirPathName))
        createDir(dirPathName);
      fs2.writeFileSync(targetPath, content, { encoding: "utf-8" });
    };
    const readExistsFile = (targetPath, options = {}) => {
      if (!fs2.existsSync(targetPath))
        return "";
      return fs2.readFileSync(targetPath, options);
    };
    const copyFile = (sourcePath, targetPath, cover = false) => {
      if (!fs2.existsSync(targetPath) || cover) {
        fs2.copyFileSync(sourcePath, targetPath);
        return { type: 1, sourcePath, targetPath };
      }
      return { type: 0, sourcePath, targetPath };
    };
    const copyDirectory = async (origin, targetPath, cover = true, ignore = false) => {
      const originStat = fs2.statSync(origin).isDirectory();
      if (!originStat)
        throw new Error("origin or target is not directory");
      if (!fs2.existsSync(targetPath))
        createDir(targetPath);
      const entries = fs2.readdirSync(origin, { withFileTypes: true });
      for (const entry of entries) {
        const sourceChildrenPath = path2.resolve(origin, entry.name), destChildrenPath = path2.resolve(targetPath, entry.name);
        if (typeof ignore === "function" && isType2(ignore, ["function", "asyncfunction"]) && await ignore(sourceChildrenPath, destChildrenPath)) {
          continue;
        }
        let isCover = false;
        if (fs2.existsSync(destChildrenPath) && !entry.isDirectory()) {
          if (isType2(cover, ["boolean"]) && cover || typeof cover === "function" && await cover(sourceChildrenPath, destChildrenPath)) {
            isCover = true;
            fs2.unlinkSync(destChildrenPath);
          } else {
            continue;
          }
        }
        if (entry.isDirectory()) {
          await copyDirectory(sourceChildrenPath, destChildrenPath, cover, ignore);
        } else {
          copyFile(sourceChildrenPath, destChildrenPath, isCover);
        }
      }
    };
    const removeFileOrDir = (targetPath) => {
      if (!fs2.existsSync(targetPath))
        return;
      const stats = fs2.statSync(targetPath);
      if (stats.isDirectory())
        fs2.rmSync(targetPath, { recursive: true });
      else
        fs2.unlinkSync(targetPath);
    };
    const checkXPermission = (targetPath) => {
      fs2.accessSync(targetPath, fs2.constants.X_OK);
      fs2.chmodSync(targetPath, fs2.constants.S_IXUSR);
    };
    const checkReadPermission = (targetPath) => {
      fs2.accessSync(targetPath, fs2.constants.R_OK);
    };
    const dropCleanFolder = (dirPath, whiteList = []) => {
      if (fs2.existsSync(dirPath)) {
        const files = fs2.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path2.join(dirPath, file);
          if (fs2.lstatSync(filePath).isDirectory()) {
            dropCleanFolder(filePath, whiteList);
          } else {
            if (!whiteList.includes(filePath)) {
              fs2.unlinkSync(filePath);
            }
          }
        }
        if (!whiteList.includes(dirPath)) {
          fs2.rmdirSync(dirPath);
        }
      }
    };
    const mergeOrCreateFile = (source, targetPath, options = {}) => {
      options = srcExports.recursive({ wrap: false, jsonOrArray: false, tabWidth: 4 }, options);
      const existsSource = fs2.existsSync(source), existsTarget = fs2.existsSync(targetPath);
      if (!existsSource)
        throw new Error("source or target path can not be null");
      if (!existsTarget)
        return fs2.copyFileSync(source, targetPath);
      const sourceContent = fs2.readFileSync(source, { encoding: "utf-8" });
      if (options.jsonOrArray) {
        const source2 = JSON.parse(sourceContent), target = JSON.parse(fs2.readFileSync(targetPath, {
          encoding: "utf-8"
        }));
        fs2.writeFileSync(targetPath, JSON.stringify(srcExports.recursive(source2, target), null, options.tabWidth), {
          encoding: "utf-8"
        });
      } else {
        fs2.appendFileSync(targetPath, `${options.wrap ? `
` : ""}${sourceContent}`, { encoding: "utf-8" });
      }
    };
    const isDriveDirectory = (targetPath) => {
      targetPath = path2.resolve(targetPath);
      return targetPath === path2.parse(targetPath).root;
    };
    const parentExecHandlerPromise = (targetPath, cb) => {
      return new Promise((resolve) => {
        if (isDriveDirectory(targetPath))
          return resolve("");
        const recursionExecHandler = () => resolve(parentExecHandlerPromise(path2.dirname(targetPath), cb));
        if (isType2(cb, "asyncfunction")) {
          cb(targetPath).then((result) => {
            if (!result)
              throw new Error("");
            return resolve(result);
          }).catch(() => {
            return recursionExecHandler();
          });
        } else {
          try {
            const result = cb(targetPath);
            if (result)
              return resolve(result);
            else
              throw new Error("");
          } catch (e) {
            return recursionExecHandler();
          }
        }
      });
    };
    const findParentFile = (targetPath, handler) => {
      return parentExecHandlerPromise(targetPath, async (cwd) => {
        let result = null;
        if (isType2(handler, "string")) {
          result = fs2.existsSync(path2.resolve(cwd, handler));
        } else if (isType2(handler, "function")) {
          result = handler(cwd);
        } else if (isType2(handler, "asyncfunction")) {
          result = await handler(cwd);
        } else {
          throw new Error("invalid handler parameter");
        }
        return result ? cwd : result;
      });
    };
    const findRootParentPath = (value) => {
      if (!value.trim())
        return value;
      value = value.replaceAll("//", "/");
      const parentPath = path2.dirname(value);
      if ([".", "/"].includes(parentPath))
        return value;
      else
        return findRootParentPath(parentPath);
    };
    const getExistsFilePath = (basicPath = process.cwd(), fileNameList) => {
      for (const item of fileNameList) {
        const filePath = path2.resolve(basicPath, item);
        if (fs2.existsSync(filePath))
          return filePath;
      }
      return "";
    };
    const blobToString = (blob) => {
      return new Promise((resolve) => {
        const fileRender = new FileReader;
        fileRender.onload = () => {
          resolve(fileRender.result);
        };
        fileRender.readAsText(blob);
      });
    };
    const getBrowserInfo = () => {
      const userAgent = window.navigator.userAgent;
      let browserName = "", browserVersion = "";
      if (/Chrome/i.test(userAgent)) {
        browserName = "Chrome";
      } else if (/Firefox/i.test(userAgent)) {
        browserName = "Firefox";
      } else if (/Safari/i.test(userAgent)) {
        browserName = "Safari";
      } else if (/Opera|OPR/i.test(userAgent)) {
        browserName = "Opera";
      } else if (/Edge/i.test(userAgent)) {
        browserName = "Edge";
      } else if (/MSIE/i.test(userAgent) || /Trident/i.test(userAgent)) {
        browserName = "IE";
      } else {
        browserName = "Unknown";
      }
      const versionMatch = userAgent.match(/(Chrome|Firefox|Safari|Opera|Edge|IE)\/?\s*(\.?\d+(\.\d+)*)/i);
      if (versionMatch && versionMatch.length >= 3) {
        browserVersion = versionMatch[2];
      } else {
        browserVersion = "Unknown";
      }
      return {
        name: browserName,
        version: browserVersion
      };
    };
    exports2.blobToString = blobToString;
    exports2.checkReadPermission = checkReadPermission;
    exports2.checkXPermission = checkXPermission;
    exports2.copyDirectory = copyDirectory;
    exports2.copyFile = copyFile;
    exports2.createDir = createDir;
    exports2.createFile = createFile;
    exports2.debounce = debounce;
    exports2.differenceArrayList = differenceArrayList;
    exports2.dropCleanFolder = dropCleanFolder;
    exports2.execCommand = execCommand2;
    exports2.exists = exists;
    exports2.findParentFile = findParentFile;
    exports2.findRootParentPath = findRootParentPath;
    exports2.findString = findString2;
    exports2.flatJSON = flatJSON;
    exports2.getAppData = getAppData2;
    exports2.getBrowserInfo = getBrowserInfo;
    exports2.getExistsFilePath = getExistsFilePath;
    exports2.getHome = getHome2;
    exports2.getPackageMangerName = getPackageMangerName;
    exports2.getPidByName = getPidByName;
    exports2.getReferToAppData = getReferToAppData;
    exports2.getSystemInfo = getSystemInfo2;
    exports2.getType = getType2;
    exports2.hasProperty = hasProperty;
    exports2.intersectionArrayList = intersectionArrayList;
    exports2.isActiveProcessByName = isActiveProcessByName;
    exports2.isActiveProcessByPid = isActiveProcessByPid;
    exports2.isEmptyArray = isEmptyArray;
    exports2.isEmptyJSON = isEmptyJSON;
    exports2.isType = isType2;
    exports2.isValidUrl = isValidUrl;
    exports2.killProcessName = killProcessName;
    exports2.killProcessPid = killProcessPid;
    exports2.mergeOrCreateFile = mergeOrCreateFile;
    exports2.packageMangerViewer = packageMangerViewer;
    exports2.readExistsFile = readExistsFile;
    exports2.readForTypeFileDir = readForTypeFileDir;
    exports2.removeFileOrDir = removeFileOrDir;
    exports2.sleep = sleep;
    exports2.splitJsonToContent = splitJsonToContent;
    exports2.throttle = throttle;
    exports2.unionArrayList = unionArrayList;
    exports2.validType = validType;
  });
});

// node_modules/.bun/commander@14.0.2/node_modules/commander/lib/error.js
var require_error = __commonJS((exports) => {
  class CommanderError extends Error {
    constructor(exitCode, code, message) {
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.code = code;
      this.exitCode = exitCode;
      this.nestedError = undefined;
    }
  }

  class InvalidArgumentError extends CommanderError {
    constructor(message) {
      super(1, "commander.invalidArgument", message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
    }
  }
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
});

// node_modules/.bun/commander@14.0.2/node_modules/commander/lib/argument.js
var require_argument = __commonJS((exports) => {
  var { InvalidArgumentError } = require_error();

  class Argument {
    constructor(name, description) {
      this.description = description || "";
      this.variadic = false;
      this.parseArg = undefined;
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.argChoices = undefined;
      switch (name[0]) {
        case "<":
          this.required = true;
          this._name = name.slice(1, -1);
          break;
        case "[":
          this.required = false;
          this._name = name.slice(1, -1);
          break;
        default:
          this.required = true;
          this._name = name;
          break;
      }
      if (this._name.endsWith("...")) {
        this.variadic = true;
        this._name = this._name.slice(0, -3);
      }
    }
    name() {
      return this._name;
    }
    _collectValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      previous.push(value);
      return previous;
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._collectValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    argRequired() {
      this.required = true;
      return this;
    }
    argOptional() {
      this.required = false;
      return this;
    }
  }
  function humanReadableArgName(arg) {
    const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
    return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
  }
  exports.Argument = Argument;
  exports.humanReadableArgName = humanReadableArgName;
});

// node_modules/.bun/commander@14.0.2/node_modules/commander/lib/help.js
var require_help = __commonJS((exports) => {
  var { humanReadableArgName } = require_argument();

  class Help {
    constructor() {
      this.helpWidth = undefined;
      this.minWidthToWrap = 40;
      this.sortSubcommands = false;
      this.sortOptions = false;
      this.showGlobalOptions = false;
    }
    prepareContext(contextOptions) {
      this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
    }
    visibleCommands(cmd) {
      const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
      const helpCommand = cmd._getHelpCommand();
      if (helpCommand && !helpCommand._hidden) {
        visibleCommands.push(helpCommand);
      }
      if (this.sortSubcommands) {
        visibleCommands.sort((a, b) => {
          return a.name().localeCompare(b.name());
        });
      }
      return visibleCommands;
    }
    compareOptions(a, b) {
      const getSortKey = (option) => {
        return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
      };
      return getSortKey(a).localeCompare(getSortKey(b));
    }
    visibleOptions(cmd) {
      const visibleOptions = cmd.options.filter((option) => !option.hidden);
      const helpOption = cmd._getHelpOption();
      if (helpOption && !helpOption.hidden) {
        const removeShort = helpOption.short && cmd._findOption(helpOption.short);
        const removeLong = helpOption.long && cmd._findOption(helpOption.long);
        if (!removeShort && !removeLong) {
          visibleOptions.push(helpOption);
        } else if (helpOption.long && !removeLong) {
          visibleOptions.push(cmd.createOption(helpOption.long, helpOption.description));
        } else if (helpOption.short && !removeShort) {
          visibleOptions.push(cmd.createOption(helpOption.short, helpOption.description));
        }
      }
      if (this.sortOptions) {
        visibleOptions.sort(this.compareOptions);
      }
      return visibleOptions;
    }
    visibleGlobalOptions(cmd) {
      if (!this.showGlobalOptions)
        return [];
      const globalOptions = [];
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        const visibleOptions = ancestorCmd.options.filter((option) => !option.hidden);
        globalOptions.push(...visibleOptions);
      }
      if (this.sortOptions) {
        globalOptions.sort(this.compareOptions);
      }
      return globalOptions;
    }
    visibleArguments(cmd) {
      if (cmd._argsDescription) {
        cmd.registeredArguments.forEach((argument) => {
          argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
        });
      }
      if (cmd.registeredArguments.find((argument) => argument.description)) {
        return cmd.registeredArguments;
      }
      return [];
    }
    subcommandTerm(cmd) {
      const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
      return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : "");
    }
    optionTerm(option) {
      return option.flags;
    }
    argumentTerm(argument) {
      return argument.name();
    }
    longestSubcommandTermLength(cmd, helper) {
      return helper.visibleCommands(cmd).reduce((max, command) => {
        return Math.max(max, this.displayWidth(helper.styleSubcommandTerm(helper.subcommandTerm(command))));
      }, 0);
    }
    longestOptionTermLength(cmd, helper) {
      return helper.visibleOptions(cmd).reduce((max, option) => {
        return Math.max(max, this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))));
      }, 0);
    }
    longestGlobalOptionTermLength(cmd, helper) {
      return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
        return Math.max(max, this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))));
      }, 0);
    }
    longestArgumentTermLength(cmd, helper) {
      return helper.visibleArguments(cmd).reduce((max, argument) => {
        return Math.max(max, this.displayWidth(helper.styleArgumentTerm(helper.argumentTerm(argument))));
      }, 0);
    }
    commandUsage(cmd) {
      let cmdName = cmd._name;
      if (cmd._aliases[0]) {
        cmdName = cmdName + "|" + cmd._aliases[0];
      }
      let ancestorCmdNames = "";
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
      }
      return ancestorCmdNames + cmdName + " " + cmd.usage();
    }
    commandDescription(cmd) {
      return cmd.description();
    }
    subcommandDescription(cmd) {
      return cmd.summary() || cmd.description();
    }
    optionDescription(option) {
      const extraInfo = [];
      if (option.argChoices) {
        extraInfo.push(`choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (option.defaultValue !== undefined) {
        const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
        if (showDefault) {
          extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
        }
      }
      if (option.presetArg !== undefined && option.optional) {
        extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
      }
      if (option.envVar !== undefined) {
        extraInfo.push(`env: ${option.envVar}`);
      }
      if (extraInfo.length > 0) {
        const extraDescription = `(${extraInfo.join(", ")})`;
        if (option.description) {
          return `${option.description} ${extraDescription}`;
        }
        return extraDescription;
      }
      return option.description;
    }
    argumentDescription(argument) {
      const extraInfo = [];
      if (argument.argChoices) {
        extraInfo.push(`choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (argument.defaultValue !== undefined) {
        extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
      }
      if (extraInfo.length > 0) {
        const extraDescription = `(${extraInfo.join(", ")})`;
        if (argument.description) {
          return `${argument.description} ${extraDescription}`;
        }
        return extraDescription;
      }
      return argument.description;
    }
    formatItemList(heading, items, helper) {
      if (items.length === 0)
        return [];
      return [helper.styleTitle(heading), ...items, ""];
    }
    groupItems(unsortedItems, visibleItems, getGroup) {
      const result = new Map;
      unsortedItems.forEach((item) => {
        const group = getGroup(item);
        if (!result.has(group))
          result.set(group, []);
      });
      visibleItems.forEach((item) => {
        const group = getGroup(item);
        if (!result.has(group)) {
          result.set(group, []);
        }
        result.get(group).push(item);
      });
      return result;
    }
    formatHelp(cmd, helper) {
      const termWidth = helper.padWidth(cmd, helper);
      const helpWidth = helper.helpWidth ?? 80;
      function callFormatItem(term, description) {
        return helper.formatItem(term, termWidth, description, helper);
      }
      let output = [
        `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
        ""
      ];
      const commandDescription = helper.commandDescription(cmd);
      if (commandDescription.length > 0) {
        output = output.concat([
          helper.boxWrap(helper.styleCommandDescription(commandDescription), helpWidth),
          ""
        ]);
      }
      const argumentList = helper.visibleArguments(cmd).map((argument) => {
        return callFormatItem(helper.styleArgumentTerm(helper.argumentTerm(argument)), helper.styleArgumentDescription(helper.argumentDescription(argument)));
      });
      output = output.concat(this.formatItemList("Arguments:", argumentList, helper));
      const optionGroups = this.groupItems(cmd.options, helper.visibleOptions(cmd), (option) => option.helpGroupHeading ?? "Options:");
      optionGroups.forEach((options, group) => {
        const optionList = options.map((option) => {
          return callFormatItem(helper.styleOptionTerm(helper.optionTerm(option)), helper.styleOptionDescription(helper.optionDescription(option)));
        });
        output = output.concat(this.formatItemList(group, optionList, helper));
      });
      if (helper.showGlobalOptions) {
        const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
          return callFormatItem(helper.styleOptionTerm(helper.optionTerm(option)), helper.styleOptionDescription(helper.optionDescription(option)));
        });
        output = output.concat(this.formatItemList("Global Options:", globalOptionList, helper));
      }
      const commandGroups = this.groupItems(cmd.commands, helper.visibleCommands(cmd), (sub) => sub.helpGroup() || "Commands:");
      commandGroups.forEach((commands, group) => {
        const commandList = commands.map((sub) => {
          return callFormatItem(helper.styleSubcommandTerm(helper.subcommandTerm(sub)), helper.styleSubcommandDescription(helper.subcommandDescription(sub)));
        });
        output = output.concat(this.formatItemList(group, commandList, helper));
      });
      return output.join(`
`);
    }
    displayWidth(str) {
      return stripColor(str).length;
    }
    styleTitle(str) {
      return str;
    }
    styleUsage(str) {
      return str.split(" ").map((word) => {
        if (word === "[options]")
          return this.styleOptionText(word);
        if (word === "[command]")
          return this.styleSubcommandText(word);
        if (word[0] === "[" || word[0] === "<")
          return this.styleArgumentText(word);
        return this.styleCommandText(word);
      }).join(" ");
    }
    styleCommandDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleOptionDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleSubcommandDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleArgumentDescription(str) {
      return this.styleDescriptionText(str);
    }
    styleDescriptionText(str) {
      return str;
    }
    styleOptionTerm(str) {
      return this.styleOptionText(str);
    }
    styleSubcommandTerm(str) {
      return str.split(" ").map((word) => {
        if (word === "[options]")
          return this.styleOptionText(word);
        if (word[0] === "[" || word[0] === "<")
          return this.styleArgumentText(word);
        return this.styleSubcommandText(word);
      }).join(" ");
    }
    styleArgumentTerm(str) {
      return this.styleArgumentText(str);
    }
    styleOptionText(str) {
      return str;
    }
    styleArgumentText(str) {
      return str;
    }
    styleSubcommandText(str) {
      return str;
    }
    styleCommandText(str) {
      return str;
    }
    padWidth(cmd, helper) {
      return Math.max(helper.longestOptionTermLength(cmd, helper), helper.longestGlobalOptionTermLength(cmd, helper), helper.longestSubcommandTermLength(cmd, helper), helper.longestArgumentTermLength(cmd, helper));
    }
    preformatted(str) {
      return /\n[^\S\r\n]/.test(str);
    }
    formatItem(term, termWidth, description, helper) {
      const itemIndent = 2;
      const itemIndentStr = " ".repeat(itemIndent);
      if (!description)
        return itemIndentStr + term;
      const paddedTerm = term.padEnd(termWidth + term.length - helper.displayWidth(term));
      const spacerWidth = 2;
      const helpWidth = this.helpWidth ?? 80;
      const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
      let formattedDescription;
      if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
        formattedDescription = description;
      } else {
        const wrappedDescription = helper.boxWrap(description, remainingWidth);
        formattedDescription = wrappedDescription.replace(/\n/g, `
` + " ".repeat(termWidth + spacerWidth));
      }
      return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
    }
    boxWrap(str, width) {
      if (width < this.minWidthToWrap)
        return str;
      const rawLines = str.split(/\r\n|\n/);
      const chunkPattern = /[\s]*[^\s]+/g;
      const wrappedLines = [];
      rawLines.forEach((line) => {
        const chunks = line.match(chunkPattern);
        if (chunks === null) {
          wrappedLines.push("");
          return;
        }
        let sumChunks = [chunks.shift()];
        let sumWidth = this.displayWidth(sumChunks[0]);
        chunks.forEach((chunk) => {
          const visibleWidth = this.displayWidth(chunk);
          if (sumWidth + visibleWidth <= width) {
            sumChunks.push(chunk);
            sumWidth += visibleWidth;
            return;
          }
          wrappedLines.push(sumChunks.join(""));
          const nextChunk = chunk.trimStart();
          sumChunks = [nextChunk];
          sumWidth = this.displayWidth(nextChunk);
        });
        wrappedLines.push(sumChunks.join(""));
      });
      return wrappedLines.join(`
`);
    }
  }
  function stripColor(str) {
    const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
    return str.replace(sgrPattern, "");
  }
  exports.Help = Help;
  exports.stripColor = stripColor;
});

// node_modules/.bun/commander@14.0.2/node_modules/commander/lib/option.js
var require_option = __commonJS((exports) => {
  var { InvalidArgumentError } = require_error();

  class Option {
    constructor(flags, description) {
      this.flags = flags;
      this.description = description || "";
      this.required = flags.includes("<");
      this.optional = flags.includes("[");
      this.variadic = /\w\.\.\.[>\]]$/.test(flags);
      this.mandatory = false;
      const optionFlags = splitOptionFlags(flags);
      this.short = optionFlags.shortFlag;
      this.long = optionFlags.longFlag;
      this.negate = false;
      if (this.long) {
        this.negate = this.long.startsWith("--no-");
      }
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.presetArg = undefined;
      this.envVar = undefined;
      this.parseArg = undefined;
      this.hidden = false;
      this.argChoices = undefined;
      this.conflictsWith = [];
      this.implied = undefined;
      this.helpGroupHeading = undefined;
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    preset(arg) {
      this.presetArg = arg;
      return this;
    }
    conflicts(names) {
      this.conflictsWith = this.conflictsWith.concat(names);
      return this;
    }
    implies(impliedOptionValues) {
      let newImplied = impliedOptionValues;
      if (typeof impliedOptionValues === "string") {
        newImplied = { [impliedOptionValues]: true };
      }
      this.implied = Object.assign(this.implied || {}, newImplied);
      return this;
    }
    env(name) {
      this.envVar = name;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    makeOptionMandatory(mandatory = true) {
      this.mandatory = !!mandatory;
      return this;
    }
    hideHelp(hide = true) {
      this.hidden = !!hide;
      return this;
    }
    _collectValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      previous.push(value);
      return previous;
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._collectValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    name() {
      if (this.long) {
        return this.long.replace(/^--/, "");
      }
      return this.short.replace(/^-/, "");
    }
    attributeName() {
      if (this.negate) {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      return camelcase(this.name());
    }
    helpGroup(heading) {
      this.helpGroupHeading = heading;
      return this;
    }
    is(arg) {
      return this.short === arg || this.long === arg;
    }
    isBoolean() {
      return !this.required && !this.optional && !this.negate;
    }
  }

  class DualOptions {
    constructor(options) {
      this.positiveOptions = new Map;
      this.negativeOptions = new Map;
      this.dualOptions = new Set;
      options.forEach((option) => {
        if (option.negate) {
          this.negativeOptions.set(option.attributeName(), option);
        } else {
          this.positiveOptions.set(option.attributeName(), option);
        }
      });
      this.negativeOptions.forEach((value, key) => {
        if (this.positiveOptions.has(key)) {
          this.dualOptions.add(key);
        }
      });
    }
    valueFromOption(value, option) {
      const optionKey = option.attributeName();
      if (!this.dualOptions.has(optionKey))
        return true;
      const preset = this.negativeOptions.get(optionKey).presetArg;
      const negativeValue = preset !== undefined ? preset : false;
      return option.negate === (negativeValue === value);
    }
  }
  function camelcase(str) {
    return str.split("-").reduce((str2, word) => {
      return str2 + word[0].toUpperCase() + word.slice(1);
    });
  }
  function splitOptionFlags(flags) {
    let shortFlag;
    let longFlag;
    const shortFlagExp = /^-[^-]$/;
    const longFlagExp = /^--[^-]/;
    const flagParts = flags.split(/[ |,]+/).concat("guard");
    if (shortFlagExp.test(flagParts[0]))
      shortFlag = flagParts.shift();
    if (longFlagExp.test(flagParts[0]))
      longFlag = flagParts.shift();
    if (!shortFlag && shortFlagExp.test(flagParts[0]))
      shortFlag = flagParts.shift();
    if (!shortFlag && longFlagExp.test(flagParts[0])) {
      shortFlag = longFlag;
      longFlag = flagParts.shift();
    }
    if (flagParts[0].startsWith("-")) {
      const unsupportedFlag = flagParts[0];
      const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
      if (/^-[^-][^-]/.test(unsupportedFlag))
        throw new Error(`${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`);
      if (shortFlagExp.test(unsupportedFlag))
        throw new Error(`${baseError}
- too many short flags`);
      if (longFlagExp.test(unsupportedFlag))
        throw new Error(`${baseError}
- too many long flags`);
      throw new Error(`${baseError}
- unrecognised flag format`);
    }
    if (shortFlag === undefined && longFlag === undefined)
      throw new Error(`option creation failed due to no flags found in '${flags}'.`);
    return { shortFlag, longFlag };
  }
  exports.Option = Option;
  exports.DualOptions = DualOptions;
});

// node_modules/.bun/commander@14.0.2/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS((exports) => {
  var maxDistance = 3;
  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > maxDistance)
      return Math.max(a.length, b.length);
    const d = [];
    for (let i = 0;i <= a.length; i++) {
      d[i] = [i];
    }
    for (let j = 0;j <= b.length; j++) {
      d[0][j] = j;
    }
    for (let j = 1;j <= b.length; j++) {
      for (let i = 1;i <= a.length; i++) {
        let cost = 1;
        if (a[i - 1] === b[j - 1]) {
          cost = 0;
        } else {
          cost = 1;
        }
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }
  function suggestSimilar(word, candidates) {
    if (!candidates || candidates.length === 0)
      return "";
    candidates = Array.from(new Set(candidates));
    const searchingOptions = word.startsWith("--");
    if (searchingOptions) {
      word = word.slice(2);
      candidates = candidates.map((candidate) => candidate.slice(2));
    }
    let similar = [];
    let bestDistance = maxDistance;
    const minSimilarity = 0.4;
    candidates.forEach((candidate) => {
      if (candidate.length <= 1)
        return;
      const distance = editDistance(word, candidate);
      const length = Math.max(word.length, candidate.length);
      const similarity = (length - distance) / length;
      if (similarity > minSimilarity) {
        if (distance < bestDistance) {
          bestDistance = distance;
          similar = [candidate];
        } else if (distance === bestDistance) {
          similar.push(candidate);
        }
      }
    });
    similar.sort((a, b) => a.localeCompare(b));
    if (searchingOptions) {
      similar = similar.map((candidate) => `--${candidate}`);
    }
    if (similar.length > 1) {
      return `
(Did you mean one of ${similar.join(", ")}?)`;
    }
    if (similar.length === 1) {
      return `
(Did you mean ${similar[0]}?)`;
    }
    return "";
  }
  exports.suggestSimilar = suggestSimilar;
});

// node_modules/.bun/commander@14.0.2/node_modules/commander/lib/command.js
var require_command = __commonJS((exports) => {
  var EventEmitter = __require("events").EventEmitter;
  var childProcess = __require("child_process");
  var path3 = __require("path");
  var fs2 = __require("fs");
  var process2 = __require("process");
  var { Argument, humanReadableArgName } = require_argument();
  var { CommanderError } = require_error();
  var { Help, stripColor } = require_help();
  var { Option, DualOptions } = require_option();
  var { suggestSimilar } = require_suggestSimilar();

  class Command extends EventEmitter {
    constructor(name) {
      super();
      this.commands = [];
      this.options = [];
      this.parent = null;
      this._allowUnknownOption = false;
      this._allowExcessArguments = false;
      this.registeredArguments = [];
      this._args = this.registeredArguments;
      this.args = [];
      this.rawArgs = [];
      this.processedArgs = [];
      this._scriptPath = null;
      this._name = name || "";
      this._optionValues = {};
      this._optionValueSources = {};
      this._storeOptionsAsProperties = false;
      this._actionHandler = null;
      this._executableHandler = false;
      this._executableFile = null;
      this._executableDir = null;
      this._defaultCommandName = null;
      this._exitCallback = null;
      this._aliases = [];
      this._combineFlagAndOptionalValue = true;
      this._description = "";
      this._summary = "";
      this._argsDescription = undefined;
      this._enablePositionalOptions = false;
      this._passThroughOptions = false;
      this._lifeCycleHooks = {};
      this._showHelpAfterError = false;
      this._showSuggestionAfterError = true;
      this._savedState = null;
      this._outputConfiguration = {
        writeOut: (str) => process2.stdout.write(str),
        writeErr: (str) => process2.stderr.write(str),
        outputError: (str, write) => write(str),
        getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : undefined,
        getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : undefined,
        getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
        getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
        stripColor: (str) => stripColor(str)
      };
      this._hidden = false;
      this._helpOption = undefined;
      this._addImplicitHelpCommand = undefined;
      this._helpCommand = undefined;
      this._helpConfiguration = {};
      this._helpGroupHeading = undefined;
      this._defaultCommandGroup = undefined;
      this._defaultOptionGroup = undefined;
    }
    copyInheritedSettings(sourceCommand) {
      this._outputConfiguration = sourceCommand._outputConfiguration;
      this._helpOption = sourceCommand._helpOption;
      this._helpCommand = sourceCommand._helpCommand;
      this._helpConfiguration = sourceCommand._helpConfiguration;
      this._exitCallback = sourceCommand._exitCallback;
      this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
      this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
      this._allowExcessArguments = sourceCommand._allowExcessArguments;
      this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
      this._showHelpAfterError = sourceCommand._showHelpAfterError;
      this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
      return this;
    }
    _getCommandAndAncestors() {
      const result = [];
      for (let command = this;command; command = command.parent) {
        result.push(command);
      }
      return result;
    }
    command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
      let desc = actionOptsOrExecDesc;
      let opts = execOpts;
      if (typeof desc === "object" && desc !== null) {
        opts = desc;
        desc = null;
      }
      opts = opts || {};
      const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
      const cmd = this.createCommand(name);
      if (desc) {
        cmd.description(desc);
        cmd._executableHandler = true;
      }
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      cmd._hidden = !!(opts.noHelp || opts.hidden);
      cmd._executableFile = opts.executableFile || null;
      if (args)
        cmd.arguments(args);
      this._registerCommand(cmd);
      cmd.parent = this;
      cmd.copyInheritedSettings(this);
      if (desc)
        return this;
      return cmd;
    }
    createCommand(name) {
      return new Command(name);
    }
    createHelp() {
      return Object.assign(new Help, this.configureHelp());
    }
    configureHelp(configuration) {
      if (configuration === undefined)
        return this._helpConfiguration;
      this._helpConfiguration = configuration;
      return this;
    }
    configureOutput(configuration) {
      if (configuration === undefined)
        return this._outputConfiguration;
      this._outputConfiguration = {
        ...this._outputConfiguration,
        ...configuration
      };
      return this;
    }
    showHelpAfterError(displayHelp = true) {
      if (typeof displayHelp !== "string")
        displayHelp = !!displayHelp;
      this._showHelpAfterError = displayHelp;
      return this;
    }
    showSuggestionAfterError(displaySuggestion = true) {
      this._showSuggestionAfterError = !!displaySuggestion;
      return this;
    }
    addCommand(cmd, opts) {
      if (!cmd._name) {
        throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
      }
      opts = opts || {};
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      if (opts.noHelp || opts.hidden)
        cmd._hidden = true;
      this._registerCommand(cmd);
      cmd.parent = this;
      cmd._checkForBrokenPassThrough();
      return this;
    }
    createArgument(name, description) {
      return new Argument(name, description);
    }
    argument(name, description, parseArg, defaultValue) {
      const argument = this.createArgument(name, description);
      if (typeof parseArg === "function") {
        argument.default(defaultValue).argParser(parseArg);
      } else {
        argument.default(parseArg);
      }
      this.addArgument(argument);
      return this;
    }
    arguments(names) {
      names.trim().split(/ +/).forEach((detail) => {
        this.argument(detail);
      });
      return this;
    }
    addArgument(argument) {
      const previousArgument = this.registeredArguments.slice(-1)[0];
      if (previousArgument?.variadic) {
        throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
      }
      if (argument.required && argument.defaultValue !== undefined && argument.parseArg === undefined) {
        throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
      }
      this.registeredArguments.push(argument);
      return this;
    }
    helpCommand(enableOrNameAndArgs, description) {
      if (typeof enableOrNameAndArgs === "boolean") {
        this._addImplicitHelpCommand = enableOrNameAndArgs;
        if (enableOrNameAndArgs && this._defaultCommandGroup) {
          this._initCommandGroup(this._getHelpCommand());
        }
        return this;
      }
      const nameAndArgs = enableOrNameAndArgs ?? "help [command]";
      const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
      const helpDescription = description ?? "display help for command";
      const helpCommand = this.createCommand(helpName);
      helpCommand.helpOption(false);
      if (helpArgs)
        helpCommand.arguments(helpArgs);
      if (helpDescription)
        helpCommand.description(helpDescription);
      this._addImplicitHelpCommand = true;
      this._helpCommand = helpCommand;
      if (enableOrNameAndArgs || description)
        this._initCommandGroup(helpCommand);
      return this;
    }
    addHelpCommand(helpCommand, deprecatedDescription) {
      if (typeof helpCommand !== "object") {
        this.helpCommand(helpCommand, deprecatedDescription);
        return this;
      }
      this._addImplicitHelpCommand = true;
      this._helpCommand = helpCommand;
      this._initCommandGroup(helpCommand);
      return this;
    }
    _getHelpCommand() {
      const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
      if (hasImplicitHelpCommand) {
        if (this._helpCommand === undefined) {
          this.helpCommand(undefined, undefined);
        }
        return this._helpCommand;
      }
      return null;
    }
    hook(event, listener) {
      const allowedValues = ["preSubcommand", "preAction", "postAction"];
      if (!allowedValues.includes(event)) {
        throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      if (this._lifeCycleHooks[event]) {
        this._lifeCycleHooks[event].push(listener);
      } else {
        this._lifeCycleHooks[event] = [listener];
      }
      return this;
    }
    exitOverride(fn) {
      if (fn) {
        this._exitCallback = fn;
      } else {
        this._exitCallback = (err) => {
          if (err.code !== "commander.executeSubCommandAsync") {
            throw err;
          } else {}
        };
      }
      return this;
    }
    _exit(exitCode, code, message) {
      if (this._exitCallback) {
        this._exitCallback(new CommanderError(exitCode, code, message));
      }
      process2.exit(exitCode);
    }
    action(fn) {
      const listener = (args) => {
        const expectedArgsCount = this.registeredArguments.length;
        const actionArgs = args.slice(0, expectedArgsCount);
        if (this._storeOptionsAsProperties) {
          actionArgs[expectedArgsCount] = this;
        } else {
          actionArgs[expectedArgsCount] = this.opts();
        }
        actionArgs.push(this);
        return fn.apply(this, actionArgs);
      };
      this._actionHandler = listener;
      return this;
    }
    createOption(flags, description) {
      return new Option(flags, description);
    }
    _callParseArg(target, value, previous, invalidArgumentMessage) {
      try {
        return target.parseArg(value, previous);
      } catch (err) {
        if (err.code === "commander.invalidArgument") {
          const message = `${invalidArgumentMessage} ${err.message}`;
          this.error(message, { exitCode: err.exitCode, code: err.code });
        }
        throw err;
      }
    }
    _registerOption(option) {
      const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
      if (matchingOption) {
        const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
        throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
      }
      this._initOptionGroup(option);
      this.options.push(option);
    }
    _registerCommand(command) {
      const knownBy = (cmd) => {
        return [cmd.name()].concat(cmd.aliases());
      };
      const alreadyUsed = knownBy(command).find((name) => this._findCommand(name));
      if (alreadyUsed) {
        const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
        const newCmd = knownBy(command).join("|");
        throw new Error(`cannot add command '${newCmd}' as already have command '${existingCmd}'`);
      }
      this._initCommandGroup(command);
      this.commands.push(command);
    }
    addOption(option) {
      this._registerOption(option);
      const oname = option.name();
      const name = option.attributeName();
      if (option.negate) {
        const positiveLongFlag = option.long.replace(/^--no-/, "--");
        if (!this._findOption(positiveLongFlag)) {
          this.setOptionValueWithSource(name, option.defaultValue === undefined ? true : option.defaultValue, "default");
        }
      } else if (option.defaultValue !== undefined) {
        this.setOptionValueWithSource(name, option.defaultValue, "default");
      }
      const handleOptionValue = (val, invalidValueMessage, valueSource) => {
        if (val == null && option.presetArg !== undefined) {
          val = option.presetArg;
        }
        const oldValue = this.getOptionValue(name);
        if (val !== null && option.parseArg) {
          val = this._callParseArg(option, val, oldValue, invalidValueMessage);
        } else if (val !== null && option.variadic) {
          val = option._collectValue(val, oldValue);
        }
        if (val == null) {
          if (option.negate) {
            val = false;
          } else if (option.isBoolean() || option.optional) {
            val = true;
          } else {
            val = "";
          }
        }
        this.setOptionValueWithSource(name, val, valueSource);
      };
      this.on("option:" + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, "cli");
      });
      if (option.envVar) {
        this.on("optionEnv:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "env");
        });
      }
      return this;
    }
    _optionEx(config, flags, description, fn, defaultValue) {
      if (typeof flags === "object" && flags instanceof Option) {
        throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
      }
      const option = this.createOption(flags, description);
      option.makeOptionMandatory(!!config.mandatory);
      if (typeof fn === "function") {
        option.default(defaultValue).argParser(fn);
      } else if (fn instanceof RegExp) {
        const regex = fn;
        fn = (val, def) => {
          const m = regex.exec(val);
          return m ? m[0] : def;
        };
        option.default(defaultValue).argParser(fn);
      } else {
        option.default(fn);
      }
      return this.addOption(option);
    }
    option(flags, description, parseArg, defaultValue) {
      return this._optionEx({}, flags, description, parseArg, defaultValue);
    }
    requiredOption(flags, description, parseArg, defaultValue) {
      return this._optionEx({ mandatory: true }, flags, description, parseArg, defaultValue);
    }
    combineFlagAndOptionalValue(combine = true) {
      this._combineFlagAndOptionalValue = !!combine;
      return this;
    }
    allowUnknownOption(allowUnknown = true) {
      this._allowUnknownOption = !!allowUnknown;
      return this;
    }
    allowExcessArguments(allowExcess = true) {
      this._allowExcessArguments = !!allowExcess;
      return this;
    }
    enablePositionalOptions(positional = true) {
      this._enablePositionalOptions = !!positional;
      return this;
    }
    passThroughOptions(passThrough = true) {
      this._passThroughOptions = !!passThrough;
      this._checkForBrokenPassThrough();
      return this;
    }
    _checkForBrokenPassThrough() {
      if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
        throw new Error(`passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`);
      }
    }
    storeOptionsAsProperties(storeAsProperties = true) {
      if (this.options.length) {
        throw new Error("call .storeOptionsAsProperties() before adding options");
      }
      if (Object.keys(this._optionValues).length) {
        throw new Error("call .storeOptionsAsProperties() before setting option values");
      }
      this._storeOptionsAsProperties = !!storeAsProperties;
      return this;
    }
    getOptionValue(key) {
      if (this._storeOptionsAsProperties) {
        return this[key];
      }
      return this._optionValues[key];
    }
    setOptionValue(key, value) {
      return this.setOptionValueWithSource(key, value, undefined);
    }
    setOptionValueWithSource(key, value, source) {
      if (this._storeOptionsAsProperties) {
        this[key] = value;
      } else {
        this._optionValues[key] = value;
      }
      this._optionValueSources[key] = source;
      return this;
    }
    getOptionValueSource(key) {
      return this._optionValueSources[key];
    }
    getOptionValueSourceWithGlobals(key) {
      let source;
      this._getCommandAndAncestors().forEach((cmd) => {
        if (cmd.getOptionValueSource(key) !== undefined) {
          source = cmd.getOptionValueSource(key);
        }
      });
      return source;
    }
    _prepareUserArgs(argv, parseOptions) {
      if (argv !== undefined && !Array.isArray(argv)) {
        throw new Error("first parameter to parse must be array or undefined");
      }
      parseOptions = parseOptions || {};
      if (argv === undefined && parseOptions.from === undefined) {
        if (process2.versions?.electron) {
          parseOptions.from = "electron";
        }
        const execArgv = process2.execArgv ?? [];
        if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
          parseOptions.from = "eval";
        }
      }
      if (argv === undefined) {
        argv = process2.argv;
      }
      this.rawArgs = argv.slice();
      let userArgs;
      switch (parseOptions.from) {
        case undefined:
        case "node":
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
          break;
        case "electron":
          if (process2.defaultApp) {
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
          } else {
            userArgs = argv.slice(1);
          }
          break;
        case "user":
          userArgs = argv.slice(0);
          break;
        case "eval":
          userArgs = argv.slice(1);
          break;
        default:
          throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
      }
      if (!this._name && this._scriptPath)
        this.nameFromFilename(this._scriptPath);
      this._name = this._name || "program";
      return userArgs;
    }
    parse(argv, parseOptions) {
      this._prepareForParse();
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      this._parseCommand([], userArgs);
      return this;
    }
    async parseAsync(argv, parseOptions) {
      this._prepareForParse();
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      await this._parseCommand([], userArgs);
      return this;
    }
    _prepareForParse() {
      if (this._savedState === null) {
        this.saveStateBeforeParse();
      } else {
        this.restoreStateBeforeParse();
      }
    }
    saveStateBeforeParse() {
      this._savedState = {
        _name: this._name,
        _optionValues: { ...this._optionValues },
        _optionValueSources: { ...this._optionValueSources }
      };
    }
    restoreStateBeforeParse() {
      if (this._storeOptionsAsProperties)
        throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
      this._name = this._savedState._name;
      this._scriptPath = null;
      this.rawArgs = [];
      this._optionValues = { ...this._savedState._optionValues };
      this._optionValueSources = { ...this._savedState._optionValueSources };
      this.args = [];
      this.processedArgs = [];
    }
    _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
      if (fs2.existsSync(executableFile))
        return;
      const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
      const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
      throw new Error(executableMissing);
    }
    _executeSubCommand(subcommand, args) {
      args = args.slice();
      let launchWithNode = false;
      const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
      function findFile(baseDir, baseName) {
        const localBin = path3.resolve(baseDir, baseName);
        if (fs2.existsSync(localBin))
          return localBin;
        if (sourceExt.includes(path3.extname(baseName)))
          return;
        const foundExt = sourceExt.find((ext) => fs2.existsSync(`${localBin}${ext}`));
        if (foundExt)
          return `${localBin}${foundExt}`;
        return;
      }
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
      let executableDir = this._executableDir || "";
      if (this._scriptPath) {
        let resolvedScriptPath;
        try {
          resolvedScriptPath = fs2.realpathSync(this._scriptPath);
        } catch {
          resolvedScriptPath = this._scriptPath;
        }
        executableDir = path3.resolve(path3.dirname(resolvedScriptPath), executableDir);
      }
      if (executableDir) {
        let localFile = findFile(executableDir, executableFile);
        if (!localFile && !subcommand._executableFile && this._scriptPath) {
          const legacyName = path3.basename(this._scriptPath, path3.extname(this._scriptPath));
          if (legacyName !== this._name) {
            localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
          }
        }
        executableFile = localFile || executableFile;
      }
      launchWithNode = sourceExt.includes(path3.extname(executableFile));
      let proc;
      if (process2.platform !== "win32") {
        if (launchWithNode) {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
        } else {
          proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
        }
      } else {
        this._checkForMissingExecutable(executableFile, executableDir, subcommand._name);
        args.unshift(executableFile);
        args = incrementNodeInspectorPort(process2.execArgv).concat(args);
        proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
      }
      if (!proc.killed) {
        const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
        signals.forEach((signal) => {
          process2.on(signal, () => {
            if (proc.killed === false && proc.exitCode === null) {
              proc.kill(signal);
            }
          });
        });
      }
      const exitCallback = this._exitCallback;
      proc.on("close", (code) => {
        code = code ?? 1;
        if (!exitCallback) {
          process2.exit(code);
        } else {
          exitCallback(new CommanderError(code, "commander.executeSubCommandAsync", "(close)"));
        }
      });
      proc.on("error", (err) => {
        if (err.code === "ENOENT") {
          this._checkForMissingExecutable(executableFile, executableDir, subcommand._name);
        } else if (err.code === "EACCES") {
          throw new Error(`'${executableFile}' not executable`);
        }
        if (!exitCallback) {
          process2.exit(1);
        } else {
          const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
          wrappedError.nestedError = err;
          exitCallback(wrappedError);
        }
      });
      this.runningCommand = proc;
    }
    _dispatchSubcommand(commandName, operands, unknown) {
      const subCommand = this._findCommand(commandName);
      if (!subCommand)
        this.help({ error: true });
      subCommand._prepareForParse();
      let promiseChain;
      promiseChain = this._chainOrCallSubCommandHook(promiseChain, subCommand, "preSubcommand");
      promiseChain = this._chainOrCall(promiseChain, () => {
        if (subCommand._executableHandler) {
          this._executeSubCommand(subCommand, operands.concat(unknown));
        } else {
          return subCommand._parseCommand(operands, unknown);
        }
      });
      return promiseChain;
    }
    _dispatchHelpCommand(subcommandName) {
      if (!subcommandName) {
        this.help();
      }
      const subCommand = this._findCommand(subcommandName);
      if (subCommand && !subCommand._executableHandler) {
        subCommand.help();
      }
      return this._dispatchSubcommand(subcommandName, [], [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]);
    }
    _checkNumberOfArguments() {
      this.registeredArguments.forEach((arg, i) => {
        if (arg.required && this.args[i] == null) {
          this.missingArgument(arg.name());
        }
      });
      if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
        return;
      }
      if (this.args.length > this.registeredArguments.length) {
        this._excessArguments(this.args);
      }
    }
    _processArguments() {
      const myParseArg = (argument, value, previous) => {
        let parsedValue = value;
        if (value !== null && argument.parseArg) {
          const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
          parsedValue = this._callParseArg(argument, value, previous, invalidValueMessage);
        }
        return parsedValue;
      };
      this._checkNumberOfArguments();
      const processedArgs = [];
      this.registeredArguments.forEach((declaredArg, index) => {
        let value = declaredArg.defaultValue;
        if (declaredArg.variadic) {
          if (index < this.args.length) {
            value = this.args.slice(index);
            if (declaredArg.parseArg) {
              value = value.reduce((processed, v) => {
                return myParseArg(declaredArg, v, processed);
              }, declaredArg.defaultValue);
            }
          } else if (value === undefined) {
            value = [];
          }
        } else if (index < this.args.length) {
          value = this.args[index];
          if (declaredArg.parseArg) {
            value = myParseArg(declaredArg, value, declaredArg.defaultValue);
          }
        }
        processedArgs[index] = value;
      });
      this.processedArgs = processedArgs;
    }
    _chainOrCall(promise, fn) {
      if (promise?.then && typeof promise.then === "function") {
        return promise.then(() => fn());
      }
      return fn();
    }
    _chainOrCallHooks(promise, event) {
      let result = promise;
      const hooks = [];
      this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== undefined).forEach((hookedCommand) => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
      if (event === "postAction") {
        hooks.reverse();
      }
      hooks.forEach((hookDetail) => {
        result = this._chainOrCall(result, () => {
          return hookDetail.callback(hookDetail.hookedCommand, this);
        });
      });
      return result;
    }
    _chainOrCallSubCommandHook(promise, subCommand, event) {
      let result = promise;
      if (this._lifeCycleHooks[event] !== undefined) {
        this._lifeCycleHooks[event].forEach((hook) => {
          result = this._chainOrCall(result, () => {
            return hook(this, subCommand);
          });
        });
      }
      return result;
    }
    _parseCommand(operands, unknown) {
      const parsed = this.parseOptions(unknown);
      this._parseOptionsEnv();
      this._parseOptionsImplied();
      operands = operands.concat(parsed.operands);
      unknown = parsed.unknown;
      this.args = operands.concat(unknown);
      if (operands && this._findCommand(operands[0])) {
        return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
      }
      if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
        return this._dispatchHelpCommand(operands[1]);
      }
      if (this._defaultCommandName) {
        this._outputHelpIfRequested(unknown);
        return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
      }
      if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
        this.help({ error: true });
      }
      this._outputHelpIfRequested(parsed.unknown);
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      const checkForUnknownOptions = () => {
        if (parsed.unknown.length > 0) {
          this.unknownOption(parsed.unknown[0]);
        }
      };
      const commandEvent = `command:${this.name()}`;
      if (this._actionHandler) {
        checkForUnknownOptions();
        this._processArguments();
        let promiseChain;
        promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
        promiseChain = this._chainOrCall(promiseChain, () => this._actionHandler(this.processedArgs));
        if (this.parent) {
          promiseChain = this._chainOrCall(promiseChain, () => {
            this.parent.emit(commandEvent, operands, unknown);
          });
        }
        promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
        return promiseChain;
      }
      if (this.parent?.listenerCount(commandEvent)) {
        checkForUnknownOptions();
        this._processArguments();
        this.parent.emit(commandEvent, operands, unknown);
      } else if (operands.length) {
        if (this._findCommand("*")) {
          return this._dispatchSubcommand("*", operands, unknown);
        }
        if (this.listenerCount("command:*")) {
          this.emit("command:*", operands, unknown);
        } else if (this.commands.length) {
          this.unknownCommand();
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      } else if (this.commands.length) {
        checkForUnknownOptions();
        this.help({ error: true });
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    }
    _findCommand(name) {
      if (!name)
        return;
      return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
    }
    _findOption(arg) {
      return this.options.find((option) => option.is(arg));
    }
    _checkForMissingMandatoryOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd.options.forEach((anOption) => {
          if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === undefined) {
            cmd.missingMandatoryOptionValue(anOption);
          }
        });
      });
    }
    _checkForConflictingLocalOptions() {
      const definedNonDefaultOptions = this.options.filter((option) => {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === undefined) {
          return false;
        }
        return this.getOptionValueSource(optionKey) !== "default";
      });
      const optionsWithConflicting = definedNonDefaultOptions.filter((option) => option.conflictsWith.length > 0);
      optionsWithConflicting.forEach((option) => {
        const conflictingAndDefined = definedNonDefaultOptions.find((defined) => option.conflictsWith.includes(defined.attributeName()));
        if (conflictingAndDefined) {
          this._conflictingOption(option, conflictingAndDefined);
        }
      });
    }
    _checkForConflictingOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd._checkForConflictingLocalOptions();
      });
    }
    parseOptions(args) {
      const operands = [];
      const unknown = [];
      let dest = operands;
      function maybeOption(arg) {
        return arg.length > 1 && arg[0] === "-";
      }
      const negativeNumberArg = (arg) => {
        if (!/^-(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(arg))
          return false;
        return !this._getCommandAndAncestors().some((cmd) => cmd.options.map((opt) => opt.short).some((short) => /^-\d$/.test(short)));
      };
      let activeVariadicOption = null;
      let activeGroup = null;
      let i = 0;
      while (i < args.length || activeGroup) {
        const arg = activeGroup ?? args[i++];
        activeGroup = null;
        if (arg === "--") {
          if (dest === unknown)
            dest.push(arg);
          dest.push(...args.slice(i));
          break;
        }
        if (activeVariadicOption && (!maybeOption(arg) || negativeNumberArg(arg))) {
          this.emit(`option:${activeVariadicOption.name()}`, arg);
          continue;
        }
        activeVariadicOption = null;
        if (maybeOption(arg)) {
          const option = this._findOption(arg);
          if (option) {
            if (option.required) {
              const value = args[i++];
              if (value === undefined)
                this.optionMissingArgument(option);
              this.emit(`option:${option.name()}`, value);
            } else if (option.optional) {
              let value = null;
              if (i < args.length && (!maybeOption(args[i]) || negativeNumberArg(args[i]))) {
                value = args[i++];
              }
              this.emit(`option:${option.name()}`, value);
            } else {
              this.emit(`option:${option.name()}`);
            }
            activeVariadicOption = option.variadic ? option : null;
            continue;
          }
        }
        if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
          const option = this._findOption(`-${arg[1]}`);
          if (option) {
            if (option.required || option.optional && this._combineFlagAndOptionalValue) {
              this.emit(`option:${option.name()}`, arg.slice(2));
            } else {
              this.emit(`option:${option.name()}`);
              activeGroup = `-${arg.slice(2)}`;
            }
            continue;
          }
        }
        if (/^--[^=]+=/.test(arg)) {
          const index = arg.indexOf("=");
          const option = this._findOption(arg.slice(0, index));
          if (option && (option.required || option.optional)) {
            this.emit(`option:${option.name()}`, arg.slice(index + 1));
            continue;
          }
        }
        if (dest === operands && maybeOption(arg) && !(this.commands.length === 0 && negativeNumberArg(arg))) {
          dest = unknown;
        }
        if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
          if (this._findCommand(arg)) {
            operands.push(arg);
            unknown.push(...args.slice(i));
            break;
          } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
            operands.push(arg, ...args.slice(i));
            break;
          } else if (this._defaultCommandName) {
            unknown.push(arg, ...args.slice(i));
            break;
          }
        }
        if (this._passThroughOptions) {
          dest.push(arg, ...args.slice(i));
          break;
        }
        dest.push(arg);
      }
      return { operands, unknown };
    }
    opts() {
      if (this._storeOptionsAsProperties) {
        const result = {};
        const len = this.options.length;
        for (let i = 0;i < len; i++) {
          const key = this.options[i].attributeName();
          result[key] = key === this._versionOptionName ? this._version : this[key];
        }
        return result;
      }
      return this._optionValues;
    }
    optsWithGlobals() {
      return this._getCommandAndAncestors().reduce((combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()), {});
    }
    error(message, errorOptions) {
      this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
      if (typeof this._showHelpAfterError === "string") {
        this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
      } else if (this._showHelpAfterError) {
        this._outputConfiguration.writeErr(`
`);
        this.outputHelp({ error: true });
      }
      const config = errorOptions || {};
      const exitCode = config.exitCode || 1;
      const code = config.code || "commander.error";
      this._exit(exitCode, code, message);
    }
    _parseOptionsEnv() {
      this.options.forEach((option) => {
        if (option.envVar && option.envVar in process2.env) {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === undefined || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
            if (option.required || option.optional) {
              this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
            } else {
              this.emit(`optionEnv:${option.name()}`);
            }
          }
        }
      });
    }
    _parseOptionsImplied() {
      const dualHelper = new DualOptions(this.options);
      const hasCustomOptionValue = (optionKey) => {
        return this.getOptionValue(optionKey) !== undefined && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
      };
      this.options.filter((option) => option.implied !== undefined && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
        Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
          this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
        });
      });
    }
    missingArgument(name) {
      const message = `error: missing required argument '${name}'`;
      this.error(message, { code: "commander.missingArgument" });
    }
    optionMissingArgument(option) {
      const message = `error: option '${option.flags}' argument missing`;
      this.error(message, { code: "commander.optionMissingArgument" });
    }
    missingMandatoryOptionValue(option) {
      const message = `error: required option '${option.flags}' not specified`;
      this.error(message, { code: "commander.missingMandatoryOptionValue" });
    }
    _conflictingOption(option, conflictingOption) {
      const findBestOptionFromValue = (option2) => {
        const optionKey = option2.attributeName();
        const optionValue = this.getOptionValue(optionKey);
        const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
        const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
        if (negativeOption && (negativeOption.presetArg === undefined && optionValue === false || negativeOption.presetArg !== undefined && optionValue === negativeOption.presetArg)) {
          return negativeOption;
        }
        return positiveOption || option2;
      };
      const getErrorMessage = (option2) => {
        const bestOption = findBestOptionFromValue(option2);
        const optionKey = bestOption.attributeName();
        const source = this.getOptionValueSource(optionKey);
        if (source === "env") {
          return `environment variable '${bestOption.envVar}'`;
        }
        return `option '${bestOption.flags}'`;
      };
      const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
      this.error(message, { code: "commander.conflictingOption" });
    }
    unknownOption(flag) {
      if (this._allowUnknownOption)
        return;
      let suggestion = "";
      if (flag.startsWith("--") && this._showSuggestionAfterError) {
        let candidateFlags = [];
        let command = this;
        do {
          const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
          candidateFlags = candidateFlags.concat(moreFlags);
          command = command.parent;
        } while (command && !command._enablePositionalOptions);
        suggestion = suggestSimilar(flag, candidateFlags);
      }
      const message = `error: unknown option '${flag}'${suggestion}`;
      this.error(message, { code: "commander.unknownOption" });
    }
    _excessArguments(receivedArgs) {
      if (this._allowExcessArguments)
        return;
      const expected = this.registeredArguments.length;
      const s = expected === 1 ? "" : "s";
      const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
      const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
      this.error(message, { code: "commander.excessArguments" });
    }
    unknownCommand() {
      const unknownName = this.args[0];
      let suggestion = "";
      if (this._showSuggestionAfterError) {
        const candidateNames = [];
        this.createHelp().visibleCommands(this).forEach((command) => {
          candidateNames.push(command.name());
          if (command.alias())
            candidateNames.push(command.alias());
        });
        suggestion = suggestSimilar(unknownName, candidateNames);
      }
      const message = `error: unknown command '${unknownName}'${suggestion}`;
      this.error(message, { code: "commander.unknownCommand" });
    }
    version(str, flags, description) {
      if (str === undefined)
        return this._version;
      this._version = str;
      flags = flags || "-V, --version";
      description = description || "output the version number";
      const versionOption = this.createOption(flags, description);
      this._versionOptionName = versionOption.attributeName();
      this._registerOption(versionOption);
      this.on("option:" + versionOption.name(), () => {
        this._outputConfiguration.writeOut(`${str}
`);
        this._exit(0, "commander.version", str);
      });
      return this;
    }
    description(str, argsDescription) {
      if (str === undefined && argsDescription === undefined)
        return this._description;
      this._description = str;
      if (argsDescription) {
        this._argsDescription = argsDescription;
      }
      return this;
    }
    summary(str) {
      if (str === undefined)
        return this._summary;
      this._summary = str;
      return this;
    }
    alias(alias) {
      if (alias === undefined)
        return this._aliases[0];
      let command = this;
      if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
        command = this.commands[this.commands.length - 1];
      }
      if (alias === command._name)
        throw new Error("Command alias can't be the same as its name");
      const matchingCommand = this.parent?._findCommand(alias);
      if (matchingCommand) {
        const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
        throw new Error(`cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`);
      }
      command._aliases.push(alias);
      return this;
    }
    aliases(aliases) {
      if (aliases === undefined)
        return this._aliases;
      aliases.forEach((alias) => this.alias(alias));
      return this;
    }
    usage(str) {
      if (str === undefined) {
        if (this._usage)
          return this._usage;
        const args = this.registeredArguments.map((arg) => {
          return humanReadableArgName(arg);
        });
        return [].concat(this.options.length || this._helpOption !== null ? "[options]" : [], this.commands.length ? "[command]" : [], this.registeredArguments.length ? args : []).join(" ");
      }
      this._usage = str;
      return this;
    }
    name(str) {
      if (str === undefined)
        return this._name;
      this._name = str;
      return this;
    }
    helpGroup(heading) {
      if (heading === undefined)
        return this._helpGroupHeading ?? "";
      this._helpGroupHeading = heading;
      return this;
    }
    commandsGroup(heading) {
      if (heading === undefined)
        return this._defaultCommandGroup ?? "";
      this._defaultCommandGroup = heading;
      return this;
    }
    optionsGroup(heading) {
      if (heading === undefined)
        return this._defaultOptionGroup ?? "";
      this._defaultOptionGroup = heading;
      return this;
    }
    _initOptionGroup(option) {
      if (this._defaultOptionGroup && !option.helpGroupHeading)
        option.helpGroup(this._defaultOptionGroup);
    }
    _initCommandGroup(cmd) {
      if (this._defaultCommandGroup && !cmd.helpGroup())
        cmd.helpGroup(this._defaultCommandGroup);
    }
    nameFromFilename(filename) {
      this._name = path3.basename(filename, path3.extname(filename));
      return this;
    }
    executableDir(path4) {
      if (path4 === undefined)
        return this._executableDir;
      this._executableDir = path4;
      return this;
    }
    helpInformation(contextOptions) {
      const helper = this.createHelp();
      const context = this._getOutputContext(contextOptions);
      helper.prepareContext({
        error: context.error,
        helpWidth: context.helpWidth,
        outputHasColors: context.hasColors
      });
      const text = helper.formatHelp(this, helper);
      if (context.hasColors)
        return text;
      return this._outputConfiguration.stripColor(text);
    }
    _getOutputContext(contextOptions) {
      contextOptions = contextOptions || {};
      const error = !!contextOptions.error;
      let baseWrite;
      let hasColors;
      let helpWidth;
      if (error) {
        baseWrite = (str) => this._outputConfiguration.writeErr(str);
        hasColors = this._outputConfiguration.getErrHasColors();
        helpWidth = this._outputConfiguration.getErrHelpWidth();
      } else {
        baseWrite = (str) => this._outputConfiguration.writeOut(str);
        hasColors = this._outputConfiguration.getOutHasColors();
        helpWidth = this._outputConfiguration.getOutHelpWidth();
      }
      const write = (str) => {
        if (!hasColors)
          str = this._outputConfiguration.stripColor(str);
        return baseWrite(str);
      };
      return { error, write, hasColors, helpWidth };
    }
    outputHelp(contextOptions) {
      let deprecatedCallback;
      if (typeof contextOptions === "function") {
        deprecatedCallback = contextOptions;
        contextOptions = undefined;
      }
      const outputContext = this._getOutputContext(contextOptions);
      const eventContext = {
        error: outputContext.error,
        write: outputContext.write,
        command: this
      };
      this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
      this.emit("beforeHelp", eventContext);
      let helpInformation = this.helpInformation({ error: outputContext.error });
      if (deprecatedCallback) {
        helpInformation = deprecatedCallback(helpInformation);
        if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
          throw new Error("outputHelp callback must return a string or a Buffer");
        }
      }
      outputContext.write(helpInformation);
      if (this._getHelpOption()?.long) {
        this.emit(this._getHelpOption().long);
      }
      this.emit("afterHelp", eventContext);
      this._getCommandAndAncestors().forEach((command) => command.emit("afterAllHelp", eventContext));
    }
    helpOption(flags, description) {
      if (typeof flags === "boolean") {
        if (flags) {
          if (this._helpOption === null)
            this._helpOption = undefined;
          if (this._defaultOptionGroup) {
            this._initOptionGroup(this._getHelpOption());
          }
        } else {
          this._helpOption = null;
        }
        return this;
      }
      this._helpOption = this.createOption(flags ?? "-h, --help", description ?? "display help for command");
      if (flags || description)
        this._initOptionGroup(this._helpOption);
      return this;
    }
    _getHelpOption() {
      if (this._helpOption === undefined) {
        this.helpOption(undefined, undefined);
      }
      return this._helpOption;
    }
    addHelpOption(option) {
      this._helpOption = option;
      this._initOptionGroup(option);
      return this;
    }
    help(contextOptions) {
      this.outputHelp(contextOptions);
      let exitCode = Number(process2.exitCode ?? 0);
      if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
        exitCode = 1;
      }
      this._exit(exitCode, "commander.help", "(outputHelp)");
    }
    addHelpText(position, text) {
      const allowedValues = ["beforeAll", "before", "after", "afterAll"];
      if (!allowedValues.includes(position)) {
        throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      const helpEvent = `${position}Help`;
      this.on(helpEvent, (context) => {
        let helpStr;
        if (typeof text === "function") {
          helpStr = text({ error: context.error, command: context.command });
        } else {
          helpStr = text;
        }
        if (helpStr) {
          context.write(`${helpStr}
`);
        }
      });
      return this;
    }
    _outputHelpIfRequested(args) {
      const helpOption = this._getHelpOption();
      const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
      if (helpRequested) {
        this.outputHelp();
        this._exit(0, "commander.helpDisplayed", "(outputHelp)");
      }
    }
  }
  function incrementNodeInspectorPort(args) {
    return args.map((arg) => {
      if (!arg.startsWith("--inspect")) {
        return arg;
      }
      let debugOption;
      let debugHost = "127.0.0.1";
      let debugPort = "9229";
      let match;
      if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
        debugOption = match[1];
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
        debugOption = match[1];
        if (/^\d+$/.test(match[3])) {
          debugPort = match[3];
        } else {
          debugHost = match[3];
        }
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
        debugOption = match[1];
        debugHost = match[3];
        debugPort = match[4];
      }
      if (debugOption && debugPort !== "0") {
        return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
      }
      return arg;
    });
  }
  function useColor() {
    if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
      return false;
    if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== undefined)
      return true;
    return;
  }
  exports.Command = Command;
  exports.useColor = useColor;
});

// node_modules/.bun/commander@14.0.2/node_modules/commander/index.js
var require_commander = __commonJS((exports) => {
  var { Argument } = require_argument();
  var { Command } = require_command();
  var { CommanderError, InvalidArgumentError } = require_error();
  var { Help } = require_help();
  var { Option } = require_option();
  exports.program = new Command;
  exports.createCommand = (name) => new Command(name);
  exports.createOption = (flags, description) => new Option(flags, description);
  exports.createArgument = (name, description) => new Argument(name, description);
  exports.Command = Command;
  exports.Option = Option;
  exports.Argument = Argument;
  exports.Help = Help;
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
  exports.InvalidOptionArgumentError = InvalidArgumentError;
});

// node_modules/.bun/ini@6.0.0/node_modules/ini/lib/ini.js
var require_ini = __commonJS((exports, module) => {
  var { hasOwnProperty } = Object.prototype;
  var encode = (obj, opt = {}) => {
    if (typeof opt === "string") {
      opt = { section: opt };
    }
    opt.align = opt.align === true;
    opt.newline = opt.newline === true;
    opt.sort = opt.sort === true;
    opt.whitespace = opt.whitespace === true || opt.align === true;
    opt.platform = opt.platform || typeof process !== "undefined" && process.platform;
    opt.bracketedArray = opt.bracketedArray !== false;
    const eol = opt.platform === "win32" ? `\r
` : `
`;
    const separator = opt.whitespace ? " = " : "=";
    const children = [];
    const keys = opt.sort ? Object.keys(obj).sort() : Object.keys(obj);
    let padToChars = 0;
    if (opt.align) {
      padToChars = safe(keys.filter((k) => obj[k] === null || Array.isArray(obj[k]) || typeof obj[k] !== "object").map((k) => Array.isArray(obj[k]) ? `${k}[]` : k).concat([""]).reduce((a, b) => safe(a).length >= safe(b).length ? a : b)).length;
    }
    let out = "";
    const arraySuffix = opt.bracketedArray ? "[]" : "";
    for (const k of keys) {
      const val = obj[k];
      if (val && Array.isArray(val)) {
        for (const item of val) {
          out += safe(`${k}${arraySuffix}`).padEnd(padToChars, " ") + separator + safe(item) + eol;
        }
      } else if (val && typeof val === "object") {
        children.push(k);
      } else {
        out += safe(k).padEnd(padToChars, " ") + separator + safe(val) + eol;
      }
    }
    if (opt.section && out.length) {
      out = "[" + safe(opt.section) + "]" + (opt.newline ? eol + eol : eol) + out;
    }
    for (const k of children) {
      const nk = splitSections(k, ".").join("\\.");
      const section = (opt.section ? opt.section + "." : "") + nk;
      const child = encode(obj[k], {
        ...opt,
        section
      });
      if (out.length && child.length) {
        out += eol;
      }
      out += child;
    }
    return out;
  };
  function splitSections(str, separator) {
    var lastMatchIndex = 0;
    var lastSeparatorIndex = 0;
    var nextIndex = 0;
    var sections = [];
    do {
      nextIndex = str.indexOf(separator, lastMatchIndex);
      if (nextIndex !== -1) {
        lastMatchIndex = nextIndex + separator.length;
        if (nextIndex > 0 && str[nextIndex - 1] === "\\") {
          continue;
        }
        sections.push(str.slice(lastSeparatorIndex, nextIndex));
        lastSeparatorIndex = nextIndex + separator.length;
      }
    } while (nextIndex !== -1);
    sections.push(str.slice(lastSeparatorIndex));
    return sections;
  }
  var decode = (str, opt = {}) => {
    opt.bracketedArray = opt.bracketedArray !== false;
    const out = Object.create(null);
    let p = out;
    let section = null;
    const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i;
    const lines = str.split(/[\r\n]+/g);
    const duplicates = {};
    for (const line of lines) {
      if (!line || line.match(/^\s*[;#]/) || line.match(/^\s*$/)) {
        continue;
      }
      const match = line.match(re);
      if (!match) {
        continue;
      }
      if (match[1] !== undefined) {
        section = unsafe(match[1]);
        if (section === "__proto__") {
          p = Object.create(null);
          continue;
        }
        p = out[section] = out[section] || Object.create(null);
        continue;
      }
      const keyRaw = unsafe(match[2]);
      let isArray;
      if (opt.bracketedArray) {
        isArray = keyRaw.length > 2 && keyRaw.slice(-2) === "[]";
      } else {
        duplicates[keyRaw] = (duplicates?.[keyRaw] || 0) + 1;
        isArray = duplicates[keyRaw] > 1;
      }
      const key = isArray && keyRaw.endsWith("[]") ? keyRaw.slice(0, -2) : keyRaw;
      if (key === "__proto__") {
        continue;
      }
      const valueRaw = match[3] ? unsafe(match[4]) : true;
      const value = valueRaw === "true" || valueRaw === "false" || valueRaw === "null" ? JSON.parse(valueRaw) : valueRaw;
      if (isArray) {
        if (!hasOwnProperty.call(p, key)) {
          p[key] = [];
        } else if (!Array.isArray(p[key])) {
          p[key] = [p[key]];
        }
      }
      if (Array.isArray(p[key])) {
        p[key].push(value);
      } else {
        p[key] = value;
      }
    }
    const remove = [];
    for (const k of Object.keys(out)) {
      if (!hasOwnProperty.call(out, k) || typeof out[k] !== "object" || Array.isArray(out[k])) {
        continue;
      }
      const parts = splitSections(k, ".");
      p = out;
      const l = parts.pop();
      const nl = l.replace(/\\\./g, ".");
      for (const part of parts) {
        if (part === "__proto__") {
          continue;
        }
        if (!hasOwnProperty.call(p, part) || typeof p[part] !== "object") {
          p[part] = Object.create(null);
        }
        p = p[part];
      }
      if (p === out && nl === l) {
        continue;
      }
      p[nl] = out[k];
      remove.push(k);
    }
    for (const del of remove) {
      delete out[del];
    }
    return out;
  };
  var isQuoted = (val) => {
    return val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'");
  };
  var safe = (val) => {
    if (typeof val !== "string" || val.match(/[=\r\n]/) || val.match(/^\[/) || val.length > 1 && isQuoted(val) || val !== val.trim()) {
      return JSON.stringify(val);
    }
    return val.split(";").join("\\;").split("#").join("\\#");
  };
  var unsafe = (val) => {
    val = (val || "").trim();
    if (isQuoted(val)) {
      if (val.charAt(0) === "'") {
        val = val.slice(1, -1);
      }
      try {
        val = JSON.parse(val);
      } catch {}
    } else {
      let esc = false;
      let unesc = "";
      for (let i = 0, l = val.length;i < l; i++) {
        const c = val.charAt(i);
        if (esc) {
          if ("\\;#".indexOf(c) !== -1) {
            unesc += c;
          } else {
            unesc += "\\" + c;
          }
          esc = false;
        } else if (";#".indexOf(c) !== -1) {
          break;
        } else if (c === "\\") {
          esc = true;
        } else {
          unesc += c;
        }
      }
      if (esc) {
        unesc += "\\";
      }
      return unesc.trim();
    }
    return val;
  };
  module.exports = {
    parse: decode,
    decode,
    stringify: encode,
    encode,
    safe,
    unsafe
  };
});

// node_modules/.bun/cli-width@4.1.0/node_modules/cli-width/index.js
var require_cli_width = __commonJS((exports, module) => {
  module.exports = cliWidth;
  function normalizeOpts(options) {
    const defaultOpts = {
      defaultWidth: 0,
      output: process.stdout,
      tty: __require("tty")
    };
    if (!options) {
      return defaultOpts;
    }
    Object.keys(defaultOpts).forEach(function(key) {
      if (!options[key]) {
        options[key] = defaultOpts[key];
      }
    });
    return options;
  }
  function cliWidth(options) {
    const opts = normalizeOpts(options);
    if (opts.output.getWindowSize) {
      return opts.output.getWindowSize()[0] || opts.defaultWidth;
    }
    if (opts.tty.getWindowSize) {
      return opts.tty.getWindowSize()[1] || opts.defaultWidth;
    }
    if (opts.output.columns) {
      return opts.output.columns;
    }
    if (process.env.CLI_WIDTH) {
      const width = parseInt(process.env.CLI_WIDTH, 10);
      if (!isNaN(width) && width !== 0) {
        return width;
      }
    }
    return opts.defaultWidth;
  }
});

// node_modules/.bun/mute-stream@3.0.0/node_modules/mute-stream/lib/index.js
var require_lib = __commonJS((exports, module) => {
  var Stream = __require("stream");

  class MuteStream extends Stream {
    #isTTY = null;
    constructor(opts = {}) {
      super(opts);
      this.writable = this.readable = true;
      this.muted = false;
      this.on("pipe", this._onpipe);
      this.replace = opts.replace;
      this._prompt = opts.prompt || null;
      this._hadControl = false;
    }
    #destSrc(key, def) {
      if (this._dest) {
        return this._dest[key];
      }
      if (this._src) {
        return this._src[key];
      }
      return def;
    }
    #proxy(method, ...args) {
      if (typeof this._dest?.[method] === "function") {
        this._dest[method](...args);
      }
      if (typeof this._src?.[method] === "function") {
        this._src[method](...args);
      }
    }
    get isTTY() {
      if (this.#isTTY !== null) {
        return this.#isTTY;
      }
      return this.#destSrc("isTTY", false);
    }
    set isTTY(val) {
      this.#isTTY = val;
    }
    get rows() {
      return this.#destSrc("rows");
    }
    get columns() {
      return this.#destSrc("columns");
    }
    mute() {
      this.muted = true;
    }
    unmute() {
      this.muted = false;
    }
    _onpipe(src2) {
      this._src = src2;
    }
    pipe(dest, options) {
      this._dest = dest;
      return super.pipe(dest, options);
    }
    pause() {
      if (this._src) {
        return this._src.pause();
      }
    }
    resume() {
      if (this._src) {
        return this._src.resume();
      }
    }
    write(c) {
      if (this.muted) {
        if (!this.replace) {
          return true;
        }
        if (c.match(/^\u001b/)) {
          if (c.indexOf(this._prompt) === 0) {
            c = c.slice(this._prompt.length);
            c = c.replace(/./g, this.replace);
            c = this._prompt + c;
          }
          this._hadControl = true;
          return this.emit("data", c);
        } else {
          if (this._prompt && this._hadControl && c.indexOf(this._prompt) === 0) {
            this._hadControl = false;
            this.emit("data", this._prompt);
            c = c.slice(this._prompt.length);
          }
          c = c.toString().replace(/./g, this.replace);
        }
      }
      this.emit("data", c);
    }
    end(c) {
      if (this.muted) {
        if (c && this.replace) {
          c = c.toString().replace(/./g, this.replace);
        } else {
          c = null;
        }
      }
      if (c) {
        this.emit("data", c);
      }
      this.emit("end");
    }
    destroy(...args) {
      return this.#proxy("destroy", ...args);
    }
    destroySoon(...args) {
      return this.#proxy("destroySoon", ...args);
    }
    close(...args) {
      return this.#proxy("close", ...args);
    }
  }
  module.exports = MuteStream;
});

// src/main.ts
var import_dotenv = __toESM(require_main(), 1);
import * as path5 from "path";

// packages/core/src/constance/index.ts
import * as path2 from "path";
// package.json
var version = "2.0.0";

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/node/m.process.js
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync, exec } from "child_process";

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/m.common.js
var getType = (value) => {
  const typeResult = Object.prototype.toString.call(value);
  const type = typeResult.slice(typeResult.indexOf(" ") + 1, -1).toLocaleLowerCase();
  if (type === "array") {
    if (Array.isArray(value))
      return "array";
    else
      return null;
  }
  return type;
};
var isType = (value, type) => {
  const valueType = getType(value);
  if (valueType === null)
    throw new Error("invalid value...");
  if (typeof type === "string")
    return valueType === type.toLocaleLowerCase();
  return type.map((item) => item.toLocaleLowerCase()).includes(valueType);
};

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/m.string.js
var findString = (str, ident, absolute = false) => {
  if (isType(ident, "array")) {
    const findFunction = absolute ? (item) => !str.includes(item) : (item) => str.includes(item);
    const result = ident.find(findFunction);
    return absolute ? !result : !!result;
  }
  return !!str.includes(ident);
};

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/node/m.process.js
var __dirname = "F:\\vanner\\node_modules\\.bun\\mv-common@1.2.4\\node_modules\\mv-common\\node";
var execCommand = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    const commandList = command.split(" "), spawnOption = Object.assign({
      shell: true,
      encoding: "utf8",
      cwd: process.cwd()
    }, options);
    if (!fs.existsSync(spawnOption.cwd || ""))
      return reject("exec command cwd is not exists...");
    const result = spawnSync(commandList[0], commandList.slice(1), spawnOption);
    const stdout = result.stdout?.trim?.();
    const error = result.error || result.stderr;
    if (error && findString(error, ["error", "Error", "fatal:"]))
      return reject(error);
    else
      return resolve(stdout);
  });
};
var getSystemInfo = () => {
  const platform = process.platform;
  const systemDigit = process.arch;
  return {
    platform,
    digit: systemDigit,
    isWindow: platform === "win32",
    isMac: platform === "darwin",
    isWin64: systemDigit === "x64",
    isWin32: systemDigit !== "x64"
  };
};
var getHome = () => {
  return os.homedir();
};
var getAppData = () => {
  const homedir = getHome();
  return getSystemInfo().isWindow ? path.resolve(homedir, "AppData/Roaming") : getSystemInfo().isMac ? path.join(homedir, "/") : path.resolve(__dirname);
};

// packages/core/src/constance/index.ts
var import_pkg = __toESM(require_mv_common(), 1);
var app_description = "\u4E00\u6B3E\u53EF\u5BF9\u9879\u76EE\u3001\u4F9D\u8D56\u3001\u4ED3\u5E93\u3001\u6A21\u677F\u8FDB\u884C\u4FBF\u6377\u5F0F\u7684\u547D\u4EE4\u884C\u5DE5\u5177";
var package_manger_view = {
  npm: "package-lock.json",
  yarn: "yarn.lock",
  pnpm: "pnpm-lock.yaml",
  bun: "bun.lock"
};
var commit_type_list = {
  feat: "\u65B0\u529F\u80FD\u5F00\u53D1",
  fix: "\u4FEE\u590D\u95EE\u9898",
  docs: "\u65B0\u589E\u6587\u6863\u6CE8\u91CA",
  style: "\u65B0\u589E\u4EE3\u7801\u683C\u5F0F(\u4E0D\u5F71\u54CD\u4EE3\u7801\u8FD0\u884C\u7684\u53D8\u52A8)",
  refactor: "\u91CD\u6784\u6216\u4F18\u5316\u4EE3\u7801",
  perf: "\u5BF9\u4EE3\u7801\u8FDB\u884C\u6027\u80FD\u4F18\u5316",
  test: "\u589E\u52A0\u6D4B\u8BD5",
  chore: "\u6784\u5EFA\u8FC7\u7A0B\u6216\u8F85\u52A9\u5DE5\u5177\u7684\u8C03\u6574",
  revert: "\u4EE3\u7801\u56DE\u9000"
};
var support_exec_file = [".js", ".ts", ".html"];
var app_config = {
  app_version: version,
  app_description
};
var support_package_manger_name = Object.keys(package_manger_view);
var app_cache_path = () => path2.resolve(getAppData(), process.env.APP_NAME);
var config_cache_dir = () => path2.resolve(app_cache_path(), ".Cache/config");
var config_tool_file_path = () => path2.resolve(config_cache_dir(), "config.ini");
var config_pkg_manger_file_path = () => path2.resolve(config_cache_dir(), "pkg_manager.ini");
var config_tl_file_path = () => path2.resolve(config_cache_dir(), "tl.ini");
var config_default_option = {
  main_branch: {
    value: "main/master",
    require: (val) => !val.split("/").find((it) => !["main", "master"].includes(it)),
    error: "\u503C\u53EA\u80FD\u8BBE\u7F6E\u4E3Amain/master",
    description: "\u4E3B\u5206\u652F\u540D\u79F0\uFF0C\u8BBE\u7F6E\u591A\u4E2A\u65F6\uFF0C\u901A\u8FC7'/'\u9694\u5F00\uFF0C\u7528\u4E8Etag\u6807\u7B7E"
  },
  mirror_registry: {
    value: "https://registry.npmmirror.com/",
    require: (val) => import_pkg.isValidUrl(val),
    error: `\u503C\u53EA\u80FD\u8BBE\u7F6E\u4E3A\u4E00\u4E2A\u6709\u6548\u7684http\u6216https\u94FE\u63A5\u5730\u5740`,
    description: "\u5305\u7BA1\u7406\u5668\u6267\u884C\u65F6\u7684\u4EE3\u7406\u955C\u50CF"
  },
  package_cli: {
    value: "npm",
    require: (val) => support_package_manger_name.includes(val),
    error: `\u53EA\u80FD\u8BBE\u7F6E\u4E3A\uFF1A${support_package_manger_name.join("\u3001")} \u7684\u4E00\u79CD`,
    description: "\u9ED8\u8BA4\u7684\u5305\u7BA1\u7406\u5668\u540D\u79F0\uFF08\u9879\u76EE\u4E2D\u7684lock\u6587\u4EF6\u6743\u91CD\u5927\u4E8E\u6B64\u503C\u7684\u8BBE\u7F6E\uFF09"
  },
  unknown_pkg_ask: {
    value: true,
    require: (val) => ["true", "false"].includes(val),
    error: `\u53EA\u80FD\u8BBE\u7F6E\u4E3A\uFF1A${["true", "false"].join("\u3001")} \u7684\u4E00\u79CD`,
    description: "\u9047\u5230\u672A\u77E5\u5305\u7BA1\u7406\u5668\u65F6\uFF0C\u662F\u5426\u8BE2\u95EE\u7528\u6237\uFF08true\uFF1A\u8BE2\u95EE\u3001false: \uFF08\u4F7F\u7528 package_cli \u8BBE\u7F6E\u7684\u503C\uFF09\uFF09"
  },
  install_use_mirror: {
    value: false,
    require: (val) => ["true", "false"].includes(val),
    error: `\u53EA\u80FD\u8BBE\u7F6E\u4E3A\uFF1A${["true", "false"].join("\u3001")} \u7684\u4E00\u79CD`,
    description: "\u88C5\u5305\u65F6\uFF0C\u9ED8\u8BA4\u662F\u5426\u4F7F\u7528 mirror_registry\u7684\u503C\u4F5C\u4E3A\u5B89\u88C5\u955C\u50CF\uFF08\u7528\u6237\u5728\u547D\u4EE4\u884C\u4E2D\u8F93\u5165\u7684 --registry \u6743\u91CD\u5927\u4E8E\u5F53\u524D\u503C\u7684\u8BBE\u7F6E\uFF09"
  },
  publish_npm: {
    value: false,
    require: (val) => ["true", "false"].includes(val),
    error: `\u53EA\u80FD\u8BBE\u7F6E\u4E3A\uFF1A${["true", "false"].join("\u3001")} \u7684\u4E00\u79CD`,
    description: "publish \u65F6\u662F\u5426\u53D1\u5E03\u81F3 npm"
  }
};

// packages/core/src/command/main.ts
var import_pkg3 = __toESM(require_mv_common(), 1);

// node_modules/.bun/commander@14.0.2/node_modules/commander/esm.mjs
var import__ = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  Command,
  Argument,
  Option,
  Help
} = import__.default;

// packages/core/src/register.ts
class SingleCommandRegister {
  usage(program2, content) {
    return program2.usage(content);
  }
  version(program2, version2) {
    return program2.version(version2);
  }
  command(program2, command) {
    return program2.command(command);
  }
  description(program2, description) {
    return program2.description(description);
  }
  allowUnknownOption(program2) {
    return program2.allowUnknownOption();
  }
  option(program2, option) {
    option.forEach((item) => {
      const hideHelp = item.hideHelp;
      program2 = program2.addOption(hideHelp ? new Option(item.command, item.description).hideHelp() : new Option(item.command, item.description));
    });
    return program2;
  }
  action(program2, action) {
    return program2.action((...rest) => {
      if (action instanceof Function) {
        action(...rest);
      } else {
        action.start(...rest);
      }
    });
  }
}

class RegisterCommand extends SingleCommandRegister {
  program;
  #commandOption;
  #singleRegister = new Map([
    [this.usage, "usage"],
    [this.version, "version"],
    [this.command, "command"],
    [this.description, "description"],
    [this.option, "option"],
    [this.action, "action"],
    [this.allowUnknownOption, "allowUnknownOption"]
  ]);
  constructor(props) {
    super();
    this.program = new Command;
    this.#commandOption = props.commandOption();
  }
  commandGlobalCatch(cb) {
    return this.program.action(cb);
  }
  registerChildrenCommand(program2, item) {
    const registerConfig = () => {
      let config = new Command(item.command);
      delete item.command;
      config = this.registerCommand(config, item);
      for (const child of item.children) {
        this.registerCommand(config, child);
      }
      return config;
    };
    program2.addCommand(registerConfig());
  }
  registerCommand(program2, item) {
    for (const [handler, command] of this.#singleRegister) {
      if (item[command]) {
        program2 = handler(program2, item[command]);
      }
    }
    return program2;
  }
  register() {
    if (!Array.isArray(this.#commandOption))
      throw new Error("\u6CE8\u518C\u547D\u4EE4\u7684\u914D\u7F6E\u9009\u9879\u5FC5\u987B\u4E3A\u6570\u7EC4");
    for (const item of this.#commandOption) {
      if (item.children) {
        this.registerChildrenCommand(this.program, item);
      } else {
        this.registerCommand(this.program, item);
      }
    }
    this.program.on("command:*", () => this.program.outputHelp());
    this.program.parse(process.argv);
  }
}

// packages/common/src/runtime.ts
import * as path4 from "path";
import { existsSync } from "fs";

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/node/m.file.js
import fs2 from "fs";
import path3 from "path";

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/external/vendor-ZVB4LWnE.js
var src = { exports: {} };
(function(module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.isPlainObject = exports.clone = exports.recursive = exports.merge = exports.main = undefined;
  module.exports = exports = main;
  exports.default = main;
  function main() {
    var items = [];
    for (var _i = 0;_i < arguments.length; _i++) {
      items[_i] = arguments[_i];
    }
    return merge.apply(undefined, items);
  }
  exports.main = main;
  main.clone = clone;
  main.isPlainObject = isPlainObject;
  main.recursive = recursive;
  function merge() {
    var items = [];
    for (var _i = 0;_i < arguments.length; _i++) {
      items[_i] = arguments[_i];
    }
    return _merge(items[0] === true, false, items);
  }
  exports.merge = merge;
  function recursive() {
    var items = [];
    for (var _i = 0;_i < arguments.length; _i++) {
      items[_i] = arguments[_i];
    }
    return _merge(items[0] === true, true, items);
  }
  exports.recursive = recursive;
  function clone(input) {
    if (Array.isArray(input)) {
      var output = [];
      for (var index = 0;index < input.length; ++index)
        output.push(clone(input[index]));
      return output;
    } else if (isPlainObject(input)) {
      var output = {};
      for (var index in input)
        output[index] = clone(input[index]);
      return output;
    } else {
      return input;
    }
  }
  exports.clone = clone;
  function isPlainObject(input) {
    return input && typeof input === "object" && !Array.isArray(input);
  }
  exports.isPlainObject = isPlainObject;
  function _recursiveMerge(base, extend) {
    if (!isPlainObject(base))
      return extend;
    for (var key in extend) {
      if (key === "__proto__" || key === "constructor" || key === "prototype")
        continue;
      base[key] = isPlainObject(base[key]) && isPlainObject(extend[key]) ? _recursiveMerge(base[key], extend[key]) : extend[key];
    }
    return base;
  }
  function _merge(isClone, isRecursive, items) {
    var result;
    if (isClone || !isPlainObject(result = items.shift()))
      result = {};
    for (var index = 0;index < items.length; ++index) {
      var item = items[index];
      if (!isPlainObject(item))
        continue;
      for (var key in item) {
        if (key === "__proto__" || key === "constructor" || key === "prototype")
          continue;
        var value = isClone ? clone(item[key]) : item[key];
        result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
      }
    }
    return result;
  }
})(src, src.exports);
var srcExports = src.exports;

// node_modules/.bun/mv-common@1.2.4/node_modules/mv-common/node/m.file.js
var createDir = (targetPath, cover = false) => {
  if (fs2.existsSync(targetPath)) {
    if (!cover)
      return;
    fs2.rmSync(targetPath, { recursive: true });
  }
  fs2.mkdirSync(targetPath, { recursive: true });
};
var createFile = (targetPath, content, cover = false) => {
  if (fs2.existsSync(targetPath)) {
    if (!cover)
      return;
    fs2.unlinkSync(targetPath);
  }
  const dirPathName = path3.dirname(targetPath);
  if (!fs2.existsSync(dirPathName))
    createDir(dirPathName);
  fs2.writeFileSync(targetPath, content, { encoding: "utf-8" });
};
var readExistsFile = (targetPath, options = {}) => {
  if (!fs2.existsSync(targetPath))
    return "";
  return fs2.readFileSync(targetPath, options);
};
var isDriveDirectory = (targetPath) => {
  targetPath = path3.resolve(targetPath);
  return targetPath === path3.parse(targetPath).root;
};
var parentExecHandlerPromise = (targetPath, cb) => {
  return new Promise((resolve2) => {
    if (isDriveDirectory(targetPath))
      return resolve2("");
    const recursionExecHandler = () => resolve2(parentExecHandlerPromise(path3.dirname(targetPath), cb));
    if (isType(cb, "asyncfunction")) {
      cb(targetPath).then((result) => {
        if (!result)
          throw new Error("");
        return resolve2(result);
      }).catch(() => {
        return recursionExecHandler();
      });
    } else {
      try {
        const result = cb(targetPath);
        if (result)
          return resolve2(result);
        else
          throw new Error("");
      } catch (e) {
        return recursionExecHandler();
      }
    }
  });
};
var findParentFile = (targetPath, handler) => {
  return parentExecHandlerPromise(targetPath, async (cwd) => {
    let result = null;
    if (isType(handler, "string")) {
      result = fs2.existsSync(path3.resolve(cwd, handler));
    } else if (isType(handler, "function")) {
      result = handler(cwd);
    } else if (isType(handler, "asyncfunction")) {
      result = await handler(cwd);
    } else {
      throw new Error("invalid handler parameter");
    }
    return result ? cwd : result;
  });
};

// packages/common/src/runtime.ts
var setRuntimeConfig = (key, value) => {
  if (Array.isArray(key)) {
    for (const item of key) {
      const envKey = `${process.env.APP_NAME}_${item.key.toLocaleLowerCase()}`;
      process.env[envKey] = item.value;
    }
  } else {
    const envKey = `${process.env.APP_NAME}_${key.toLocaleLowerCase()}`;
    process.env[envKey] = value;
  }
};
var getRuntimeConfig = (key) => {
  if (Array.isArray(key)) {
    return key.reduce((pre, next) => {
      pre[next] = process.env[`${process.env.APP_NAME}_${next.toLocaleLowerCase()}`];
      return pre;
    }, {});
  }
  return process.env[`${process.env.APP_NAME}_${key.toLocaleLowerCase()}`];
};
var setRuntimeFlag = (key, value) => {
  setRuntimeConfig(key, value);
};
var getRuntimeFlag = (key) => {
  return getRuntimeConfig(key);
};
var getPackageMangerName = (targetPath = process.cwd()) => {
  for (const key in package_manger_view) {
    const value = package_manger_view[key];
    if (existsSync(path4.resolve(targetPath, value))) {
      return key;
    }
  }
};
var execProjectCommandInCwd = async (cli, cwd, command) => {
  const runStr = ["bun", "npm"].includes(cli) ? "run" : "";
  command = `${cli} ${runStr}${runStr ? " " : ""}${command}`;
  await execCommand(command, {
    cwd
  });
};
var searchCwdPath = async (filename) => {
  const cwd = await findParentFile(process.cwd(), filename);
  if (!cwd)
    throw new Error("\u5F53\u524D\u76EE\u5F55\u53CA\u7236\u7EA7\u76EE\u5F55\u4E0D\u662F\u4E00\u4E2A\u53EF\u6267\u884C\u76EE\u5F55\uFF01");
  return cwd;
};
// packages/common/src/platform.ts
var nodeVersion = async () => {
  try {
    const result = await execCommand("node -v");
    return result?.slice(1);
  } catch (e) {
    return "";
  }
};
var bunVersion = async () => {
  try {
    const result = await execCommand("bun -v");
    return result?.slice(1);
  } catch (e) {
    return "";
  }
};
var checkSystem = async () => {
  const { isWindow } = getSystemInfo();
  if (!isWindow)
    throw new Error(`\u5F53\u524D\u5DE5\u5177\u4EC5\u652F\u6301\u7684\u7CFB\u7EDF\u5E73\u53F0\u6709\uFF1A${process.env.APP_SUPPORT_SYSTEM}`);
  const git = await hasGit();
  setRuntimeFlag("RUNTIME_GIT" /* git */, String(git ? 1 : 0));
  const nodeVer = await nodeVersion();
  const bunVer = await bunVersion();
  if (nodeVer && bunVer) {
    return;
  }
  if (!nodeVer && !bunVer) {
    throw new Error("\u672A\u68C0\u6D4B\u5230Node\u4E14Bun\u73AF\u5883\uFF0C\u81F3\u5C11\u5B89\u88C5\u4E00\u4E2A\uFF1ANode\u3001Bun");
  }
  setRuntimeFlag("RUNTIME_CLI" /* cli */, bunVer ? "bun" : "node");
};
var createCacheDir = () => {
  const appDataPath = getAppData();
  if (!appDataPath) {
    throw new Error("\u5DE5\u5177\u7F13\u5B58\u76EE\u5F55\u521B\u5EFA\u5931\u8D25");
  }
  createDir(app_cache_path(), false);
};
// packages/common/src/util.ts
var import_pkg2 = __toESM(require_mv_common(), 1);
var filterObject = (value, filterList) => {
  if (!import_pkg2.isType(value, "object") || !import_pkg2.isType(value, "array"))
    return value;
  const newVal = {};
  for (const key in value) {
    if (!filterList.includes(key))
      newVal[key] = value[key];
  }
  return newVal;
};
var arrayExecSyncHandler = (cb, options) => {
  if (!Array.isArray(options))
    return cb(options);
  return new Promise(async (resolve3) => {
    const value = {};
    for (const item of options) {
      const val = await cb(item);
      value[item.name] = val;
    }
    return resolve3(value);
  });
};
// packages/common/src/git.ts
var isValidGitUrl = (url) => {
  return url.includes(".git") && url.length > 10;
};
var hasGit = async () => {
  const result = await execCommand("git -v", {
    stdio: ["ignore", "pipe", "pipe"]
  });
  return result.includes("git version");
};
var getStorageProjectName = (url) => {
  if (!isValidGitUrl(url))
    return "";
  return url.match(/[\/:]([^\/]+?)(?:\.git)?$/)?.[1]?.trim();
};
// packages/module/config/index.ts
var import_ini = __toESM(require_ini(), 1);
class Config {
  data = new Map;
  #sourcePath;
  #defaultContent;
  constructor({ sourcePath, defaultContent = {} }) {
    this.#sourcePath = sourcePath;
    this.#defaultContent = defaultContent || {};
    this.#load();
  }
  #resetOptionConfig(parseContent = {}) {
    if (Object.keys(parseContent)?.length) {
      this.data.clear();
      Object.entries(parseContent).forEach(([key, value]) => {
        this.data.set(key, value);
      });
    }
    this.save();
  }
  #writeNotExistsDefaultData() {
    Object.keys(this.#defaultContent).forEach((key) => {
      if (!this.data.has(key)) {
        this.data.set(key, this.#defaultContent[key]);
      }
    });
    this.save();
  }
  #load() {
    createFile(this.#sourcePath, import_ini.default.stringify(this.#defaultContent).trim());
    this.#resetOptionConfig(import_ini.default.parse(readExistsFile(this.#sourcePath).toString()));
    this.#writeNotExistsDefaultData();
  }
  has(key) {
    return this.data.has(key);
  }
  get(key) {
    return this.data.get(key);
  }
  set(key, value) {
    if (!value) {
      return this.delete(key);
    } else {
      this.data.set(key, value);
    }
    this.save();
  }
  delete(key) {
    if (!this.has(key))
      return;
    this.data.delete(key);
    this.save();
  }
  reset() {
    createFile(`${config_tool_file_path()}.${Date.now()}`, import_ini.default.stringify(Object.fromEntries(this.data)).trim(), true);
    this.#resetOptionConfig(this.#defaultContent);
  }
  save() {
    createFile(this.#sourcePath, this.stringify(), true);
  }
  list() {
    return Object.fromEntries(this.data);
  }
  stringify() {
    return import_ini.default.stringify(this.list(), {
      align: true,
      whitespace: true,
      bracketedArray: false
    }).trim();
  }
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/key.js
var isUpKey = (key, keybindings = []) => key.name === "up" || keybindings.includes("vim") && key.name === "k" || keybindings.includes("emacs") && key.ctrl && key.name === "p";
var isDownKey = (key, keybindings = []) => key.name === "down" || keybindings.includes("vim") && key.name === "j" || keybindings.includes("emacs") && key.ctrl && key.name === "n";
var isSpaceKey = (key) => key.name === "space";
var isBackspaceKey = (key) => key.name === "backspace";
var isTabKey = (key) => key.name === "tab";
var isNumberKey = (key) => "1234567890".includes(key.name);
var isEnterKey = (key) => key.name === "enter" || key.name === "return";
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/errors.js
class AbortPromptError extends Error {
  name = "AbortPromptError";
  message = "Prompt was aborted";
  constructor(options) {
    super();
    this.cause = options?.cause;
  }
}

class CancelPromptError extends Error {
  name = "CancelPromptError";
  message = "Prompt was canceled";
}

class ExitPromptError extends Error {
  name = "ExitPromptError";
}

class HookError extends Error {
  name = "HookError";
}

class ValidationError extends Error {
  name = "ValidationError";
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/use-state.js
import { AsyncResource as AsyncResource2 } from "async_hooks";

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/hook-engine.js
import { AsyncLocalStorage, AsyncResource } from "async_hooks";
var hookStorage = new AsyncLocalStorage;
function createStore(rl) {
  const store = {
    rl,
    hooks: [],
    hooksCleanup: [],
    hooksEffect: [],
    index: 0,
    handleChange() {}
  };
  return store;
}
function withHooks(rl, cb) {
  const store = createStore(rl);
  return hookStorage.run(store, () => {
    function cycle(render) {
      store.handleChange = () => {
        store.index = 0;
        render();
      };
      store.handleChange();
    }
    return cb(cycle);
  });
}
function getStore() {
  const store = hookStorage.getStore();
  if (!store) {
    throw new HookError("[Inquirer] Hook functions can only be called from within a prompt");
  }
  return store;
}
function readline() {
  return getStore().rl;
}
function withUpdates(fn) {
  const wrapped = (...args) => {
    const store = getStore();
    let shouldUpdate = false;
    const oldHandleChange = store.handleChange;
    store.handleChange = () => {
      shouldUpdate = true;
    };
    const returnValue = fn(...args);
    if (shouldUpdate) {
      oldHandleChange();
    }
    store.handleChange = oldHandleChange;
    return returnValue;
  };
  return AsyncResource.bind(wrapped);
}
function withPointer(cb) {
  const store = getStore();
  const { index } = store;
  const pointer = {
    get() {
      return store.hooks[index];
    },
    set(value) {
      store.hooks[index] = value;
    },
    initialized: index in store.hooks
  };
  const returnValue = cb(pointer);
  store.index++;
  return returnValue;
}
function handleChange() {
  getStore().handleChange();
}
var effectScheduler = {
  queue(cb) {
    const store = getStore();
    const { index } = store;
    store.hooksEffect.push(() => {
      store.hooksCleanup[index]?.();
      const cleanFn = cb(readline());
      if (cleanFn != null && typeof cleanFn !== "function") {
        throw new ValidationError("useEffect return value must be a cleanup function or nothing.");
      }
      store.hooksCleanup[index] = cleanFn;
    });
  },
  run() {
    const store = getStore();
    withUpdates(() => {
      store.hooksEffect.forEach((effect) => {
        effect();
      });
      store.hooksEffect.length = 0;
    })();
  },
  clearAll() {
    const store = getStore();
    store.hooksCleanup.forEach((cleanFn) => {
      cleanFn?.();
    });
    store.hooksEffect.length = 0;
    store.hooksCleanup.length = 0;
  }
};

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/use-state.js
function useState(defaultValue) {
  return withPointer((pointer) => {
    const setState = AsyncResource2.bind(function setState(newValue) {
      if (pointer.get() !== newValue) {
        pointer.set(newValue);
        handleChange();
      }
    });
    if (pointer.initialized) {
      return [pointer.get(), setState];
    }
    const value = typeof defaultValue === "function" ? defaultValue() : defaultValue;
    pointer.set(value);
    return [value, setState];
  });
}

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/use-effect.js
function useEffect(cb, depArray) {
  withPointer((pointer) => {
    const oldDeps = pointer.get();
    const hasChanged = !Array.isArray(oldDeps) || depArray.some((dep, i) => !Object.is(dep, oldDeps[i]));
    if (hasChanged) {
      effectScheduler.queue(cb);
    }
    pointer.set(depArray);
  });
}

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/theme.js
import { styleText } from "util";

// node_modules/.bun/@inquirer+figures@2.0.2/node_modules/@inquirer/figures/dist/index.js
import process2 from "process";
function isUnicodeSupported() {
  if (process2.platform !== "win32") {
    return process2.env["TERM"] !== "linux";
  }
  return Boolean(process2.env["WT_SESSION"]) || Boolean(process2.env["TERMINUS_SUBLIME"]) || process2.env["ConEmuTask"] === "{cmd::Cmder}" || process2.env["TERM_PROGRAM"] === "Terminus-Sublime" || process2.env["TERM_PROGRAM"] === "vscode" || process2.env["TERM"] === "xterm-256color" || process2.env["TERM"] === "alacritty" || process2.env["TERMINAL_EMULATOR"] === "JetBrains-JediTerm";
}
var common = {
  circleQuestionMark: "(?)",
  questionMarkPrefix: "(?)",
  square: "\u2588",
  squareDarkShade: "\u2593",
  squareMediumShade: "\u2592",
  squareLightShade: "\u2591",
  squareTop: "\u2580",
  squareBottom: "\u2584",
  squareLeft: "\u258C",
  squareRight: "\u2590",
  squareCenter: "\u25A0",
  bullet: "\u25CF",
  dot: "\u2024",
  ellipsis: "\u2026",
  pointerSmall: "\u203A",
  triangleUp: "\u25B2",
  triangleUpSmall: "\u25B4",
  triangleDown: "\u25BC",
  triangleDownSmall: "\u25BE",
  triangleLeftSmall: "\u25C2",
  triangleRightSmall: "\u25B8",
  home: "\u2302",
  heart: "\u2665",
  musicNote: "\u266A",
  musicNoteBeamed: "\u266B",
  arrowUp: "\u2191",
  arrowDown: "\u2193",
  arrowLeft: "\u2190",
  arrowRight: "\u2192",
  arrowLeftRight: "\u2194",
  arrowUpDown: "\u2195",
  almostEqual: "\u2248",
  notEqual: "\u2260",
  lessOrEqual: "\u2264",
  greaterOrEqual: "\u2265",
  identical: "\u2261",
  infinity: "\u221E",
  subscriptZero: "\u2080",
  subscriptOne: "\u2081",
  subscriptTwo: "\u2082",
  subscriptThree: "\u2083",
  subscriptFour: "\u2084",
  subscriptFive: "\u2085",
  subscriptSix: "\u2086",
  subscriptSeven: "\u2087",
  subscriptEight: "\u2088",
  subscriptNine: "\u2089",
  oneHalf: "\xBD",
  oneThird: "\u2153",
  oneQuarter: "\xBC",
  oneFifth: "\u2155",
  oneSixth: "\u2159",
  oneEighth: "\u215B",
  twoThirds: "\u2154",
  twoFifths: "\u2156",
  threeQuarters: "\xBE",
  threeFifths: "\u2157",
  threeEighths: "\u215C",
  fourFifths: "\u2158",
  fiveSixths: "\u215A",
  fiveEighths: "\u215D",
  sevenEighths: "\u215E",
  line: "\u2500",
  lineBold: "\u2501",
  lineDouble: "\u2550",
  lineDashed0: "\u2504",
  lineDashed1: "\u2505",
  lineDashed2: "\u2508",
  lineDashed3: "\u2509",
  lineDashed4: "\u254C",
  lineDashed5: "\u254D",
  lineDashed6: "\u2574",
  lineDashed7: "\u2576",
  lineDashed8: "\u2578",
  lineDashed9: "\u257A",
  lineDashed10: "\u257C",
  lineDashed11: "\u257E",
  lineDashed12: "\u2212",
  lineDashed13: "\u2013",
  lineDashed14: "\u2010",
  lineDashed15: "\u2043",
  lineVertical: "\u2502",
  lineVerticalBold: "\u2503",
  lineVerticalDouble: "\u2551",
  lineVerticalDashed0: "\u2506",
  lineVerticalDashed1: "\u2507",
  lineVerticalDashed2: "\u250A",
  lineVerticalDashed3: "\u250B",
  lineVerticalDashed4: "\u254E",
  lineVerticalDashed5: "\u254F",
  lineVerticalDashed6: "\u2575",
  lineVerticalDashed7: "\u2577",
  lineVerticalDashed8: "\u2579",
  lineVerticalDashed9: "\u257B",
  lineVerticalDashed10: "\u257D",
  lineVerticalDashed11: "\u257F",
  lineDownLeft: "\u2510",
  lineDownLeftArc: "\u256E",
  lineDownBoldLeftBold: "\u2513",
  lineDownBoldLeft: "\u2512",
  lineDownLeftBold: "\u2511",
  lineDownDoubleLeftDouble: "\u2557",
  lineDownDoubleLeft: "\u2556",
  lineDownLeftDouble: "\u2555",
  lineDownRight: "\u250C",
  lineDownRightArc: "\u256D",
  lineDownBoldRightBold: "\u250F",
  lineDownBoldRight: "\u250E",
  lineDownRightBold: "\u250D",
  lineDownDoubleRightDouble: "\u2554",
  lineDownDoubleRight: "\u2553",
  lineDownRightDouble: "\u2552",
  lineUpLeft: "\u2518",
  lineUpLeftArc: "\u256F",
  lineUpBoldLeftBold: "\u251B",
  lineUpBoldLeft: "\u251A",
  lineUpLeftBold: "\u2519",
  lineUpDoubleLeftDouble: "\u255D",
  lineUpDoubleLeft: "\u255C",
  lineUpLeftDouble: "\u255B",
  lineUpRight: "\u2514",
  lineUpRightArc: "\u2570",
  lineUpBoldRightBold: "\u2517",
  lineUpBoldRight: "\u2516",
  lineUpRightBold: "\u2515",
  lineUpDoubleRightDouble: "\u255A",
  lineUpDoubleRight: "\u2559",
  lineUpRightDouble: "\u2558",
  lineUpDownLeft: "\u2524",
  lineUpBoldDownBoldLeftBold: "\u252B",
  lineUpBoldDownBoldLeft: "\u2528",
  lineUpDownLeftBold: "\u2525",
  lineUpBoldDownLeftBold: "\u2529",
  lineUpDownBoldLeftBold: "\u252A",
  lineUpDownBoldLeft: "\u2527",
  lineUpBoldDownLeft: "\u2526",
  lineUpDoubleDownDoubleLeftDouble: "\u2563",
  lineUpDoubleDownDoubleLeft: "\u2562",
  lineUpDownLeftDouble: "\u2561",
  lineUpDownRight: "\u251C",
  lineUpBoldDownBoldRightBold: "\u2523",
  lineUpBoldDownBoldRight: "\u2520",
  lineUpDownRightBold: "\u251D",
  lineUpBoldDownRightBold: "\u2521",
  lineUpDownBoldRightBold: "\u2522",
  lineUpDownBoldRight: "\u251F",
  lineUpBoldDownRight: "\u251E",
  lineUpDoubleDownDoubleRightDouble: "\u2560",
  lineUpDoubleDownDoubleRight: "\u255F",
  lineUpDownRightDouble: "\u255E",
  lineDownLeftRight: "\u252C",
  lineDownBoldLeftBoldRightBold: "\u2533",
  lineDownLeftBoldRightBold: "\u252F",
  lineDownBoldLeftRight: "\u2530",
  lineDownBoldLeftBoldRight: "\u2531",
  lineDownBoldLeftRightBold: "\u2532",
  lineDownLeftRightBold: "\u252E",
  lineDownLeftBoldRight: "\u252D",
  lineDownDoubleLeftDoubleRightDouble: "\u2566",
  lineDownDoubleLeftRight: "\u2565",
  lineDownLeftDoubleRightDouble: "\u2564",
  lineUpLeftRight: "\u2534",
  lineUpBoldLeftBoldRightBold: "\u253B",
  lineUpLeftBoldRightBold: "\u2537",
  lineUpBoldLeftRight: "\u2538",
  lineUpBoldLeftBoldRight: "\u2539",
  lineUpBoldLeftRightBold: "\u253A",
  lineUpLeftRightBold: "\u2536",
  lineUpLeftBoldRight: "\u2535",
  lineUpDoubleLeftDoubleRightDouble: "\u2569",
  lineUpDoubleLeftRight: "\u2568",
  lineUpLeftDoubleRightDouble: "\u2567",
  lineUpDownLeftRight: "\u253C",
  lineUpBoldDownBoldLeftBoldRightBold: "\u254B",
  lineUpDownBoldLeftBoldRightBold: "\u2548",
  lineUpBoldDownLeftBoldRightBold: "\u2547",
  lineUpBoldDownBoldLeftRightBold: "\u254A",
  lineUpBoldDownBoldLeftBoldRight: "\u2549",
  lineUpBoldDownLeftRight: "\u2540",
  lineUpDownBoldLeftRight: "\u2541",
  lineUpDownLeftBoldRight: "\u253D",
  lineUpDownLeftRightBold: "\u253E",
  lineUpBoldDownBoldLeftRight: "\u2542",
  lineUpDownLeftBoldRightBold: "\u253F",
  lineUpBoldDownLeftBoldRight: "\u2543",
  lineUpBoldDownLeftRightBold: "\u2544",
  lineUpDownBoldLeftBoldRight: "\u2545",
  lineUpDownBoldLeftRightBold: "\u2546",
  lineUpDoubleDownDoubleLeftDoubleRightDouble: "\u256C",
  lineUpDoubleDownDoubleLeftRight: "\u256B",
  lineUpDownLeftDoubleRightDouble: "\u256A",
  lineCross: "\u2573",
  lineBackslash: "\u2572",
  lineSlash: "\u2571"
};
var specialMainSymbols = {
  tick: "\u2714",
  info: "\u2139",
  warning: "\u26A0",
  cross: "\u2718",
  squareSmall: "\u25FB",
  squareSmallFilled: "\u25FC",
  circle: "\u25EF",
  circleFilled: "\u25C9",
  circleDotted: "\u25CC",
  circleDouble: "\u25CE",
  circleCircle: "\u24DE",
  circleCross: "\u24E7",
  circlePipe: "\u24BE",
  radioOn: "\u25C9",
  radioOff: "\u25EF",
  checkboxOn: "\u2612",
  checkboxOff: "\u2610",
  checkboxCircleOn: "\u24E7",
  checkboxCircleOff: "\u24BE",
  pointer: "\u276F",
  triangleUpOutline: "\u25B3",
  triangleLeft: "\u25C0",
  triangleRight: "\u25B6",
  lozenge: "\u25C6",
  lozengeOutline: "\u25C7",
  hamburger: "\u2630",
  smiley: "\u32E1",
  mustache: "\u0DF4",
  star: "\u2605",
  play: "\u25B6",
  nodejs: "\u2B22",
  oneSeventh: "\u2150",
  oneNinth: "\u2151",
  oneTenth: "\u2152"
};
var specialFallbackSymbols = {
  tick: "\u221A",
  info: "i",
  warning: "\u203C",
  cross: "\xD7",
  squareSmall: "\u25A1",
  squareSmallFilled: "\u25A0",
  circle: "( )",
  circleFilled: "(*)",
  circleDotted: "( )",
  circleDouble: "( )",
  circleCircle: "(\u25CB)",
  circleCross: "(\xD7)",
  circlePipe: "(\u2502)",
  radioOn: "(*)",
  radioOff: "( )",
  checkboxOn: "[\xD7]",
  checkboxOff: "[ ]",
  checkboxCircleOn: "(\xD7)",
  checkboxCircleOff: "( )",
  pointer: ">",
  triangleUpOutline: "\u2206",
  triangleLeft: "\u25C4",
  triangleRight: "\u25BA",
  lozenge: "\u2666",
  lozengeOutline: "\u25CA",
  hamburger: "\u2261",
  smiley: "\u263A",
  mustache: "\u250C\u2500\u2510",
  star: "\u2736",
  play: "\u25BA",
  nodejs: "\u2666",
  oneSeventh: "1/7",
  oneNinth: "1/9",
  oneTenth: "1/10"
};
var mainSymbols = {
  ...common,
  ...specialMainSymbols
};
var fallbackSymbols = {
  ...common,
  ...specialFallbackSymbols
};
var shouldUseMain = isUnicodeSupported();
var figures = shouldUseMain ? mainSymbols : fallbackSymbols;
var dist_default = figures;
var replacements = Object.entries(specialMainSymbols);

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/theme.js
var defaultTheme = {
  prefix: {
    idle: styleText("blue", "?"),
    done: styleText("green", dist_default.tick)
  },
  spinner: {
    interval: 80,
    frames: ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"].map((frame) => styleText("yellow", frame))
  },
  style: {
    answer: (text) => styleText("cyan", text),
    message: (text) => styleText("bold", text),
    error: (text) => styleText("red", `> ${text}`),
    defaultAnswer: (text) => styleText("dim", `(${text})`),
    help: (text) => styleText("dim", text),
    highlight: (text) => styleText("cyan", text),
    key: (text) => styleText("cyan", styleText("bold", `<${text}>`))
  }
};

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/make-theme.js
function isPlainObject(value) {
  if (typeof value !== "object" || value === null)
    return false;
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
}
function deepMerge(...objects) {
  const output = {};
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      const prevValue = output[key];
      output[key] = isPlainObject(prevValue) && isPlainObject(value) ? deepMerge(prevValue, value) : value;
    }
  }
  return output;
}
function makeTheme(...themes) {
  const themesToMerge = [
    defaultTheme,
    ...themes.filter((theme) => theme != null)
  ];
  return deepMerge(...themesToMerge);
}

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/use-prefix.js
function usePrefix({ status = "idle", theme }) {
  const [showLoader, setShowLoader] = useState(false);
  const [tick, setTick] = useState(0);
  const { prefix, spinner } = makeTheme(theme);
  useEffect(() => {
    if (status === "loading") {
      let tickInterval;
      let inc = -1;
      const delayTimeout = setTimeout(() => {
        setShowLoader(true);
        tickInterval = setInterval(() => {
          inc = inc + 1;
          setTick(inc % spinner.frames.length);
        }, spinner.interval);
      }, 300);
      return () => {
        clearTimeout(delayTimeout);
        clearInterval(tickInterval);
      };
    } else {
      setShowLoader(false);
    }
  }, [status]);
  if (showLoader) {
    return spinner.frames[tick];
  }
  const iconName = status === "loading" ? "idle" : status;
  return typeof prefix === "string" ? prefix : prefix[iconName] ?? prefix["idle"];
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/use-memo.js
function useMemo(fn, dependencies) {
  return withPointer((pointer) => {
    const prev = pointer.get();
    if (!prev || prev.dependencies.length !== dependencies.length || prev.dependencies.some((dep, i) => dep !== dependencies[i])) {
      const value = fn();
      pointer.set({ value, dependencies });
      return value;
    }
    return prev.value;
  });
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/use-ref.js
function useRef(val) {
  return useState({ current: val })[0];
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/use-keypress.js
function useKeypress(userHandler) {
  const signal = useRef(userHandler);
  signal.current = userHandler;
  useEffect((rl) => {
    let ignore = false;
    const handler = withUpdates((_input, event) => {
      if (ignore)
        return;
      signal.current(event, rl);
    });
    rl.input.on("keypress", handler);
    return () => {
      ignore = true;
      rl.input.removeListener("keypress", handler);
    };
  }, []);
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/utils.js
var import_cli_width = __toESM(require_cli_width(), 1);

// node_modules/.bun/ansi-regex@6.2.2/node_modules/ansi-regex/index.js
function ansiRegex({ onlyFirst = false } = {}) {
  const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";
  const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;
  const csi = "[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]";
  const pattern = `${osc}|${csi}`;
  return new RegExp(pattern, onlyFirst ? undefined : "g");
}

// node_modules/.bun/strip-ansi@7.1.2/node_modules/strip-ansi/index.js
var regex = ansiRegex();
function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }
  return string.replace(regex, "");
}

// node_modules/.bun/get-east-asian-width@1.4.0/node_modules/get-east-asian-width/lookup.js
function isAmbiguous(x) {
  return x === 161 || x === 164 || x === 167 || x === 168 || x === 170 || x === 173 || x === 174 || x >= 176 && x <= 180 || x >= 182 && x <= 186 || x >= 188 && x <= 191 || x === 198 || x === 208 || x === 215 || x === 216 || x >= 222 && x <= 225 || x === 230 || x >= 232 && x <= 234 || x === 236 || x === 237 || x === 240 || x === 242 || x === 243 || x >= 247 && x <= 250 || x === 252 || x === 254 || x === 257 || x === 273 || x === 275 || x === 283 || x === 294 || x === 295 || x === 299 || x >= 305 && x <= 307 || x === 312 || x >= 319 && x <= 322 || x === 324 || x >= 328 && x <= 331 || x === 333 || x === 338 || x === 339 || x === 358 || x === 359 || x === 363 || x === 462 || x === 464 || x === 466 || x === 468 || x === 470 || x === 472 || x === 474 || x === 476 || x === 593 || x === 609 || x === 708 || x === 711 || x >= 713 && x <= 715 || x === 717 || x === 720 || x >= 728 && x <= 731 || x === 733 || x === 735 || x >= 768 && x <= 879 || x >= 913 && x <= 929 || x >= 931 && x <= 937 || x >= 945 && x <= 961 || x >= 963 && x <= 969 || x === 1025 || x >= 1040 && x <= 1103 || x === 1105 || x === 8208 || x >= 8211 && x <= 8214 || x === 8216 || x === 8217 || x === 8220 || x === 8221 || x >= 8224 && x <= 8226 || x >= 8228 && x <= 8231 || x === 8240 || x === 8242 || x === 8243 || x === 8245 || x === 8251 || x === 8254 || x === 8308 || x === 8319 || x >= 8321 && x <= 8324 || x === 8364 || x === 8451 || x === 8453 || x === 8457 || x === 8467 || x === 8470 || x === 8481 || x === 8482 || x === 8486 || x === 8491 || x === 8531 || x === 8532 || x >= 8539 && x <= 8542 || x >= 8544 && x <= 8555 || x >= 8560 && x <= 8569 || x === 8585 || x >= 8592 && x <= 8601 || x === 8632 || x === 8633 || x === 8658 || x === 8660 || x === 8679 || x === 8704 || x === 8706 || x === 8707 || x === 8711 || x === 8712 || x === 8715 || x === 8719 || x === 8721 || x === 8725 || x === 8730 || x >= 8733 && x <= 8736 || x === 8739 || x === 8741 || x >= 8743 && x <= 8748 || x === 8750 || x >= 8756 && x <= 8759 || x === 8764 || x === 8765 || x === 8776 || x === 8780 || x === 8786 || x === 8800 || x === 8801 || x >= 8804 && x <= 8807 || x === 8810 || x === 8811 || x === 8814 || x === 8815 || x === 8834 || x === 8835 || x === 8838 || x === 8839 || x === 8853 || x === 8857 || x === 8869 || x === 8895 || x === 8978 || x >= 9312 && x <= 9449 || x >= 9451 && x <= 9547 || x >= 9552 && x <= 9587 || x >= 9600 && x <= 9615 || x >= 9618 && x <= 9621 || x === 9632 || x === 9633 || x >= 9635 && x <= 9641 || x === 9650 || x === 9651 || x === 9654 || x === 9655 || x === 9660 || x === 9661 || x === 9664 || x === 9665 || x >= 9670 && x <= 9672 || x === 9675 || x >= 9678 && x <= 9681 || x >= 9698 && x <= 9701 || x === 9711 || x === 9733 || x === 9734 || x === 9737 || x === 9742 || x === 9743 || x === 9756 || x === 9758 || x === 9792 || x === 9794 || x === 9824 || x === 9825 || x >= 9827 && x <= 9829 || x >= 9831 && x <= 9834 || x === 9836 || x === 9837 || x === 9839 || x === 9886 || x === 9887 || x === 9919 || x >= 9926 && x <= 9933 || x >= 9935 && x <= 9939 || x >= 9941 && x <= 9953 || x === 9955 || x === 9960 || x === 9961 || x >= 9963 && x <= 9969 || x === 9972 || x >= 9974 && x <= 9977 || x === 9979 || x === 9980 || x === 9982 || x === 9983 || x === 10045 || x >= 10102 && x <= 10111 || x >= 11094 && x <= 11097 || x >= 12872 && x <= 12879 || x >= 57344 && x <= 63743 || x >= 65024 && x <= 65039 || x === 65533 || x >= 127232 && x <= 127242 || x >= 127248 && x <= 127277 || x >= 127280 && x <= 127337 || x >= 127344 && x <= 127373 || x === 127375 || x === 127376 || x >= 127387 && x <= 127404 || x >= 917760 && x <= 917999 || x >= 983040 && x <= 1048573 || x >= 1048576 && x <= 1114109;
}
function isFullWidth(x) {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
}
function isWide(x) {
  return x >= 4352 && x <= 4447 || x === 8986 || x === 8987 || x === 9001 || x === 9002 || x >= 9193 && x <= 9196 || x === 9200 || x === 9203 || x === 9725 || x === 9726 || x === 9748 || x === 9749 || x >= 9776 && x <= 9783 || x >= 9800 && x <= 9811 || x === 9855 || x >= 9866 && x <= 9871 || x === 9875 || x === 9889 || x === 9898 || x === 9899 || x === 9917 || x === 9918 || x === 9924 || x === 9925 || x === 9934 || x === 9940 || x === 9962 || x === 9970 || x === 9971 || x === 9973 || x === 9978 || x === 9981 || x === 9989 || x === 9994 || x === 9995 || x === 10024 || x === 10060 || x === 10062 || x >= 10067 && x <= 10069 || x === 10071 || x >= 10133 && x <= 10135 || x === 10160 || x === 10175 || x === 11035 || x === 11036 || x === 11088 || x === 11093 || x >= 11904 && x <= 11929 || x >= 11931 && x <= 12019 || x >= 12032 && x <= 12245 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12353 && x <= 12438 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12773 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 42124 || x >= 42128 && x <= 42182 || x >= 43360 && x <= 43388 || x >= 44032 && x <= 55203 || x >= 63744 && x <= 64255 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 94176 && x <= 94180 || x >= 94192 && x <= 94198 || x >= 94208 && x <= 101589 || x >= 101631 && x <= 101662 || x >= 101760 && x <= 101874 || x >= 110576 && x <= 110579 || x >= 110581 && x <= 110587 || x === 110589 || x === 110590 || x >= 110592 && x <= 110882 || x === 110898 || x >= 110928 && x <= 110930 || x === 110933 || x >= 110948 && x <= 110951 || x >= 110960 && x <= 111355 || x >= 119552 && x <= 119638 || x >= 119648 && x <= 119670 || x === 126980 || x === 127183 || x === 127374 || x >= 127377 && x <= 127386 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x === 127568 || x === 127569 || x >= 127584 && x <= 127589 || x >= 127744 && x <= 127776 || x >= 127789 && x <= 127797 || x >= 127799 && x <= 127868 || x >= 127870 && x <= 127891 || x >= 127904 && x <= 127946 || x >= 127951 && x <= 127955 || x >= 127968 && x <= 127984 || x === 127988 || x >= 127992 && x <= 128062 || x === 128064 || x >= 128066 && x <= 128252 || x >= 128255 && x <= 128317 || x >= 128331 && x <= 128334 || x >= 128336 && x <= 128359 || x === 128378 || x === 128405 || x === 128406 || x === 128420 || x >= 128507 && x <= 128591 || x >= 128640 && x <= 128709 || x === 128716 || x >= 128720 && x <= 128722 || x >= 128725 && x <= 128728 || x >= 128732 && x <= 128735 || x === 128747 || x === 128748 || x >= 128756 && x <= 128764 || x >= 128992 && x <= 129003 || x === 129008 || x >= 129292 && x <= 129338 || x >= 129340 && x <= 129349 || x >= 129351 && x <= 129535 || x >= 129648 && x <= 129660 || x >= 129664 && x <= 129674 || x >= 129678 && x <= 129734 || x === 129736 || x >= 129741 && x <= 129756 || x >= 129759 && x <= 129770 || x >= 129775 && x <= 129784 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
}

// node_modules/.bun/get-east-asian-width@1.4.0/node_modules/get-east-asian-width/index.js
function validate(codePoint) {
  if (!Number.isSafeInteger(codePoint)) {
    throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
  }
}
function eastAsianWidth(codePoint, { ambiguousAsWide = false } = {}) {
  validate(codePoint);
  if (isFullWidth(codePoint) || isWide(codePoint) || ambiguousAsWide && isAmbiguous(codePoint)) {
    return 2;
  }
  return 1;
}

// node_modules/.bun/emoji-regex@10.6.0/node_modules/emoji-regex/index.mjs
var emoji_regex_default = () => {
  return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
};

// node_modules/.bun/string-width@7.2.0/node_modules/string-width/index.js
var segmenter = new Intl.Segmenter;
var defaultIgnorableCodePointRegex = /^\p{Default_Ignorable_Code_Point}$/u;
function stringWidth(string, options = {}) {
  if (typeof string !== "string" || string.length === 0) {
    return 0;
  }
  const {
    ambiguousIsNarrow = true,
    countAnsiEscapeCodes = false
  } = options;
  if (!countAnsiEscapeCodes) {
    string = stripAnsi(string);
  }
  if (string.length === 0) {
    return 0;
  }
  let width = 0;
  const eastAsianWidthOptions = { ambiguousAsWide: !ambiguousIsNarrow };
  for (const { segment: character } of segmenter.segment(string)) {
    const codePoint = character.codePointAt(0);
    if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159) {
      continue;
    }
    if (codePoint >= 8203 && codePoint <= 8207 || codePoint === 65279) {
      continue;
    }
    if (codePoint >= 768 && codePoint <= 879 || codePoint >= 6832 && codePoint <= 6911 || codePoint >= 7616 && codePoint <= 7679 || codePoint >= 8400 && codePoint <= 8447 || codePoint >= 65056 && codePoint <= 65071) {
      continue;
    }
    if (codePoint >= 55296 && codePoint <= 57343) {
      continue;
    }
    if (codePoint >= 65024 && codePoint <= 65039) {
      continue;
    }
    if (defaultIgnorableCodePointRegex.test(character)) {
      continue;
    }
    if (emoji_regex_default().test(character)) {
      width += 2;
      continue;
    }
    width += eastAsianWidth(codePoint, eastAsianWidthOptions);
  }
  return width;
}

// node_modules/.bun/ansi-styles@6.2.3/node_modules/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    blackBright: [90, 39],
    gray: [90, 39],
    grey: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = new Map;
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/.bun/wrap-ansi@9.0.2/node_modules/wrap-ansi/index.js
var ESCAPES = new Set([
  "\x1B",
  "\x9B"
]);
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var wrapAnsiCode = (code) => `${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wordLengths = (string) => string.split(" ").map((character) => stringWidth(character));
var wrapWord = (rows, word, columns) => {
  const characters = [...word];
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let visible = stringWidth(stripAnsi(rows.at(-1)));
  for (const [index, character] of characters.entries()) {
    const characterLength = stringWidth(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (ESCAPES.has(character)) {
      isInsideEscape = true;
      const ansiEscapeLinkCandidate = characters.slice(index + 1, index + 1 + ANSI_ESCAPE_LINK.length).join("");
      isInsideLinkEscape = ansiEscapeLinkCandidate === ANSI_ESCAPE_LINK;
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
      continue;
    }
    visible += characterLength;
    if (visible === columns && index < characters.length - 1) {
      rows.push("");
      visible = 0;
    }
  }
  if (!visible && rows.at(-1).length > 0 && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last > 0) {
    if (stringWidth(words[last - 1]) > 0) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec2 = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const lengths = wordLengths(string);
  let rows = [""];
  for (const [index, word] of string.split(" ").entries()) {
    if (options.trim !== false) {
      rows[rows.length - 1] = rows.at(-1).trimStart();
    }
    let rowLength = stringWidth(rows.at(-1));
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength > 0 || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    if (options.hard && lengths[index] > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      continue;
    }
    if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        continue;
      }
      rows.push("");
    }
    if (rowLength + lengths[index] > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      continue;
    }
    rows[rows.length - 1] += word;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join(`
`);
  const pre = [...preString];
  let preStringIndex = 0;
  for (const [index, character] of pre.entries()) {
    returnValue += character;
    if (ESCAPES.has(character)) {
      const { groups } = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(preString.slice(preStringIndex)) || { groups: {} };
      if (groups.code !== undefined) {
        const code2 = Number.parseFloat(groups.code);
        escapeCode = code2 === END_CODE ? undefined : code2;
      } else if (groups.uri !== undefined) {
        escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
      }
    }
    const code = ansi_styles_default.codes.get(Number(escapeCode));
    if (pre[index + 1] === `
`) {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      if (escapeCode && code) {
        returnValue += wrapAnsiCode(code);
      }
    } else if (character === `
`) {
      if (escapeCode && code) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
    preStringIndex += character.length;
  }
  return returnValue;
};
function wrapAnsi(string, columns, options) {
  return String(string).normalize().replaceAll(`\r
`, `
`).split(`
`).map((line) => exec2(line, columns, options)).join(`
`);
}

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/utils.js
function breakLines(content, width) {
  return content.split(`
`).flatMap((line) => wrapAnsi(line, width, { trim: false, hard: true }).split(`
`).map((str) => str.trimEnd())).join(`
`);
}
function readlineWidth() {
  return import_cli_width.default({ defaultWidth: 80, output: readline().output });
}

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/pagination/use-pagination.js
function usePointerPosition({ active, renderedItems, pageSize, loop }) {
  const state = useRef({
    lastPointer: active,
    lastActive: undefined
  });
  const { lastPointer, lastActive } = state.current;
  const middle = Math.floor(pageSize / 2);
  const renderedLength = renderedItems.reduce((acc, item) => acc + item.length, 0);
  const defaultPointerPosition = renderedItems.slice(0, active).reduce((acc, item) => acc + item.length, 0);
  let pointer = defaultPointerPosition;
  if (renderedLength > pageSize) {
    if (loop) {
      pointer = lastPointer;
      if (lastActive != null && lastActive < active && active - lastActive < pageSize) {
        pointer = Math.min(middle, Math.abs(active - lastActive) === 1 ? Math.min(lastPointer + (renderedItems[lastActive]?.length ?? 0), Math.max(defaultPointerPosition, lastPointer)) : lastPointer + active - lastActive);
      }
    } else {
      const spaceUnderActive = renderedItems.slice(active).reduce((acc, item) => acc + item.length, 0);
      pointer = spaceUnderActive < pageSize - middle ? pageSize - spaceUnderActive : Math.min(defaultPointerPosition, middle);
    }
  }
  state.current.lastPointer = pointer;
  state.current.lastActive = active;
  return pointer;
}
function usePagination({ items, active, renderItem, pageSize, loop = true }) {
  const width = readlineWidth();
  const bound = (num) => (num % items.length + items.length) % items.length;
  const renderedItems = items.map((item, index) => {
    if (item == null)
      return [];
    return breakLines(renderItem({ item, index, isActive: index === active }), width).split(`
`);
  });
  const renderedLength = renderedItems.reduce((acc, item) => acc + item.length, 0);
  const renderItemAtIndex = (index) => renderedItems[index] ?? [];
  const pointer = usePointerPosition({ active, renderedItems, pageSize, loop });
  const activeItem = renderItemAtIndex(active).slice(0, pageSize);
  const activeItemPosition = pointer + activeItem.length <= pageSize ? pointer : pageSize - activeItem.length;
  const pageBuffer = Array.from({ length: pageSize });
  pageBuffer.splice(activeItemPosition, activeItem.length, ...activeItem);
  const itemVisited = new Set([active]);
  let bufferPointer = activeItemPosition + activeItem.length;
  let itemPointer = bound(active + 1);
  while (bufferPointer < pageSize && !itemVisited.has(itemPointer) && (loop && renderedLength > pageSize ? itemPointer !== active : itemPointer > active)) {
    const lines = renderItemAtIndex(itemPointer);
    const linesToAdd = lines.slice(0, pageSize - bufferPointer);
    pageBuffer.splice(bufferPointer, linesToAdd.length, ...linesToAdd);
    itemVisited.add(itemPointer);
    bufferPointer += linesToAdd.length;
    itemPointer = bound(itemPointer + 1);
  }
  bufferPointer = activeItemPosition - 1;
  itemPointer = bound(active - 1);
  while (bufferPointer >= 0 && !itemVisited.has(itemPointer) && (loop && renderedLength > pageSize ? itemPointer !== active : itemPointer < active)) {
    const lines = renderItemAtIndex(itemPointer);
    const linesToAdd = lines.slice(Math.max(0, lines.length - bufferPointer - 1));
    pageBuffer.splice(bufferPointer - linesToAdd.length + 1, linesToAdd.length, ...linesToAdd);
    itemVisited.add(itemPointer);
    bufferPointer -= linesToAdd.length;
    itemPointer = bound(itemPointer - 1);
  }
  return pageBuffer.filter((line) => typeof line === "string").join(`
`);
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/create-prompt.js
var import_mute_stream = __toESM(require_lib(), 1);
import * as readline2 from "readline";
import { AsyncResource as AsyncResource3 } from "async_hooks";

// node_modules/.bun/signal-exit@4.1.0/node_modules/signal-exit/dist/mjs/signals.js
var signals = [];
signals.push("SIGHUP", "SIGINT", "SIGTERM");
if (process.platform !== "win32") {
  signals.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
}
if (process.platform === "linux") {
  signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
}

// node_modules/.bun/signal-exit@4.1.0/node_modules/signal-exit/dist/mjs/index.js
var processOk = (process3) => !!process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
var kExitEmitter = Symbol.for("signal-exit emitter");
var global = globalThis;
var ObjectDefineProperty = Object.defineProperty.bind(Object);

class Emitter {
  emitted = {
    afterExit: false,
    exit: false
  };
  listeners = {
    afterExit: [],
    exit: []
  };
  count = 0;
  id = Math.random();
  constructor() {
    if (global[kExitEmitter]) {
      return global[kExitEmitter];
    }
    ObjectDefineProperty(global, kExitEmitter, {
      value: this,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  on(ev, fn) {
    this.listeners[ev].push(fn);
  }
  removeListener(ev, fn) {
    const list = this.listeners[ev];
    const i = list.indexOf(fn);
    if (i === -1) {
      return;
    }
    if (i === 0 && list.length === 1) {
      list.length = 0;
    } else {
      list.splice(i, 1);
    }
  }
  emit(ev, code, signal) {
    if (this.emitted[ev]) {
      return false;
    }
    this.emitted[ev] = true;
    let ret = false;
    for (const fn of this.listeners[ev]) {
      ret = fn(code, signal) === true || ret;
    }
    if (ev === "exit") {
      ret = this.emit("afterExit", code, signal) || ret;
    }
    return ret;
  }
}

class SignalExitBase {
}
var signalExitWrap = (handler) => {
  return {
    onExit(cb, opts) {
      return handler.onExit(cb, opts);
    },
    load() {
      return handler.load();
    },
    unload() {
      return handler.unload();
    }
  };
};

class SignalExitFallback extends SignalExitBase {
  onExit() {
    return () => {};
  }
  load() {}
  unload() {}
}

class SignalExit extends SignalExitBase {
  #hupSig = process3.platform === "win32" ? "SIGINT" : "SIGHUP";
  #emitter = new Emitter;
  #process;
  #originalProcessEmit;
  #originalProcessReallyExit;
  #sigListeners = {};
  #loaded = false;
  constructor(process3) {
    super();
    this.#process = process3;
    this.#sigListeners = {};
    for (const sig of signals) {
      this.#sigListeners[sig] = () => {
        const listeners = this.#process.listeners(sig);
        let { count } = this.#emitter;
        const p = process3;
        if (typeof p.__signal_exit_emitter__ === "object" && typeof p.__signal_exit_emitter__.count === "number") {
          count += p.__signal_exit_emitter__.count;
        }
        if (listeners.length === count) {
          this.unload();
          const ret = this.#emitter.emit("exit", null, sig);
          const s = sig === "SIGHUP" ? this.#hupSig : sig;
          if (!ret)
            process3.kill(process3.pid, s);
        }
      };
    }
    this.#originalProcessReallyExit = process3.reallyExit;
    this.#originalProcessEmit = process3.emit;
  }
  onExit(cb, opts) {
    if (!processOk(this.#process)) {
      return () => {};
    }
    if (this.#loaded === false) {
      this.load();
    }
    const ev = opts?.alwaysLast ? "afterExit" : "exit";
    this.#emitter.on(ev, cb);
    return () => {
      this.#emitter.removeListener(ev, cb);
      if (this.#emitter.listeners["exit"].length === 0 && this.#emitter.listeners["afterExit"].length === 0) {
        this.unload();
      }
    };
  }
  load() {
    if (this.#loaded) {
      return;
    }
    this.#loaded = true;
    this.#emitter.count += 1;
    for (const sig of signals) {
      try {
        const fn = this.#sigListeners[sig];
        if (fn)
          this.#process.on(sig, fn);
      } catch (_) {}
    }
    this.#process.emit = (ev, ...a) => {
      return this.#processEmit(ev, ...a);
    };
    this.#process.reallyExit = (code) => {
      return this.#processReallyExit(code);
    };
  }
  unload() {
    if (!this.#loaded) {
      return;
    }
    this.#loaded = false;
    signals.forEach((sig) => {
      const listener = this.#sigListeners[sig];
      if (!listener) {
        throw new Error("Listener not defined for signal: " + sig);
      }
      try {
        this.#process.removeListener(sig, listener);
      } catch (_) {}
    });
    this.#process.emit = this.#originalProcessEmit;
    this.#process.reallyExit = this.#originalProcessReallyExit;
    this.#emitter.count -= 1;
  }
  #processReallyExit(code) {
    if (!processOk(this.#process)) {
      return 0;
    }
    this.#process.exitCode = code || 0;
    this.#emitter.emit("exit", this.#process.exitCode, null);
    return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
  }
  #processEmit(ev, ...args) {
    const og = this.#originalProcessEmit;
    if (ev === "exit" && processOk(this.#process)) {
      if (typeof args[0] === "number") {
        this.#process.exitCode = args[0];
      }
      const ret = og.call(this.#process, ev, ...args);
      this.#emitter.emit("exit", this.#process.exitCode, null);
      return ret;
    } else {
      return og.call(this.#process, ev, ...args);
    }
  }
}
var process3 = globalThis.process;
var {
  onExit,
  load,
  unload
} = signalExitWrap(processOk(process3) ? new SignalExit(process3) : new SignalExitFallback);

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/screen-manager.js
import { stripVTControlCharacters } from "util";

// node_modules/.bun/@inquirer+ansi@2.0.2/node_modules/@inquirer/ansi/dist/index.js
var ESC = "\x1B[";
var cursorLeft = ESC + "G";
var cursorHide = ESC + "?25l";
var cursorShow = ESC + "?25h";
var cursorUp = (rows = 1) => rows > 0 ? `${ESC}${rows}A` : "";
var cursorDown = (rows = 1) => rows > 0 ? `${ESC}${rows}B` : "";
var cursorTo = (x, y) => {
  if (typeof y === "number" && !Number.isNaN(y)) {
    return `${ESC}${y + 1};${x + 1}H`;
  }
  return `${ESC}${x + 1}G`;
};
var eraseLine = ESC + "2K";
var eraseLines = (lines) => lines > 0 ? (eraseLine + cursorUp(1)).repeat(lines - 1) + eraseLine + cursorLeft : "";

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/screen-manager.js
var height = (content) => content.split(`
`).length;
var lastLine = (content) => content.split(`
`).pop() ?? "";

class ScreenManager {
  height = 0;
  extraLinesUnderPrompt = 0;
  cursorPos;
  rl;
  constructor(rl) {
    this.rl = rl;
    this.cursorPos = rl.getCursorPos();
  }
  write(content) {
    this.rl.output.unmute();
    this.rl.output.write(content);
    this.rl.output.mute();
  }
  render(content, bottomContent = "") {
    const promptLine = lastLine(content);
    const rawPromptLine = stripVTControlCharacters(promptLine);
    let prompt = rawPromptLine;
    if (this.rl.line.length > 0) {
      prompt = prompt.slice(0, -this.rl.line.length);
    }
    this.rl.setPrompt(prompt);
    this.cursorPos = this.rl.getCursorPos();
    const width = readlineWidth();
    content = breakLines(content, width);
    bottomContent = breakLines(bottomContent, width);
    if (rawPromptLine.length % width === 0) {
      content += `
`;
    }
    let output = content + (bottomContent ? `
` + bottomContent : "");
    const promptLineUpDiff = Math.floor(rawPromptLine.length / width) - this.cursorPos.rows;
    const bottomContentHeight = promptLineUpDiff + (bottomContent ? height(bottomContent) : 0);
    if (bottomContentHeight > 0)
      output += cursorUp(bottomContentHeight);
    output += cursorTo(this.cursorPos.cols);
    this.write(cursorDown(this.extraLinesUnderPrompt) + eraseLines(this.height) + output);
    this.extraLinesUnderPrompt = bottomContentHeight;
    this.height = height(output);
  }
  checkCursorPos() {
    const cursorPos = this.rl.getCursorPos();
    if (cursorPos.cols !== this.cursorPos.cols) {
      this.write(cursorTo(cursorPos.cols));
      this.cursorPos = cursorPos;
    }
  }
  done({ clearContent }) {
    this.rl.setPrompt("");
    let output = cursorDown(this.extraLinesUnderPrompt);
    output += clearContent ? eraseLines(this.height) : `
`;
    output += cursorShow;
    this.write(output);
    this.rl.close();
  }
}

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/promise-polyfill.js
class PromisePolyfill extends Promise {
  static withResolver() {
    let resolve3;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve3 = res;
      reject = rej;
    });
    return { promise, resolve: resolve3, reject };
  }
}

// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/create-prompt.js
function getCallSites() {
  const _prepareStackTrace = Error.prepareStackTrace;
  let result = [];
  try {
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1);
      result = callSitesWithoutCurrent;
      return callSitesWithoutCurrent;
    };
    new Error().stack;
  } catch {
    return result;
  }
  Error.prepareStackTrace = _prepareStackTrace;
  return result;
}
function createPrompt(view) {
  const callSites = getCallSites();
  const prompt = (config, context = {}) => {
    const { input = process.stdin, signal } = context;
    const cleanups = new Set;
    const output = new import_mute_stream.default;
    output.pipe(context.output ?? process.stdout);
    const rl = readline2.createInterface({
      terminal: true,
      input,
      output
    });
    const screen = new ScreenManager(rl);
    const { promise, resolve: resolve3, reject } = PromisePolyfill.withResolver();
    const cancel = () => reject(new CancelPromptError);
    if (signal) {
      const abort = () => reject(new AbortPromptError({ cause: signal.reason }));
      if (signal.aborted) {
        abort();
        return Object.assign(promise, { cancel });
      }
      signal.addEventListener("abort", abort);
      cleanups.add(() => signal.removeEventListener("abort", abort));
    }
    cleanups.add(onExit((code, signal2) => {
      reject(new ExitPromptError(`User force closed the prompt with ${code} ${signal2}`));
    }));
    const sigint = () => reject(new ExitPromptError(`User force closed the prompt with SIGINT`));
    rl.on("SIGINT", sigint);
    cleanups.add(() => rl.removeListener("SIGINT", sigint));
    const checkCursorPos = () => screen.checkCursorPos();
    rl.input.on("keypress", checkCursorPos);
    cleanups.add(() => rl.input.removeListener("keypress", checkCursorPos));
    return withHooks(rl, (cycle) => {
      const hooksCleanup = AsyncResource3.bind(() => effectScheduler.clearAll());
      rl.on("close", hooksCleanup);
      cleanups.add(() => rl.removeListener("close", hooksCleanup));
      cycle(() => {
        try {
          const nextView = view(config, (value) => {
            setImmediate(() => resolve3(value));
          });
          if (nextView === undefined) {
            const callerFilename = callSites[1]?.getFileName();
            throw new Error(`Prompt functions must return a string.
    at ${callerFilename}`);
          }
          const [content, bottomContent] = typeof nextView === "string" ? [nextView] : nextView;
          screen.render(content, bottomContent);
          effectScheduler.run();
        } catch (error) {
          reject(error);
        }
      });
      return Object.assign(promise.then((answer) => {
        effectScheduler.clearAll();
        return answer;
      }, (error) => {
        effectScheduler.clearAll();
        throw error;
      }).finally(() => {
        cleanups.forEach((cleanup) => cleanup());
        screen.done({ clearContent: Boolean(context.clearPromptOnDone) });
        output.end();
      }).then(() => promise), { cancel });
    });
  };
  return prompt;
}
// node_modules/.bun/@inquirer+core@11.1.0+cec0fdc95ef194b0/node_modules/@inquirer/core/dist/lib/Separator.js
import { styleText as styleText2 } from "util";
class Separator {
  separator = styleText2("dim", Array.from({ length: 15 }).join(dist_default.line));
  type = "separator";
  constructor(separator) {
    if (separator) {
      this.separator = separator;
    }
  }
  static isSeparator(choice) {
    return Boolean(choice && typeof choice === "object" && "type" in choice && choice.type === "separator");
  }
}
// node_modules/.bun/@inquirer+checkbox@5.0.3+cec0fdc95ef194b0/node_modules/@inquirer/checkbox/dist/index.js
import { styleText as styleText3 } from "util";
var checkboxTheme = {
  icon: {
    checked: styleText3("green", dist_default.circleFilled),
    unchecked: dist_default.circle,
    cursor: dist_default.pointer
  },
  style: {
    disabledChoice: (text) => styleText3("dim", `- ${text}`),
    renderSelectedChoices: (selectedChoices) => selectedChoices.map((choice) => choice.short).join(", "),
    description: (text) => styleText3("cyan", text),
    keysHelpTip: (keys) => keys.map(([key, action]) => `${styleText3("bold", key)} ${styleText3("dim", action)}`).join(styleText3("dim", " \u2022 "))
  },
  keybindings: []
};
function isSelectable(item) {
  return !Separator.isSeparator(item) && !item.disabled;
}
function isChecked(item) {
  return isSelectable(item) && item.checked;
}
function toggle(item) {
  return isSelectable(item) ? { ...item, checked: !item.checked } : item;
}
function check(checked) {
  return function(item) {
    return isSelectable(item) ? { ...item, checked } : item;
  };
}
function normalizeChoices(choices) {
  return choices.map((choice) => {
    if (Separator.isSeparator(choice))
      return choice;
    if (typeof choice === "string") {
      return {
        value: choice,
        name: choice,
        short: choice,
        checkedName: choice,
        disabled: false,
        checked: false
      };
    }
    const name = choice.name ?? String(choice.value);
    const normalizedChoice = {
      value: choice.value,
      name,
      short: choice.short ?? name,
      checkedName: choice.checkedName ?? name,
      disabled: choice.disabled ?? false,
      checked: choice.checked ?? false
    };
    if (choice.description) {
      normalizedChoice.description = choice.description;
    }
    return normalizedChoice;
  });
}
var dist_default2 = createPrompt((config, done) => {
  const { pageSize = 7, loop = true, required, validate: validate2 = () => true } = config;
  const shortcuts = { all: "a", invert: "i", ...config.shortcuts };
  const theme = makeTheme(checkboxTheme, config.theme);
  const { keybindings } = theme;
  const [status, setStatus] = useState("idle");
  const prefix = usePrefix({ status, theme });
  const [items, setItems] = useState(normalizeChoices(config.choices));
  const bounds = useMemo(() => {
    const first = items.findIndex(isSelectable);
    const last = items.findLastIndex(isSelectable);
    if (first === -1) {
      throw new ValidationError("[checkbox prompt] No selectable choices. All choices are disabled.");
    }
    return { first, last };
  }, [items]);
  const [active, setActive] = useState(bounds.first);
  const [errorMsg, setError] = useState();
  useKeypress(async (key) => {
    if (isEnterKey(key)) {
      const selection = items.filter(isChecked);
      const isValid = await validate2([...selection]);
      if (required && !items.some(isChecked)) {
        setError("At least one choice must be selected");
      } else if (isValid === true) {
        setStatus("done");
        done(selection.map((choice) => choice.value));
      } else {
        setError(isValid || "You must select a valid value");
      }
    } else if (isUpKey(key, keybindings) || isDownKey(key, keybindings)) {
      if (loop || isUpKey(key, keybindings) && active !== bounds.first || isDownKey(key, keybindings) && active !== bounds.last) {
        const offset = isUpKey(key, keybindings) ? -1 : 1;
        let next = active;
        do {
          next = (next + offset + items.length) % items.length;
        } while (!isSelectable(items[next]));
        setActive(next);
      }
    } else if (isSpaceKey(key)) {
      setError(undefined);
      setItems(items.map((choice, i) => i === active ? toggle(choice) : choice));
    } else if (key.name === shortcuts.all) {
      const selectAll = items.some((choice) => isSelectable(choice) && !choice.checked);
      setItems(items.map(check(selectAll)));
    } else if (key.name === shortcuts.invert) {
      setItems(items.map(toggle));
    } else if (isNumberKey(key)) {
      const selectedIndex = Number(key.name) - 1;
      let selectableIndex = -1;
      const position = items.findIndex((item) => {
        if (Separator.isSeparator(item))
          return false;
        selectableIndex++;
        return selectableIndex === selectedIndex;
      });
      const selectedItem = items[position];
      if (selectedItem && isSelectable(selectedItem)) {
        setActive(position);
        setItems(items.map((choice, i) => i === position ? toggle(choice) : choice));
      }
    }
  });
  const message = theme.style.message(config.message, status);
  let description;
  const page = usePagination({
    items,
    active,
    renderItem({ item, isActive }) {
      if (Separator.isSeparator(item)) {
        return ` ${item.separator}`;
      }
      if (item.disabled) {
        const disabledLabel = typeof item.disabled === "string" ? item.disabled : "(disabled)";
        return theme.style.disabledChoice(`${item.name} ${disabledLabel}`);
      }
      if (isActive) {
        description = item.description;
      }
      const checkbox = item.checked ? theme.icon.checked : theme.icon.unchecked;
      const name = item.checked ? item.checkedName : item.name;
      const color = isActive ? theme.style.highlight : (x) => x;
      const cursor = isActive ? theme.icon.cursor : " ";
      return color(`${cursor}${checkbox} ${name}`);
    },
    pageSize,
    loop
  });
  if (status === "done") {
    const selection = items.filter(isChecked);
    const answer = theme.style.answer(theme.style.renderSelectedChoices(selection, items));
    return [prefix, message, answer].filter(Boolean).join(" ");
  }
  const keys = [
    ["\u2191\u2193", "navigate"],
    ["space", "select"]
  ];
  if (shortcuts.all)
    keys.push([shortcuts.all, "all"]);
  if (shortcuts.invert)
    keys.push([shortcuts.invert, "invert"]);
  keys.push(["\u23CE", "submit"]);
  const helpLine = theme.style.keysHelpTip(keys);
  const lines = [
    [prefix, message].filter(Boolean).join(" "),
    page,
    " ",
    description ? theme.style.description(description) : "",
    errorMsg ? theme.style.error(errorMsg) : "",
    helpLine
  ].filter(Boolean).join(`
`).trimEnd();
  return `${lines}${cursorHide}`;
});
// node_modules/.bun/@inquirer+confirm@6.0.3+cec0fdc95ef194b0/node_modules/@inquirer/confirm/dist/index.js
function getBooleanValue(value, defaultValue) {
  let answer = defaultValue !== false;
  if (/^(y|yes)/i.test(value))
    answer = true;
  else if (/^(n|no)/i.test(value))
    answer = false;
  return answer;
}
function boolToString(value) {
  return value ? "Yes" : "No";
}
var dist_default3 = createPrompt((config, done) => {
  const { transformer = boolToString } = config;
  const [status, setStatus] = useState("idle");
  const [value, setValue] = useState("");
  const theme = makeTheme(config.theme);
  const prefix = usePrefix({ status, theme });
  useKeypress((key, rl) => {
    if (status !== "idle")
      return;
    if (isEnterKey(key)) {
      const answer = getBooleanValue(value, config.default);
      setValue(transformer(answer));
      setStatus("done");
      done(answer);
    } else if (isTabKey(key)) {
      const answer = boolToString(!getBooleanValue(value, config.default));
      rl.clearLine(0);
      rl.write(answer);
      setValue(answer);
    } else {
      setValue(rl.line);
    }
  });
  let formattedValue = value;
  let defaultValue = "";
  if (status === "done") {
    formattedValue = theme.style.answer(value);
  } else {
    defaultValue = ` ${theme.style.defaultAnswer(config.default === false ? "y/N" : "Y/n")}`;
  }
  const message = theme.style.message(config.message, status);
  return `${prefix} ${message}${defaultValue} ${formattedValue}`;
});
// node_modules/.bun/@inquirer+input@5.0.3+cec0fdc95ef194b0/node_modules/@inquirer/input/dist/index.js
var inputTheme = {
  validationFailureMode: "keep"
};
var dist_default4 = createPrompt((config, done) => {
  const { prefill = "tab" } = config;
  const theme = makeTheme(inputTheme, config.theme);
  const [status, setStatus] = useState("idle");
  const [defaultValue = "", setDefaultValue] = useState(config.default);
  const [errorMsg, setError] = useState();
  const [value, setValue] = useState("");
  const prefix = usePrefix({ status, theme });
  async function validate2(value2) {
    const { required, pattern, patternError = "Invalid input" } = config;
    if (required && !value2) {
      return "You must provide a value";
    }
    if (pattern && !pattern.test(value2)) {
      return patternError;
    }
    if (typeof config.validate === "function") {
      return await config.validate(value2) || "You must provide a valid value";
    }
    return true;
  }
  useKeypress(async (key, rl) => {
    if (status !== "idle") {
      return;
    }
    if (isEnterKey(key)) {
      const answer = value || defaultValue;
      setStatus("loading");
      const isValid = await validate2(answer);
      if (isValid === true) {
        setValue(answer);
        setStatus("done");
        done(answer);
      } else {
        if (theme.validationFailureMode === "clear") {
          setValue("");
        } else {
          rl.write(value);
        }
        setError(isValid);
        setStatus("idle");
      }
    } else if (isBackspaceKey(key) && !value) {
      setDefaultValue(undefined);
    } else if (isTabKey(key) && !value) {
      setDefaultValue(undefined);
      rl.clearLine(0);
      rl.write(defaultValue);
      setValue(defaultValue);
    } else {
      setValue(rl.line);
      setError(undefined);
    }
  });
  useEffect((rl) => {
    if (prefill === "editable" && defaultValue) {
      rl.write(defaultValue);
      setValue(defaultValue);
    }
  }, []);
  const message = theme.style.message(config.message, status);
  let formattedValue = value;
  if (typeof config.transformer === "function") {
    formattedValue = config.transformer(value, { isFinal: status === "done" });
  } else if (status === "done") {
    formattedValue = theme.style.answer(value);
  }
  let defaultStr;
  if (defaultValue && status !== "done" && !value) {
    defaultStr = theme.style.defaultAnswer(defaultValue);
  }
  let error = "";
  if (errorMsg) {
    error = theme.style.error(errorMsg);
  }
  return [
    [prefix, message, defaultStr, formattedValue].filter((v) => v !== undefined).join(" "),
    error
  ];
});
// node_modules/.bun/@inquirer+search@4.0.3+cec0fdc95ef194b0/node_modules/@inquirer/search/dist/index.js
import { styleText as styleText4 } from "util";
var searchTheme = {
  icon: { cursor: dist_default.pointer },
  style: {
    disabled: (text) => styleText4("dim", `- ${text}`),
    searchTerm: (text) => styleText4("cyan", text),
    description: (text) => styleText4("cyan", text),
    keysHelpTip: (keys) => keys.map(([key, action]) => `${styleText4("bold", key)} ${styleText4("dim", action)}`).join(styleText4("dim", " \u2022 "))
  }
};
function isSelectable2(item) {
  return !Separator.isSeparator(item) && !item.disabled;
}
function normalizeChoices2(choices) {
  return choices.map((choice) => {
    if (Separator.isSeparator(choice))
      return choice;
    if (typeof choice === "string") {
      return {
        value: choice,
        name: choice,
        short: choice,
        disabled: false
      };
    }
    const name = choice.name ?? String(choice.value);
    const normalizedChoice = {
      value: choice.value,
      name,
      short: choice.short ?? name,
      disabled: choice.disabled ?? false
    };
    if (choice.description) {
      normalizedChoice.description = choice.description;
    }
    return normalizedChoice;
  });
}
var dist_default5 = createPrompt((config, done) => {
  const { pageSize = 7, validate: validate2 = () => true } = config;
  const theme = makeTheme(searchTheme, config.theme);
  const [status, setStatus] = useState("loading");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState();
  const prefix = usePrefix({ status, theme });
  const bounds = useMemo(() => {
    const first = searchResults.findIndex(isSelectable2);
    const last = searchResults.findLastIndex(isSelectable2);
    return { first, last };
  }, [searchResults]);
  const [active = bounds.first, setActive] = useState();
  useEffect(() => {
    const controller = new AbortController;
    setStatus("loading");
    setSearchError(undefined);
    const fetchResults = async () => {
      try {
        const results = await config.source(searchTerm || undefined, {
          signal: controller.signal
        });
        if (!controller.signal.aborted) {
          setActive(undefined);
          setSearchError(undefined);
          setSearchResults(normalizeChoices2(results));
          setStatus("idle");
        }
      } catch (error2) {
        if (!controller.signal.aborted && error2 instanceof Error) {
          setSearchError(error2.message);
        }
      }
    };
    fetchResults();
    return () => {
      controller.abort();
    };
  }, [searchTerm]);
  const selectedChoice = searchResults[active];
  useKeypress(async (key, rl) => {
    if (isEnterKey(key)) {
      if (selectedChoice) {
        setStatus("loading");
        const isValid = await validate2(selectedChoice.value);
        setStatus("idle");
        if (isValid === true) {
          setStatus("done");
          done(selectedChoice.value);
        } else if (selectedChoice.name === searchTerm) {
          setSearchError(isValid || "You must provide a valid value");
        } else {
          rl.write(selectedChoice.name);
          setSearchTerm(selectedChoice.name);
        }
      } else {
        rl.write(searchTerm);
      }
    } else if (isTabKey(key) && selectedChoice) {
      rl.clearLine(0);
      rl.write(selectedChoice.name);
      setSearchTerm(selectedChoice.name);
    } else if (status !== "loading" && (isUpKey(key) || isDownKey(key))) {
      rl.clearLine(0);
      if (isUpKey(key) && active !== bounds.first || isDownKey(key) && active !== bounds.last) {
        const offset = isUpKey(key) ? -1 : 1;
        let next = active;
        do {
          next = (next + offset + searchResults.length) % searchResults.length;
        } while (!isSelectable2(searchResults[next]));
        setActive(next);
      }
    } else {
      setSearchTerm(rl.line);
    }
  });
  const message = theme.style.message(config.message, status);
  const helpLine = theme.style.keysHelpTip([
    ["\u2191\u2193", "navigate"],
    ["\u23CE", "select"]
  ]);
  const page = usePagination({
    items: searchResults,
    active,
    renderItem({ item, isActive }) {
      if (Separator.isSeparator(item)) {
        return ` ${item.separator}`;
      }
      if (item.disabled) {
        const disabledLabel = typeof item.disabled === "string" ? item.disabled : "(disabled)";
        return theme.style.disabled(`${item.name} ${disabledLabel}`);
      }
      const color = isActive ? theme.style.highlight : (x) => x;
      const cursor = isActive ? theme.icon.cursor : ` `;
      return color(`${cursor} ${item.name}`);
    },
    pageSize,
    loop: false
  });
  let error;
  if (searchError) {
    error = theme.style.error(searchError);
  } else if (searchResults.length === 0 && searchTerm !== "" && status === "idle") {
    error = theme.style.error("No results found");
  }
  let searchStr;
  if (status === "done" && selectedChoice) {
    return [prefix, message, theme.style.answer(selectedChoice.short)].filter(Boolean).join(" ").trimEnd();
  } else {
    searchStr = theme.style.searchTerm(searchTerm);
  }
  const description = selectedChoice?.description;
  const header = [prefix, message, searchStr].filter(Boolean).join(" ").trimEnd();
  const body = [
    error ?? page,
    " ",
    description ? theme.style.description(description) : "",
    helpLine
  ].filter(Boolean).join(`
`).trimEnd();
  return [header, body];
});
// node_modules/.bun/@inquirer+select@5.0.3+cec0fdc95ef194b0/node_modules/@inquirer/select/dist/index.js
import { styleText as styleText5 } from "util";
var selectTheme = {
  icon: { cursor: dist_default.pointer },
  style: {
    disabled: (text) => styleText5("dim", `- ${text}`),
    description: (text) => styleText5("cyan", text),
    keysHelpTip: (keys) => keys.map(([key, action]) => `${styleText5("bold", key)} ${styleText5("dim", action)}`).join(styleText5("dim", " \u2022 "))
  },
  indexMode: "hidden",
  keybindings: []
};
function isSelectable3(item) {
  return !Separator.isSeparator(item) && !item.disabled;
}
function normalizeChoices3(choices) {
  return choices.map((choice) => {
    if (Separator.isSeparator(choice))
      return choice;
    if (typeof choice !== "object" || choice === null || !("value" in choice)) {
      const name2 = String(choice);
      return {
        value: choice,
        name: name2,
        short: name2,
        disabled: false
      };
    }
    const name = choice.name ?? String(choice.value);
    const normalizedChoice = {
      value: choice.value,
      name,
      short: choice.short ?? name,
      disabled: choice.disabled ?? false
    };
    if (choice.description) {
      normalizedChoice.description = choice.description;
    }
    return normalizedChoice;
  });
}
var dist_default6 = createPrompt((config, done) => {
  const { loop = true, pageSize = 7 } = config;
  const theme = makeTheme(selectTheme, config.theme);
  const { keybindings } = theme;
  const [status, setStatus] = useState("idle");
  const prefix = usePrefix({ status, theme });
  const searchTimeoutRef = useRef();
  const searchEnabled = !keybindings.includes("vim");
  const items = useMemo(() => normalizeChoices3(config.choices), [config.choices]);
  const bounds = useMemo(() => {
    const first = items.findIndex(isSelectable3);
    const last = items.findLastIndex(isSelectable3);
    if (first === -1) {
      throw new ValidationError("[select prompt] No selectable choices. All choices are disabled.");
    }
    return { first, last };
  }, [items]);
  const defaultItemIndex = useMemo(() => {
    if (!("default" in config))
      return -1;
    return items.findIndex((item) => isSelectable3(item) && item.value === config.default);
  }, [config.default, items]);
  const [active, setActive] = useState(defaultItemIndex === -1 ? bounds.first : defaultItemIndex);
  const selectedChoice = items[active];
  useKeypress((key, rl) => {
    clearTimeout(searchTimeoutRef.current);
    if (isEnterKey(key)) {
      setStatus("done");
      done(selectedChoice.value);
    } else if (isUpKey(key, keybindings) || isDownKey(key, keybindings)) {
      rl.clearLine(0);
      if (loop || isUpKey(key, keybindings) && active !== bounds.first || isDownKey(key, keybindings) && active !== bounds.last) {
        const offset = isUpKey(key, keybindings) ? -1 : 1;
        let next = active;
        do {
          next = (next + offset + items.length) % items.length;
        } while (!isSelectable3(items[next]));
        setActive(next);
      }
    } else if (isNumberKey(key) && !Number.isNaN(Number(rl.line))) {
      const selectedIndex = Number(rl.line) - 1;
      let selectableIndex = -1;
      const position = items.findIndex((item2) => {
        if (Separator.isSeparator(item2))
          return false;
        selectableIndex++;
        return selectableIndex === selectedIndex;
      });
      const item = items[position];
      if (item != null && isSelectable3(item)) {
        setActive(position);
      }
      searchTimeoutRef.current = setTimeout(() => {
        rl.clearLine(0);
      }, 700);
    } else if (isBackspaceKey(key)) {
      rl.clearLine(0);
    } else if (searchEnabled) {
      const searchTerm = rl.line.toLowerCase();
      const matchIndex = items.findIndex((item) => {
        if (Separator.isSeparator(item) || !isSelectable3(item))
          return false;
        return item.name.toLowerCase().startsWith(searchTerm);
      });
      if (matchIndex !== -1) {
        setActive(matchIndex);
      }
      searchTimeoutRef.current = setTimeout(() => {
        rl.clearLine(0);
      }, 700);
    }
  });
  useEffect(() => () => {
    clearTimeout(searchTimeoutRef.current);
  }, []);
  const message = theme.style.message(config.message, status);
  const helpLine = theme.style.keysHelpTip([
    ["\u2191\u2193", "navigate"],
    ["\u23CE", "select"]
  ]);
  let separatorCount = 0;
  const page = usePagination({
    items,
    active,
    renderItem({ item, isActive, index }) {
      if (Separator.isSeparator(item)) {
        separatorCount++;
        return ` ${item.separator}`;
      }
      const indexLabel = theme.indexMode === "number" ? `${index + 1 - separatorCount}. ` : "";
      if (item.disabled) {
        const disabledLabel = typeof item.disabled === "string" ? item.disabled : "(disabled)";
        return theme.style.disabled(`${indexLabel}${item.name} ${disabledLabel}`);
      }
      const color = isActive ? theme.style.highlight : (x) => x;
      const cursor = isActive ? theme.icon.cursor : ` `;
      return color(`${cursor} ${indexLabel}${item.name}`);
    },
    pageSize,
    loop
  });
  if (status === "done") {
    return [prefix, message, theme.style.answer(selectedChoice.short)].filter(Boolean).join(" ");
  }
  const { description } = selectedChoice;
  const lines = [
    [prefix, message].filter(Boolean).join(" "),
    page,
    " ",
    description ? theme.style.description(description) : "",
    helpLine
  ].filter(Boolean).join(`
`).trimEnd();
  return `${lines}${cursorHide}`;
});
// packages/module/inquirer/index.ts
class Inquirer {
  constructor() {
    const processError = (reason) => {
      if (!/^User force closed/i.test(reason.message))
        console.error(reason);
      process.exit(1);
    };
    process.addListener("unhandledRejection", processError);
  }
  input(options) {
    return arrayExecSyncHandler((item) => {
      return dist_default4(item);
    }, options);
  }
  select(options) {
    return arrayExecSyncHandler((item) => {
      return dist_default6(item);
    }, options);
  }
  confirm(options) {
    return arrayExecSyncHandler((item) => {
      return dist_default3(item);
    }, options);
  }
  checkbox(options) {
    return arrayExecSyncHandler((item) => {
      return dist_default2(item);
    }, options);
  }
  search(options) {
    return arrayExecSyncHandler((item) => {
      const { choices: dataSource, default: defaultValue } = item;
      if (defaultValue) {
        const existsItem = dataSource.findIndex((item2) => item2.value === defaultValue);
        if (existsItem !== -1) {
          const [item2] = dataSource.splice(existsItem, 1);
          dataSource.unshift(item2);
        }
      }
      item = filterObject(item, ["choices", "default"]);
      return dist_default5({
        ...item,
        source: async (input) => {
          return input?.trim?.() ? dataSource.filter((item2) => item2.name.includes(input)) : dataSource;
        }
      });
    }, options);
  }
  handler(options) {
    return arrayExecSyncHandler((item) => {
      const handler = this[item.type];
      return handler(filterObject(item, ["type"]));
    }, options);
  }
}
// packages/module/packages/index.ts
class Packages {
  #type = "install";
  #config = {
    cwd: process.cwd(),
    toolCli: "",
    packages: [],
    mirrorRegistry: "",
    isMirrorAction: false
  };
  constructor(options) {
    Object.assign(this.#config, options);
  }
  async installDependencies() {
    const { cwd, toolCli, packages, isMirrorAction, mirrorRegistry } = this.#config;
    const isAllInstall = !packages;
    const depCommand = isAllInstall ? "" : packages.join(" ");
    const mirrorCommand = isMirrorAction ? `--registry ${mirrorRegistry}` : "";
    const installCommand = ["pnpm", "yarn", "bun"].includes(toolCli) ? "add" : "install";
    const command = `${toolCli} ${isAllInstall ? "install" : `${installCommand} ${depCommand}`} ${mirrorCommand}`;
    await execCommand(command, {
      cwd,
      stdio: "inherit"
    });
  }
  uninstallDependencies = async () => {
    const { cwd, packages, toolCli } = this.#config;
    const depCommand = packages.join(" ");
    const uninstallCommand = ["pnpm", "yarn", "bun"].includes(toolCli) ? "remove" : "uninstall";
    const command = `${toolCli} ${uninstallCommand} ${depCommand}`;
    await execCommand(command, {
      cwd,
      stdio: "inherit"
    });
  };
  async action(type) {
    this.#type = type;
    if (this.#type === "install") {
      await this.installDependencies();
    } else {
      await this.uninstallDependencies();
    }
  }
}
// packages/module/git/gitInfo.ts
class GitInfo {
  async env() {
    const source = await execCommand(`git rev-parse --is-inside-work-tree`, {
      stdio: ["ignore", "pipe", "ignore"]
    });
    return source === "true";
  }
  async remote() {
    const source = await execCommand("git remote -v");
    let pushOriginList = source.split(`
`).filter((item) => item && item.endsWith("(push)"));
    return pushOriginList.map((item) => {
      const [origin, remote] = item.split("\t").filter((item2) => item2);
      const [remoteUrl] = remote.split(" ").filter((item2) => item2);
      return { origin, remote: remoteUrl };
    });
  }
  async currentBranch() {
    const source = await execCommand("git branch --show-current");
    return source && source.replaceAll(`
`, "") || "";
  }
  async branchList(remote) {
    let branchList = [];
    if (remote) {
      const source = await execCommand(`git branch -a`);
      branchList = source.split(`
`).map((item) => item.replace("* ", "").trim());
    } else {
      const source = await execCommand("git branch");
      branchList = source.split(`
`).map((item) => item.replace("* ", "").trim());
    }
    return branchList;
  }
  async getWorkspaceAndTempStorageFile() {
    const files = await execCommand("git status -s");
    const result = files.split(`
`).filter((item) => item).map((item) => {
      const trimStr = item.trim();
      return trimStr.slice(trimStr.indexOf(" ") + 1).replace(/\s+/g, "");
    });
    return result;
  }
  async getTempStorageFile() {
    const files = await execCommand("git diff --cached --name-only");
    return files.split(`
`).filter((item) => item).map((item) => item.trim().replace(/\s+/g, ""));
  }
  async getWorkspaceFile() {
    const workspace = await execCommand("git diff --name-only");
    const unTrack = await execCommand("git ls-files --others --exclude-standard");
    return [...workspace.split(`
`), ...unTrack.split(`
`)].filter((item) => item).map((item) => item.trim().replace(/\s+/g, ""));
  }
  async getNotPushRemoteFile() {
    const conteString = await execCommand(`git log --branches --not --remotes --name-only`);
    const list = conteString.split(`
`).reverse();
    if (!list.length || !list.at(0))
      return [];
    const fileList = [];
    for (const item of list) {
      if (item.trim())
        fileList.push(item);
      else
        return fileList;
    }
  }
  async showGitLog() {
    execCommand("git log", {
      stdio: "inherit"
    });
  }
}

// packages/module/git/commit.ts
class GitCommit {
  #config;
  constructor(props = {}) {
    this.#config = { ...props };
  }
  async addDiffFile(file) {
    const command = `git add ${file.join(" ")}`;
    return await execCommand(command, {
      stdio: "inherit"
    });
  }
  async commitFileToLocal(type, msg) {
    const command = `git commit -m "${type}:${msg}"`;
    return await execCommand(command, {
      stdio: "inherit"
    });
  }
  async pushFileToRemote() {
    const { remote, branch } = this.#config;
    if (!remote || !branch)
      throw new Error("\u7F3A\u5C11\u8FDC\u7A0B\u5730\u5740\u6216\u5206\u652F\uFF0C\u63A8\u9001\u5931\u8D25\uFF01");
    const command = `git push ${remote} ${branch}`;
    await execCommand(command, {
      stdio: "inherit"
    });
  }
  async rewriteCommitMsg(type, msg) {
    return await execCommand(`git commit --amend -m "${type}:${msg}"`, {
      stdio: "inherit"
    });
  }
  async resetFileToCommit() {
    return await execCommand(`git reset --soft HEAD~1`, {
      stdio: "inherit"
    });
  }
  async resetTempStorageFile(file) {
    return await execCommand(`git reset ${file.join(" ")}`, {
      stdio: "inherit"
    });
  }
  async releaseTag(option) {
    await execCommand(`git tag -a v${option.tag} -m "Release version ${option.tag}"`, {
      stdio: "inherit"
    });
    await execCommand(`git push ${option.remote} v${option.tag}`, {
      stdio: "inherit"
    });
  }
}

// packages/module/git/remote.ts
class Remote {
  static async addRemote(name, url) {
    return await execCommand(`git remote add ${name} ${url}`);
  }
}

// packages/module/git/index.ts
class Git extends GitInfo {
  async initGit() {
    await execCommand("git init", {
      stdio: "inherit"
    });
  }
  async clone(url, cwd) {
    await execCommand(`git clone ${url}`, {
      stdio: "inherit",
      cwd: cwd || process.cwd()
    });
  }
  async pushRemote(props) {
    const commit = new GitCommit(props);
    await commit.pushFileToRemote();
    if (props.tag)
      await commit.releaseTag({
        remote: props.remote,
        tag: props.tag
      });
  }
  async commitPushRemote(props) {
    const commit = new GitCommit({
      remote: props.remote,
      branch: props.branch
    });
    await commit.addDiffFile(props.file);
    await commit.commitFileToLocal(props.type, props.msg);
    await commit.pushFileToRemote();
    if (props.tag)
      await commit.releaseTag({
        remote: props.remote,
        tag: props.tag
      });
  }
  async commitToLocal(props) {
    const commit = new GitCommit;
    await commit.addDiffFile(props.file);
    await commit.commitFileToLocal(props.type, props.msg);
  }
  async cloneGitProject(url, cwd) {
    const pjName = getStorageProjectName(url);
    if (!pjName)
      throw new Error("git \u4ED3\u5E93\u5730\u5740\u65E0\u6548\uFF0C\u65E0\u6CD5\u83B7\u53D6\u5230\u6307\u5B9A\u7684git\u9879\u76EE\u540D\u79F0~");
    await this.clone(url, cwd);
    console.log(`\u9879\u76EE\u521D\u59CB\u5316\u6210\u529F\uFF01\uFF0C\u8BF7\u8FDB\u5165\uFF1A${pjName} \u76EE\u5F55\u8FDB\u884C\u64CD\u4F5C\u3002`);
  }
}
// packages/core/src/constance/quetion.ts
var qsForResetConfig = () => {
  return {
    name: "resetConfigFile",
    type: "confirm",
    message: "\u786E\u8BA4\u8981\u8FD8\u539F\u914D\u7F6E\u5417\uFF1F\u8FD8\u539F\u540E\u7684\u914D\u7F6E\u5C06\u88AB\u91CD\u7F6E\u4E3A\u521D\u59CB\u72B6\u6001\uFF01"
  };
};
var qsForAskWhatPkgManger = (cliList, defaultCli) => {
  const list = cliList.filter((item) => item !== defaultCli);
  list.unshift(defaultCli);
  return {
    name: "askWhatPkgManger",
    type: "search",
    required: true,
    message: "\u65E0\u6CD5\u786E\u5B9A\u5F53\u524D\u9879\u76EE\u4F7F\u7528\u7684\u5305\u7BA1\u7406\u5668\uFF0C\u8BF7\u9009\u62E9\u4E00\u4E2A\uFF1A",
    default: false,
    choices: list.map((item) => ({
      name: item === defaultCli ? `${item} (\u9ED8\u8BA4)` : item,
      value: item
    }))
  };
};
var qsForAskInitStorage = () => {
  return {
    name: "isInitStorage",
    type: "confirm",
    default: false,
    require: true,
    message: "\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u8FD8\u672A\u521D\u59CB\u5316git\uFF0C\u662F\u5426\u9700\u8981\u521D\u59CB\u5316\uFF1F"
  };
};
var qsForAddStorageRemote = (message) => {
  return {
    name: "addStorageRemote",
    type: "input",
    message
  };
};
var qsForChooseRemote = (branchList) => {
  return {
    name: "chooseStorageRemote",
    type: "search",
    require: true,
    default: false,
    message: "\u5F53\u524D\u9879\u76EE\u4E0B\u5B58\u5728\u591A\u4E2A\u8FDC\u7A0B\u5730\u5740\uFF0C\u8BF7\u9009\u62E9\u4E00\u4E2A\uFF1A",
    choices: branchList.map((it) => ({ name: it, value: it }))
  };
};
var qsForPushType = (types) => {
  return [
    {
      name: "type",
      type: "search",
      require: true,
      message: "\u9009\u62E9\u672C\u6B21\u7684\u63D0\u4EA4\u7C7B\u578B\uFF1A",
      choices: types
    },
    {
      name: "msg",
      type: "input",
      require: true,
      default: "",
      message: "\u8F93\u5165\u672C\u6B21\u7684\u63D0\u4EA4\u5907\u6CE8\u5185\u5BB9\uFF1A"
    }
  ];
};
var qsForStraightforwardPushRemote = () => {
  return {
    name: "straightforwardPushRemote",
    type: "confirm",
    require: true,
    default: false,
    message: "\u9879\u76EE\u672A\u5B58\u5728\u53D8\u66F4\uFF0C\u4F46\u5B58\u5728\u672A\u63D0\u4EA4\u7684\u6587\u4EF6\uFF0C\u662F\u5426\u76F4\u63A5\u63A8\u9001\uFF1F"
  };
};
var qsForTempStorageFile = (files) => {
  return {
    name: "tempStorageFile",
    type: "checkbox",
    message: `\u8BF7\u5728\u4EE5\u4E0B\u5217\u8868\u4E2D\u9009\u62E9\u672C\u6B21\u9700\u8981\u63D0\u4EA4\u7684\u6587\u4EF6: (\u8F93\u5165I/A\u53EF\u5BF9\u6587\u4EF6\u8FDB\u884C\u5168\u9009\u6216\u53CD\u9009)
`,
    required: true,
    choices: files.map((item) => ({
      name: item,
      value: item
    }))
  };
};
var qsForResetStorageFile = (files) => {
  return {
    name: "resetStorageFile",
    type: "checkbox",
    message: `\u8BF7\u5728\u4EE5\u4E0B\u5217\u8868\u4E2D\u9009\u62E9\u672C\u6B21\u9700\u8981\u56DE\u9000\u7684\u6587\u4EF6: (\u8F93\u5165I/A\u53EF\u5BF9\u6587\u4EF6\u8FDB\u884C\u5168\u9009\u6216\u53CD\u9009)
`,
    required: true,
    choices: files.map((item) => ({
      name: item,
      value: item
    }))
  };
};
var qsForAskTlNameAndUrl = () => {
  return {
    name: "nameAndUrl",
    type: "input",
    message: `\u8BF7\u8F93\u5165\u6A21\u677F\u540D\u79F0\u53CAgit\u4ED3\u5E93\u5730\u5740\uFF08\u4E2D\u95F4\u4F7F\u7528\u4E00\u4E2A\u7A7A\u683C\u9694\u5F00\uFF09\uFF1A
`,
    require: true,
    default: ""
  };
};
var qsForAskTlDes = () => {
  return {
    name: "nameAndUrl",
    type: "input",
    message: `\u8BF7\u8F93\u5165\u6B64\u6A21\u677F\u7684\u63CF\u8FF0\u4FE1\u606F\u3002\uFF08\u4F7F\u7528init\u547D\u4EE4\u65F6\uFF0C\u4F1A\u663E\u793A\u6B64\u4FE1\u606F\uFF09\uFF1A
`,
    require: true,
    default: ""
  };
};
var qsForAskTlStorage = (storages) => {
  return {
    name: "tlStorage",
    type: "checkbox",
    message: "\u8BF7\u9009\u62E9\u4E00\u4E2A\u6A21\u677F\u4ED3\u5E93\uFF1A (\u8F93\u5165I/A\u53EF\u5BF9\u6587\u4EF6\u8FDB\u884C\u5168\u9009\u6216\u53CD\u9009)",
    choices: storages.map((item) => ({
      name: item.text,
      value: item.name
    }))
  };
};
var qsForAskSingleStorage = (storages) => {
  return {
    name: "singleStorage",
    type: "search",
    message: "\u8BF7\u9009\u62E9\u4EC5\u4E00\u4E2A\u6A21\u677F\u4ED3\u5E93\uFF1A ",
    choices: storages.map((item) => ({
      name: item.text,
      value: item.name
    }))
  };
};

// packages/core/src/module/config.ts
class Config2 extends Config {
  #inquirer;
  constructor() {
    super({
      sourcePath: config_tool_file_path(),
      defaultContent: Object.keys(config_default_option).reduce((config2, key) => {
        config2[key] = config_default_option[key].value;
        return config2;
      }, {})
    });
    this.#inquirer = new Inquirer;
  }
  async invalidSetContent(key, value) {
    const keys = Object.keys(config_default_option);
    if (!keys.includes(key))
      return;
    const keyItem = config_default_option[key];
    if ("require" in keyItem) {
      const valid = keyItem.require(value);
      if (!valid)
        throw new Error(keyItem?.error || "\u503C\u8BBE\u7F6E\u5F02\u5E38");
    }
  }
  outputList() {
    const stringifyData = this.stringify().split(`
`);
    for (const config2 of stringifyData) {
      const key = config2.slice(0, config2.indexOf(" "));
      if (key in config_default_option) {
        console.log(`${config2.replace("\r", "")} \u3010${config_default_option[key]["description"]}\u3011`);
      }
    }
  }
  getConfigResult(key) {
    if (!this.has(key))
      return;
    return this.get(key);
  }
  getConfig(key) {
    if (!this.has(key))
      throw new Error(`${key} \u4E0D\u5B58\u5728\u6B64\u914D\u7F6E`);
    console.log(this.get(key));
  }
  setConfig(key, value) {
    if (key.includes("=")) {
      [key, value] = key.split("=");
    }
    this.invalidSetContent(key, value).then(() => {
      this.set(key, value);
    });
  }
  deleteConfig(key) {
    if (Object.keys(config_default_option).includes(key)) {
      throw new Error("\u5F53\u524DKey\u4E3A\u7CFB\u7EDF\u56FA\u5B9A\u9884\u8BBE\u503C\uFF0C\u65E0\u6CD5\u5220\u9664");
    }
    this.delete(key);
  }
  async resetConfig() {
    const resetConfig = await this.#inquirer.handler(qsForResetConfig());
    if (!resetConfig)
      return;
    this.reset();
    this.outputList();
  }
}

// packages/core/src/command/config.ts
class Config3 extends Config2 {
  start(type, ...rest) {
    const typeHandler = new Map([
      ["list", this.outputList],
      ["get", this.getConfig],
      ["set", this.setConfig],
      ["delete", this.deleteConfig],
      ["reset", this.resetConfig]
    ]);
    const handler = typeHandler.get(type);
    if (handler)
      handler.apply(this, rest);
  }
}

// packages/core/src/module/pjPkj.ts
class PjPkg {
  static get runtimeFlag() {
    return getRuntimeFlag("RUNTIME_CLI" /* cli */);
  }
  static getPackageName() {
    const flag = PjPkg.runtimeFlag;
    let cliList = [...support_package_manger_name];
    if (flag) {
      if (flag === "bun") {
        cliList = cliList.filter((it) => ["bun"].includes(it));
      } else if (flag === "node") {
        cliList = cliList.filter((it) => ["npm", "yarn", "pnpm"].includes(it));
      }
    }
    return cliList;
  }
  static async getPkg(cwd) {
    let cli = getPackageMangerName(cwd);
    if (!cli) {
      const pkgMangerConfig = new Config({
        sourcePath: config_pkg_manger_file_path(),
        defaultContent: {}
      });
      cli = pkgMangerConfig.get(cwd);
      if (!cli) {
        const config2 = new Config2;
        if (config2.get("unknown_pkg_ask")) {
          const cliList = PjPkg.getPackageName();
          if (cliList.length === 1 && cliList[0]) {
            cli = cliList[0];
          } else {
            const inquirer2 = new Inquirer;
            cli = await inquirer2.handler(qsForAskWhatPkgManger(cliList, config2.get("package_cli")));
          }
          pkgMangerConfig.set(cwd, cli);
        }
      }
    } else {
      const flag = PjPkg.runtimeFlag;
      if (flag) {
        if (flag === "node" && cli === "bun" || flag === "bun" && cli !== "bun") {
          throw new Error("\u5F53\u524D\u9879\u76EE\u4E2D\u7684\u5305\u7BA1\u7406\u5668\u4E0E\u8FD0\u884C\u5DE5\u5177\u4E0D\u5339\u914D\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5~");
        }
      }
    }
    if (cli)
      return cli;
    throw new Error("\u5F53\u524D\u8DEF\u5F84\u4E0B\u65E0\u6CD5\u786E\u5B9A\u4F7F\u7528\u5177\u4F53\u7684\u5305\u7BA1\u7406\u5668\uFF01");
  }
  static async getCwd() {
    return searchCwdPath("package.json");
  }
}

// packages/core/src/command/add.ts
class AddPackage {
  #config;
  constructor() {
    this.#config = new Config2;
  }
  async verify() {
    const cwd = await PjPkg.getCwd();
    const cli = await PjPkg.getPkg(cwd);
    return { cwd, cli };
  }
  async start(packages2) {
    packages2 = Array.from(new Set([...packages2]));
    const { cwd, cli } = await this.verify();
    let mirror = this.#config.get("mirror_registry");
    let isMirrorAction = this.#config.get("install_use_mirror");
    if (packages2.includes("--registry")) {
      const index = packages2.indexOf("--registry");
      const newMirror = packages2[index + 1];
      if (newMirror) {
        mirror = newMirror;
        isMirrorAction = true;
        packages2.splice(index, 2);
      }
    }
    new Packages({
      packages: packages2,
      cwd,
      toolCli: cli,
      isMirrorAction,
      mirrorRegistry: mirror
    }).action("install");
  }
}

// packages/core/src/command/del.ts
class DelPackage {
  async verify() {
    const cwd = await PjPkg.getCwd();
    const cli = await PjPkg.getPkg(cwd);
    return { cwd, cli };
  }
  async start(packages2) {
    packages2 = Array.from(new Set([...packages2]));
    const { cwd, cli } = await this.verify();
    const emptyPkgs = !packages2.find((it) => it?.trim() && !it.startsWith("-"));
    if (emptyPkgs)
      throw new Error("\u547D\u4EE4\u4E2D\u8BF7\u63D0\u4F9B\u9700\u8981\u5378\u8F7D\u7684\u5305");
    new Packages({
      cwd,
      toolCli: cli,
      packages: packages2
    }).action("uninstall");
  }
}

// packages/core/src/command/run.ts
class Run {
  async verify() {
    const cwd = await PjPkg.getCwd();
    const cli = await PjPkg.getPkg(cwd);
    return { cwd, cli };
  }
  async start(command, args) {
    const { cwd, cli } = await this.verify();
    const commandArgs = [command, ...args];
    const fullCommand = commandArgs.join(" ");
    const emptyPkgs = !commandArgs.find((it) => it?.trim() && !it.startsWith("-"));
    if (emptyPkgs)
      throw new Error("\u547D\u4EE4\u4E2D\u8BF7\u63D0\u4F9B\u9700\u8981\u8FD0\u884C\u7684\u9879\u76EE\u547D\u4EE4");
    await execProjectCommandInCwd(cli, cwd, fullCommand).catch((e) => {
      throw new Error(`\u6267\u884C\u9879\u76EE\u547D\u4EE4\u5931\u8D25\uFF1A
` + (e.message || e));
    });
  }
}

// packages/core/src/command/ex.ts
import { extname } from "path";
class ExecFile {
  async getRuntimeCli(suffix) {
    let cli = getRuntimeFlag("RUNTIME_CLI" /* cli */);
    if (!cli) {
      if (suffix === ".js")
        return "node";
      else
        return "bun";
    }
    if (cli === "node" && suffix !== ".js") {
      throw new Error("\u76F4\u63A5\u8FD0\u884Cjs\u6587\u4EF6\u65F6\uFF0C\u63A8\u8350\u4F7F\u7528bun\u5DE5\u5177\uFF0C\u5B89\u88C5\u6587\u6863\uFF1Ahttps://bun.com/docs/installation");
    }
    return cli;
  }
  async verifyFileName(suffix) {
    if (!suffix) {
      throw new Error("\u547D\u4EE4\u8F93\u5165\u9519\u8BEF\u6216\u65E0\u6CD5\u8BC6\u522B\u9700\u8981\u6267\u884C\u7684\u6587\u4EF6\u7C7B\u578B\uFF0C\u8BF7\u786E\u8BA4\u547D\u4EE4\u8F93\u5165\u6216\u6587\u4EF6\u540D\u79F0\u662F\u5426\u6B63\u786E");
    }
    if (!support_exec_file.includes(suffix)) {
      throw new Error(`\u5F53\u524D\u6587\u4EF6\u4E0D\u652F\u6301\u88AB\u6267\u884C\uFF0C\u4EC5\u652F\u6301 "${support_exec_file.join("/")}" \u6587\u4EF6`);
    }
  }
  async runFileInCwd(cli, command) {
    const runStr = ["bun"].includes(cli) ? "run" : "";
    command = `${cli} ${runStr}${runStr ? " " : ""}${command}`;
    await execCommand(command, {
      cwd: process.cwd(),
      stdio: "inherit"
    });
  }
  async start(filename, args) {
    const suffix = extname(filename);
    await this.verifyFileName(suffix);
    const runtimeCli = await this.getRuntimeCli(suffix);
    await this.runFileInCwd(runtimeCli, [filename, ...args].join(" "));
  }
}

// packages/core/src/module/pjGit.ts
import { resolve as resolve3 } from "path";

// packages/core/src/constance/runtime.ts
var IgnoreFlag = "IGNORE-FLAG";

// packages/core/src/module/pjGit.ts
class PjGit extends Git {
  #inquirer;
  constructor() {
    super();
    this.#inquirer = new Inquirer;
  }
  async confirmGitEnv() {
    const git3 = getRuntimeFlag("RUNTIME_GIT" /* git */);
    if (!Number(git3))
      throw new Error("\u5F53\u524D\u7CFB\u7EDF\u672A\u5B89\u88C5git\uFF0C\u8BF7\u5B89\u88C5\u540E\u91CD\u8BD5~");
    const hasGit2 = await this.env();
    if (!hasGit2) {
      const init = await this.#inquirer.handler(qsForAskInitStorage());
      if (init)
        await this.initGit();
      throw new Error(IgnoreFlag);
    }
  }
  async confirmGitRemote() {
    let remote = "";
    const remoteList = await this.remote();
    if (remoteList.length <= 0) {
      const originRemote = await this.#inquirer.handler(qsForAddStorageRemote(`\u5F53\u524D\u4ED3\u5E93\u4E2D\u4E0D\u5B58\u5728\u8FDC\u7A0B\u5730\u5740\uFF0C\u8BF7\u6DFB\u52A0\uFF1A(\u540D\u79F0\u548C\u5730\u5740\u4F7F\u7528\u4EC5\u4E00\u4E2A\u7A7A\u683C\u9694\u5F00)<remote-name> <remote-url>
`));
      const [name, url] = originRemote.split(" ");
      if (!name?.trim() || !isValidGitUrl(url)) {
        throw new Error("\u8FDC\u7A0B\u5730\u5740\u540D\u79F0\u6216\u5730\u5740\u65E0\u6548\uFF0C\u8BF7\u91CD\u8BD5\uFF01");
      }
      await Remote.addRemote(name, url);
      throw new Error(IgnoreFlag);
    } else {
      if (remoteList.length > 1) {
        remote = await this.#inquirer.handler(qsForChooseRemote(remoteList.map((it) => it.origin)));
      } else {
        remote = remoteList[0]?.origin;
      }
    }
    return remote;
  }
  async confirmBranch() {
    const branch = await this.currentBranch();
    if (branch)
      return branch;
    throw new Error("\u5F53\u524D\u6240\u5728\u5206\u652F\u4E3A\u7A7A\uFF0C\u8BF7\u5207\u6362\u5206\u652F\u540E\u91CD\u8BD5~");
  }
  async confirmLocalCommitFile() {
    let dfFile = await this.getWorkspaceFile();
    return dfFile.length ? await this.#inquirer.handler(qsForTempStorageFile(dfFile)) : dfFile;
  }
  async confirmPushFile() {
    let type = "local";
    let localFile = await this.confirmLocalCommitFile();
    if (!localFile.length) {
      const citFile = await this.getNotPushRemoteFile();
      if (!citFile?.length)
        throw new Error("\u5F53\u524D\u5206\u652F\u4E0B\uFF0C\u4E0D\u5B58\u5728\u9700\u8981\u63D0\u4EA4\u7684\u6587\u4EF6~");
      const isPushFile = await this.#inquirer.handler(qsForStraightforwardPushRemote());
      if (isPushFile) {
        type = "remote";
        localFile = citFile;
      } else {
        throw new Error(IgnoreFlag);
      }
    }
    return { type, file: localFile };
  }
  async confirmPushType() {
    const types = Object.keys(commit_type_list).map((key) => ({
      name: `${key}\uFF1A${commit_type_list[key]}`,
      value: key
    }));
    return await this.#inquirer.handler(qsForPushType(types));
  }
  async rewriteMsg() {
    const { type, msg } = await this.confirmPushType();
    await new GitCommit().rewriteCommitMsg(type, msg);
    this.showGitLog();
  }
  async resetTempOrCommitAction(type) {
    const commit = new GitCommit;
    if (type === "local") {
      const tempFiles = await this.getTempStorageFile();
      if (!tempFiles.length)
        throw new Error("\u5F53\u524D\u6682\u5B58\u533A\u65E0\u53EF\u64A4\u56DE\u7684\u6587\u4EF6~");
      const files = await this.#inquirer.handler(qsForResetStorageFile(tempFiles));
      await commit.resetTempStorageFile(files);
    } else {
      await commit.resetFileToCommit();
    }
  }
  async confirmTagVersion() {
    const cwd = await searchCwdPath(".git");
    const pg = resolve3(cwd, "package.json");
    const res = await import(pg);
    return res.version;
  }
}

// packages/core/src/command/push.ts
class Push extends PjGit {
  async verify() {
    await this.confirmGitEnv();
    const remote = await this.confirmGitRemote();
    const branch = await this.confirmBranch();
    return { remote, branch };
  }
  async start(option) {
    const { remote, branch } = await this.verify();
    const options = await this.confirmPushFile();
    if (!options || !remote || !branch)
      return;
    let version2 = "";
    if (option.tag) {
      const config2 = new Config2;
      const mainBranch = config2.get("main_branch").split("/");
      if (mainBranch.includes(branch)) {
        version2 = await this.confirmTagVersion();
      }
    }
    if (options.type === "remote") {
      await this.pushRemote({ remote, branch, tag: version2 });
    } else {
      const { type, msg } = await this.confirmPushType();
      await this.commitPushRemote({
        remote,
        branch,
        type,
        msg,
        file: options.file,
        tag: version2
      });
    }
  }
}

// packages/core/src/command/commit.ts
class Commit extends PjGit {
  async verify() {
    await this.confirmGitEnv();
  }
  async start(option) {
    await this.verify();
    if (option.amend)
      return this.rewriteMsg();
    let localFile = await this.confirmLocalCommitFile();
    if (!localFile.length)
      throw new Error("\u5F53\u524D\u9879\u76EE\u4E0B\uFF0C\u6682\u65E0\u9700\u8981\u6682\u5B58\u7684\u6587\u4EF6~");
    const { type, msg } = await this.confirmPushType();
    await this.commitToLocal({ file: localFile, type, msg });
  }
}

// packages/core/src/command/reset.ts
class Reset extends PjGit {
  async verify() {
    await this.confirmGitEnv();
  }
  async start(option) {
    await this.verify();
    this.resetTempOrCommitAction(option.commit ? "commit" : "local");
  }
}

// packages/core/src/module/template.ts
class Template {
  #inquirer;
  config;
  constructor() {
    this.#inquirer = new Inquirer;
    this.config = new Config({
      sourcePath: config_tl_file_path(),
      defaultContent: {}
    });
  }
  async add(list) {
    const result = await this.#inquirer.handler(qsForAskTlNameAndUrl());
    const [name, url] = result.split(" ");
    if (!name || !url)
      throw new Error("\u6A21\u677F\u540D\u79F0\u53CA\u4ED3\u5E93\u5730\u5740\u4E0D\u53EF\u4E3A\u7A7A~");
    if (name in list || Object.values(list).includes(url)) {
      throw new Error("\u6A21\u677F\u4ED3\u5E93\u540D\u79F0\u6216\u4ED3\u5E93\u5730\u5740\u5DF2\u5B58\u5728\uFF0C\u4E0D\u53EF\u91CD\u590D\u6DFB\u52A0~");
    }
    if (!isValidGitUrl(url))
      throw new Error("\u4ED3\u5E93\u5730\u5740\u683C\u5F0F\u65E0\u6548~");
    const des = await this.#inquirer.handler(qsForAskTlDes());
    return { name, url, des };
  }
  async delete() {
    const list = this.lists();
    const names = await this.#inquirer.handler(qsForAskTlStorage(list));
    for (const name of names) {
      this.config.delete(name);
    }
  }
  lists() {
    const tlList = this.config.stringify();
    const tls = [];
    if (!tlList.trim())
      return [];
    for (const config2 of tlList.split(`
`)) {
      const nameEndIndex = config2.indexOf(" ");
      const name = config2.slice(0, nameEndIndex);
      const value = config2.replace("->", "\u3010").replace("\r", "") + "\u3011";
      tls.push({
        name,
        value,
        text: `${name}\uFF08${value.slice(value.indexOf("\u3010") + 1, -1)}\uFF09`
      });
    }
    return tls;
  }
}

// packages/core/src/command/tl.ts
class Tl extends Template {
  constructor() {
    super();
  }
  async addTl() {
    const list = await this.config.list();
    const { name, url, des } = await this.add(list);
    this.config.set(name, `${url}->${des}`);
    this.listTl();
  }
  async listTl() {
    const list = this.lists();
    for (const config2 of list) {
      console.log(config2.value);
    }
  }
  async delTl() {
    const list = await this.config.list();
    if (!Object.keys(list).length)
      throw new Error("\u6A21\u677F\u5217\u8868\u4E3A\u7A7A\uFF0C\u8BF7\u5148\u6DFB\u52A0~");
    this.delete();
    this.listTl();
  }
}

// packages/core/src/command/init.ts
class Init {
  #tl;
  #inquirer;
  constructor() {
    this.#tl = new Template;
    this.#inquirer = new Inquirer;
  }
  async getGitUrl() {
    const lists = this.#tl.lists();
    const name = await this.#inquirer.handler(qsForAskSingleStorage(lists));
    const [url] = this.#tl.config.get(name).split("->");
    return url;
  }
  async cloneProject(url) {
    const git3 = new Git;
    await git3.cloneGitProject(url, process.cwd());
  }
  async start() {
    const hasGit2 = getRuntimeFlag("RUNTIME_GIT" /* git */);
    if (!hasGit2)
      throw new Error("\u5F53\u524D\u7CFB\u7EDF\u672A\u5B58\u5728git\uFF0C\u8BF7\u6839\u636E\u6B64\u94FE\u63A5\u8FDB\u884C\u5B89\u88C5\u540E\u91CD\u8BD5\uFF1Ahttps://git-scm.com");
    const url = await this.getGitUrl();
    await this.cloneProject(url);
  }
}

// packages/core/src/constance/command.ts
var registerCommandOption = () => {
  return [
    {
      command: "config",
      description: "\u7BA1\u7406\u547D\u4EE4\u884C\u5DE5\u4F5C\u7684\u914D\u7F6E\u4FE1\u606F",
      children: [
        {
          command: "list",
          description: "\u83B7\u53D6\u547D\u4EE4\u884C\u914D\u7F6E\u5217\u8868",
          action: (...rest) => {
            new Config3().start("list", ...rest);
          }
        },
        {
          command: "get <key>",
          description: "\u83B7\u53D6\u547D\u4EE4\u884C\u7684\u914D\u7F6E\u4FE1\u606F",
          action: (...rest) => {
            new Config3().start("get", ...rest);
          }
        },
        {
          command: "set <key> [value]",
          description: "\u8BBE\u7F6E\u547D\u4EE4\u884C\u7684\u914D\u7F6E\u4FE1\u606F",
          action: (...rest) => {
            new Config3().start("set", ...rest);
          }
        },
        {
          command: "del <key>",
          description: "\u5220\u9664\u547D\u4EE4\u884C\u914D\u7F6E\u4FE1\u606F",
          action: (...rest) => {
            new Config3().start("delete", ...rest);
          }
        },
        {
          command: "reset",
          description: "\u91CD\u7F6E\u547D\u4EE4\u884C\u914D\u7F6E\u4FE1\u606F",
          action: () => {
            new Config3().start("reset");
          }
        }
      ]
    },
    {
      command: "add [package@version...]",
      description: "\u5728\u672C\u5730\u9879\u76EE\u4E2D\u5B89\u88C5\u4E00\u4E2A\u6216\u591A\u4E2A\u4F9D\u8D56\u5305",
      allowUnknownOption: true,
      action: (packages2) => {
        new AddPackage().start(packages2);
      }
    },
    {
      command: "del [package@version...]",
      description: "\u5728\u672C\u5730\u9879\u76EE\u4E2D\u5220\u9664\u4E00\u4E2A\u6216\u591A\u4E2A\u4F9D\u8D56\u5305",
      allowUnknownOption: true,
      action: (packages2) => {
        new DelPackage().start(packages2);
      }
    },
    {
      command: "run <command> [args...]",
      allowUnknownOption: true,
      description: "\u5728\u672C\u5730\u9879\u76EE\u4E2D\u8FD0\u884C\u4E00\u4E2A\u9879\u76EE\u547D\u4EE4",
      action: (command, args) => {
        new Run().start(command, args);
      }
    },
    {
      command: "ex <filename> [args...]",
      allowUnknownOption: true,
      description: "\u5728\u5F53\u524D\u7684\u76EE\u5F55\u4E0B\u4F7F\u7528(node/bun)\u6267\u884C\u4E00\u4E2A\u6587\u4EF6\uFF08\u652F\u6301 .js/.ts/.html \u6587\u4EF6\uFF09",
      action: (file, args) => {
        new ExecFile().start(file, args);
      }
    },
    {
      command: "push",
      description: "\u5C06\u672C\u5730\u4EE3\u7801\u63D0\u4EA4\u81F3\u8FDC\u7A0B\u4ED3\u5E93",
      option: [
        {
          command: "-t --tag",
          description: "\u63A8\u9001\u65F6\uFF0C\u662F\u5426\u6DFB\u52A0tag(\u53D6package.json\u4E2D\u7684version\u5B57\u6BB5)"
        }
      ],
      action: (option) => {
        new Push().start(option);
      }
    },
    {
      command: "commit",
      description: "\u5C06\u4EE3\u7801\u63D0\u4EA4\u81F3\u672C\u5730\u5DE5\u4F5C\u533A",
      option: [
        {
          command: "-a --amend",
          description: "\u4FEE\u6539\u6700\u8FD1\u4E00\u6B21\u672C\u5730\u5DE5\u4F5C\u533A\u7684\u63D0\u4EA4\u63CF\u8FF0"
        }
      ],
      action: (option) => {
        new Commit().start(option);
      }
    },
    {
      command: "reset",
      description: "\u8FD8\u539F\u6682\u5B58\u533A\u6216\u5DF2\u63D0\u4EA4\u81F3\u672C\u5730\u7684\u4EE3\u7801",
      option: [
        {
          command: "-c --commit",
          description: "\u5C06\u6700\u8FD1\u4E00\u6B21\u63D0\u4EA4\u81F3\u672C\u5730\u7684\u4EE3\u7801\u56DE\u9000\u81F3\u6682\u5B58\u533A"
        }
      ],
      action: (option) => {
        new Reset().start(option);
      }
    },
    {
      command: "tl",
      description: "\u7BA1\u7406\u9879\u76EE\u6A21\u677F\uFF0C\u6267\u884Cinit\u65F6\uFF0C\u53EF\u6839\u636E\u6B64\u6A21\u677F\u521B\u5EFA\u9879\u76EE\uFF08\u9879\u76EE\u6A21\u677F\u53EA\u80FD\u662F\u4E00\u4E2Agit\u4ED3\u5E93\uFF09",
      children: [
        {
          command: "add",
          description: "\u6DFB\u52A0\u4E00\u4E2A\u9879\u76EE\u6A21\u677F",
          action: () => {
            new Tl().addTl();
          }
        },
        {
          command: "del",
          description: "\u5220\u9664\u4E00\u4E2A\u9879\u76EE\u6A21\u677F",
          action: () => {
            new Tl().delTl();
          }
        },
        {
          command: "list",
          description: "\u67E5\u770B\u6A21\u677F\u5217\u8868",
          action: () => {
            new Tl().listTl();
          }
        }
      ]
    },
    {
      command: "init",
      description: "\u57FA\u4E8Etl\u521B\u5EFA\u7684\u6A21\u677F\u4ED3\u5E93\uFF0C\u521B\u5EFA\u4E00\u4E2A\u9879\u76EE\uFF08\u4F1A\u53D6 \u914D\u7F6E\u53C2\u6570 main_branch \u7684\u5206\u652F\u4EE3\u7801\uFF09",
      action: () => {
        new Init().start();
      }
    },
    {
      usage: process.env.APP_NAME,
      version: getRuntimeConfig("app_version"),
      option: [{ command: "-v", hideHelp: true }],
      description: getRuntimeConfig("app_description")
    }
  ];
};

// packages/core/src/command/main.ts
class BaseCommand extends RegisterCommand {
  constructor() {
    super({
      commandOption: registerCommandOption
    });
  }
  start() {
    this.commandGlobalCatch((source, dest) => {
      const args = dest.args, isEmptySource = import_pkg3.isEmptyJSON(source);
      if (args?.at(0) === "help" || isEmptySource && !args.length) {
        this.program.outputHelp();
      } else if (source.v) {
        console.log(getRuntimeConfig("app_version"));
      } else {
        console.log("\u65E0\u6548\u7684\u6307\u4EE4:", dest.args.join("\u3001"));
      }
    });
    this.register();
  }
}

// packages/core/src/index.ts
class CommanderCore {
  start() {
    this.init().then(() => {
      new BaseCommand().start();
    }).catch((e) => {
      throw new Error("\u547D\u4EE4\u884C\u5DE5\u5177\u521D\u59CB\u5316\u5931\u8D25~" + e.message || e);
    });
  }
  setAppConfig() {
    Object.entries(app_config).forEach(([key, value]) => {
      setRuntimeConfig(key, value);
    });
  }
  tipsSystemEnv() {
    const git3 = getRuntimeFlag("RUNTIME_GIT" /* git */);
    if (!git3)
      console.warn(`
\u5F53\u524D\u7CFB\u7EDF\u672A\u5B89\u88C5git, \u76F8\u5173git\u64CD\u4F5C\u5C06\u65E0\u6CD5\u4F7F\u7528\uFF0C\u8BF7\u6839\u636E\u6B64\u94FE\u63A5\u8FDB\u884C\u5B89\u88C5\uFF1Ahttps://git-scm.com 
`);
  }
  updateDefaultConfig() {
    const cliFlag = getRuntimeFlag("RUNTIME_CLI" /* cli */);
    if (cliFlag) {
      const config2 = new Config2;
      const cli = config2.get("package_cli");
      if (cliFlag === "bun" && cli !== "bun") {
        config2.setConfig("package_cli", "bun");
      } else if (cliFlag === "node" && cli === "bun") {
        config2.setConfig("package_cli", "npm");
      }
    }
  }
  async init() {
    await checkSystem();
    this.setAppConfig();
    createCacheDir();
    this.tipsSystemEnv();
    this.updateDefaultConfig();
  }
}

// src/main.ts
var __dirname = "F:\\vanner\\src";
import_dotenv.default.config({ path: path5.resolve(__dirname, "../.env"), quiet: true });
new CommanderCore().start();
