module.exports = function (dict, result) {
    return result.reduce((pre, item) => {
        pre = pre?.[item];
        return pre;
    }, dict);
};
