const ini = require("ini");
const path = require("path");
const { basicCommon } = require("@mvanner/common");

class Config {
    #source;
    #encoding = "utf8";
    #defaultContent = {};
    data = new Map();
    constructor({ source, encoding, defaultContent }) {
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
    load() {
        basicCommon.writeNotExistsFile(
            this.#source,
            ini.stringify(this.#defaultContent).trim(),
        );
        this.#coverContent(
            ini.parse(basicCommon.readFileIsExists(this.#source).toString()),
        );
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
        basicCommon.writeNotExistsFile(
            CachePath,
            ini.stringify(this.#defaultContent).trim(),
        );
        this.#coverContent(this.#defaultContent);
    }

    save() {
        basicCommon.writeCoverFile(this.#source, this.stringify());
    }

    list() {
        return Object.fromEntries(this.data);
    }

    stringify() {
        return ini.stringify(this.list()).trim();
    }
}

module.exports = Config;
