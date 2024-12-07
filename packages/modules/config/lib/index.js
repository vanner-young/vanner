const ini = require("ini");
const path = require("path");
const { basicCommon, platform } = require("@vanner/common");

class Config {
    #source;
    #encoding = "utf8";
    #defaultContent = {};
    data = new Map();
    constructor({ source, encoding, defaultContent = {} }) {
        this.#source = source;
        this.#encoding = encoding || this.#encoding;
        this.#defaultContent = defaultContent;

        this.load();
    }
    #coverContent(parseContent) {
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
    setProcessEnv() {
        platform.setProcessEnv(
            Object.entries(Object.fromEntries(this.data)).map(
                ([key, value]) => ({
                    key,
                    value,
                }),
            ),
        );
    }
    load() {
        basicCommon.createFile(
            this.#source,
            ini.stringify(this.#defaultContent).trim(),
        );
        this.#coverContent(
            ini.parse(basicCommon.readExistsFile(this.#source).toString()),
        );
        this.#writeNotExistsDefaultData();
        this.setProcessEnv();
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
        if (!this.has(key)) return;
        this.data.delete(key);
        this.save();
    }

    reset() {
        const sourceFileName = path.basename(this.#source);
        const CachePath = path.resolve(
            path.dirname(this.#source),
            `.Cache/Config/${sourceFileName}.${Date.now()}`,
        );

        basicCommon.createFile(
            CachePath,
            ini.stringify(Object.fromEntries(this.data)).trim(),
            true,
        );
        this.#coverContent(this.#defaultContent);
    }

    save() {
        basicCommon.createFile(this.#source, this.stringify(), true);
    }

    list() {
        return Object.fromEntries(this.data);
    }

    stringify() {
        return ini.stringify(this.list()).trim();
    }
}

module.exports = Config;
