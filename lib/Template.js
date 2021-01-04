const prettier = require('prettier')

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
        const results = content.match(/__[A-Z0-9]+__/g) || []
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
    _getOutput() {
        const ugly = (Object.values(this._placeholders))
            .reduce((str, { inlineName, parts }) =>
                str.replace(inlineName, parts.map(p => p.str).join('\n')), this._template)
        return parser(ugly, this._options)
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

    push(str) {
        this.parts.push(
            new PlaceholderFragment({ parent: this, str })
        )
    }
    unshift(str) {
        this.parts.unshift(
            new PlaceholderFragment({ parent: this, str })
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

function parser(content, { filepath, ext }) {
    if (!filepath && !ext) throw new Error('filepath or ext must be provided')
    ext = ext || filepath.split('.').pop()
    const map = {
        js: 'babel',
        html: 'html',
        svelte: 'html'
    }
    const options = {
        parser: map[ext],
        semi: false,
        singleQuote: true
    }
    return options.parser ? prettier.format(content, options) : content

}

function placeholderToName(placeholder) {
    return placeholder.replace(/(^__|__$)/g, '').toLowerCase()
}

function nameToPlaceholder(name) {
    return `__${name.toUpperCase()}__`
}

module.exports = { Template }