module.exports.patch = ({ placeholders, createAfter }) => {
    placeholders.placeholder10.append('placeholder15')

    placeholders.placeholder10.push(`module.exports.placeholder10 = 10`)
    placeholders.placeholder15.push(`module.exports.placeholder15 = 15`)
    placeholders.placeholder20.push(`module.exports.placeholder20 = 20`)
}