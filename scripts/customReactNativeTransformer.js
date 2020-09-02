const {
    transform,
    getCacheKey,
} = require('metro/src/reactNativeTransformer');

function customTransform(config) {
    config.options.hot = false;
    return transform(config);
}

module.exports = {
    transform: customTransform,
    getCacheKey,
};
