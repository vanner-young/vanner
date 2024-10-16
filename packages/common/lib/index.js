"use strict";

const platform = require("./platform");
const dfsParser = require("./dfsParser");
const basicCommon = require("mv-common");
const fileAction = require("./fileAction");

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
        !basicCommon.isArray(filterList)
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

module.exports = {
    platform,
    basicCommon,
    filterObject,
    arrayExecSyncHandler,
    dfsParser,
    fileAction,
    filterEmptyArray,
};
