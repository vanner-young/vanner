"use strict";

const platform = require("./platform");
const basicCommon = require("mv-common");

const arrayExecSyncHandler = (cb, options) => {
    if (!Array.isArray(options)) return cb(options);

    return new Promise(async (resolve) => {
        const value = {};
        for (const item of options) {
            const val = await cb(item);
            value[item.name] = val;
        }
        return resolve(value);
    });
};

const filterObject = (value, filterList) => {
    if (
        !basicCommon.isType(value, "object") ||
        !basicCommon.isType(value, "array")
    )
        return value;

    const newVal = {};
    for (const key in value) {
        if (!filterList.includes(key)) newVal[key] = value[key];
    }
    return newVal;
};

const filterEmptyArray = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((item) => item.trim()).filter((item) => item);
};

const delay = async (timeout = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, timeout);
    });
};

module.exports = {
    platform,
    basicCommon,
    filterObject,
    arrayExecSyncHandler,
    filterEmptyArray,
    delay,
};
