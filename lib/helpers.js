const { resolve } = require('path')
const { stringify } = require('./utils')
const { readFileSync, writeFileSync } = require('fs-extra')

function createHelpers({ output, configs }) {
    return {
        stringify,
        configs,
        /**
         * transforms a file
         * @param {string} filename 
         * @param {callback} transformFn 
         */
        transform: (filename, transformFn) => {
            const file = resolve(output, filename)
            const content = readFileSync(file, 'utf-8')
            const newContent = transformFn(content)
            writeFileSync(file, newContent)
        },
        /**
         * creates a file
         * @param {string} filename 
         * @param {string} content 
         */
        writeTo: (filename, content) => {
            const file = resolve(output, filename)
            writeFileSync(file, content)
        },
    }
}

module.exports = { createHelpers }