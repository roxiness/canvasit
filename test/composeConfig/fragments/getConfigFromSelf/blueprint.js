module.exports = {
    configs: ({getConfig}) => ({
        string: 'string',
        object: {object: 'object'},
        getString: getConfig('string'),
        getObject: getConfig('object'),
    })
}