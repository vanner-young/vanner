const fs = require("fs");
const ini = require("ini");
const { basicCommon } = require("@mv-cli/common");

class Config {
    #source;
    #encoding;
    data = new Map();
    constructor({ source, encoding = "utf8" }) {
        this.#source = source;
        this.#encoding = encoding;
    }

    load({ defaultContent } = {}) {
        basicCommon.writeNotExistsFile(this.#source, defaultContent || "");

        const parseContent = ini.parse(
            basicCommon.readFileIsExists(this.#source).toString(),
        );
        if (Object.keys(parseContent)?.length) {
            Object.entries(parseContent).forEach(([key, value]) => {
                this.data.set(key, value);
            });
        }
    }

    get(key) {
        return this.data.get(key);
    }

    set(key, value) {
        if (!value) {
            if (!this.data.get(key)) return;
            this.data.delete(key);
        } else {
            this.data.set(key, value);
        }
        this.save();
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
