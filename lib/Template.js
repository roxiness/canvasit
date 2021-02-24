const { parse$requires, composeImports, mapDependenciesToVariables } = require("./utils")

class Template {
    constructor(template = '', options = {}) {
        this._options = options
        this._template = template

        this._placeholders = this._getPlaceholdersFromTemplate(template)
        return new Proxy(this, {
            get: function (target, prop, receiver) {
                if (typeof target[prop] !== 'undefined') return target[prop]
                return target._placeholders[prop]
            }
        })
    }

    /**
     * gets placeholders from a template
     * @param {string} content 
     * @returns {Object<string, Placeholder>}
     */
    _getPlaceholdersFromTemplate(content) {
        const results = content.match(/__[A-Z0-9_]+__/g) || []
        const placeholders = results
            .map(placeholderToName)
            .reduce((placeholders, name) => ({
                ...placeholders,
                [name]: new Placeholder(this, name)
            }), {})
        return placeholders
    }

    /**
     * creates a new placeholder
     * @param {string} name 
     * @param {Placeholder} sibling 
     * @param {'before'|'after'|'first'|'last'} order 
     */
    _create(name, sibling, order) {
        if (this._placeholders[name]) return false

        const inlineName = nameToPlaceholder(name)
        this._placeholders[name] = new Placeholder(this, name)

        const map = {
            before: () => this._template.replace(sibling.inlineName, `${inlineName}\n\n${sibling.inlineName}`),
            after: () => this._template.replace(sibling.inlineName, `${sibling.inlineName}\n\n${inlineName}`),
            first: () => `${inlineName}\n\n${this._template}`,
            last: () => `${this._template}\n\n${inlineName}`,
        }
        this._template = map[order]()
    }

    /**
     * returns a populated and sanitized template
     */
    async _getOutput() {
        // compose imports and declarations in placeholders
        const mode = this._placeholders.esm ? 'esm' : 'commonjs'
        Object.values(this._placeholders).forEach(placeholder => {
            placeholder.parts.forEach(part => {
                const { body, dependencies } = parse$requires(part.str)
                if (dependencies.length) {
                    const mappedDependencies = mapDependenciesToVariables(this._options.imports, dependencies)
                    const { imports, declarations } = composeImports(mappedDependencies, mode)
                    this._placeholders.imports.push(...imports)
                    this._placeholders.constants.push(...declarations)
                    part.str = body
                }
            })
        })

        // replace placeholders with their respective parts
        return (Object.values(this._placeholders))
            .reduce((str, { inlineName, parts }) =>
                str.replace(inlineName, parts.map(p => p.str).join('\n'))
                , this._template)
    }

    prepend(name) {
        this._create(name, null, 'first')
    }

    append(name) {
        this._create(name, null, 'last')
    }
}

class Placeholder {
    constructor(parent, name) {
        this.parent = parent
        this.name = name
        this.inlineName = nameToPlaceholder(name)
        this.parts = []
    }

    push(...parts) {
        this.parts.push(
            ...parts.map(str => new PlaceholderFragment({ parent: this, str }))
        )
    }
    unshift(...parts) {
        this.parts.unshift(
            ...parts.map(str => new PlaceholderFragment({ parent: this, str }))
        )
    }
    prepend(name) {
        this.parent._create(name, this, 'before')
    }
    append(name) {
        this.parent._create(name, this, 'after')
    }
}

class PlaceholderFragment {
    constructor({ parent, str }) {
        this.parent = parent
        this.str = str
    }
}


function placeholderToName(placeholder) {
    return placeholder
        .replace(/(^__|__$)/g, '')
        .toLowerCase()
        .replace(/_(.)/, (_, str) => str.toUpperCase())
}

function nameToPlaceholder(name) {
    return `__${name.replace(/([A-Z])/, '_$1').toUpperCase()}__`
}

module.exports = { Template }