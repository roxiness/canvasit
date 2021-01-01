module.exports.patch = ({ placeholders, createAfter }) => {    
    createAfter('placeholder10', 'placeholder15')    
    
    placeholders.placeholder10 += `module.exports.placeholder10 = 10`
    placeholders.placeholder15 += `module.exports.placeholder15 = 15`    
    placeholders.placeholder20 += `module.exports.placeholder20 = 20`
}