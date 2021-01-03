module.exports.patch = ({ placeholders, configs }) => {

    placeholders.packagejson.push(JSON.stringify(configs.packagejson, null, 2))

}
