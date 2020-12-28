module.exports = {
    configs: ({getConfig}) => ({
        loop1: getConfig('loop2'),
        loop2: getConfig('loop1')
    })
}