const test = require('ava').default
const { Template } = require('./Template')
const prettier = require('prettier')

const templateStr = `
    <script>
      __SCRIPT__
    </script>

    __BODY__
    `

test('Template derives template from template string', t => {
    const template = new Template(templateStr, { parser: 'html' })
    t.is(template.script.name, 'script')
    t.is(template.body.name, 'body')
})

test('Template can prepend a new placeholder', t => {
    const template = new Template(templateStr, { parser: 'html' })
    template.prepend('prefix')
    t.is(template.prefix.name, 'prefix')
    t.regex(template._template, /^__PREFIX__/)
})

test('Template can append a new placeholder', t => {
    const template = new Template(templateStr, { parser: 'html' })
    template.prepend('sufix')
    t.is(template.sufix.name, 'sufix')
    t.regex(template._template, /^__SUFIX__/)
})

test('a placeholder can append a new placeholder', t => {
    const template = new Template(templateStr, { parser: 'html' })
    template.script.append('constants')
    t.is(template.constants.name, 'constants')
    t.is(template._template, templateStr.replace('__SCRIPT__', `__SCRIPT__\n\n__CONSTANTS__`),
        'template should contain __CONSTANTS__ after __SCRIPT__'
    )
})

test('a placeholder can prepend a new placeholder', t => {
    const template = new Template(templateStr, { parser: 'html' })
    template.script.prepend('imports')
    t.is(template.imports.name, 'imports')
    t.regex(template._template, /__IMPORTS__.+__SCRIPT__/s,
        'template should contain __IMPORTS__ before __SCRIPT__')
})

test('template class can create an output from its template', async t => {
    const template = new Template(templateStr, { parser: 'html' })
    const output = await template._getOutput()
    t.regex(output, /<script>/s,)
})

test('a placeholder can push and unshift strings', async t => {
    const template = new Template(templateStr, { parser: 'html' })
    const str1 = 'console.log("push1")'
    const str2 = 'console.log("push2")'
    const str3 = 'console.log("unshift1")'
    const str4 = 'console.log("unshift2")'
    template.script.push(str1)
    template.script.push(str2)
    template.script.unshift(str3)
    template.script.unshift(str4)
    t.is(template.script.parts[0].str, str4)
    t.is(template.script.parts[1].str, str3)
    t.is(template.script.parts[2].str, str1)
    t.is(template.script.parts[3].str, str2)

    const output = await template._getOutput()
    const format = input => prettier.format(input, { parser: 'html' })

    const expect = `
    <script>
        console.log('unshift2')
        console.log('unshift1')
        console.log('push1')
        console.log('push2')
    </script>`

    t.is(format(output), format(expect))
})