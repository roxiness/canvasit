module.exports = {
    configs: ({getConfig}) => ({
        stringFromOther: getConfig('string'),
        objectFromOther: getConfig('object')
    })
}