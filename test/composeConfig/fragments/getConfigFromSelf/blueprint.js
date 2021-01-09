module.exports = {
    configs: ({ getConfig }) => ({
        string: 'string',
        object: { object: 'object' },
        complex: { array: ['string'] },
        getString: getConfig('string'),
        getObject: getConfig('object'),
    })
}