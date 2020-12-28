module.exports = {
    configs: ({getConfig}) => ({
        stringFromDerived: getConfig('stringFromOther'),
        objectFromDerived: getConfig('objectFromOther')
    })
}