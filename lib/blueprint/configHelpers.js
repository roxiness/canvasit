const { stringify } = require("../utils")
const { $require } = require("./$require")



const blueprintHelpers = {

    /**
     * returns a root config
     * @param {string} name 
     */
    getConfig(name) { return { __symlink: name } },

    /**
     * returns a stringified root config
     * unlike JSON.stringify, values are not stringified
     * @param {string} name 
     */
    getConfigString(name) { return `__SYMLINK(${name})__` },
    
    $require,
    stringify,
}

module.exports = { blueprintHelpers }