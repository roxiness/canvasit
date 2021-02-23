module.exports.patch = ({ placeholders, configs, stringify }) => { 
    placeholders.constants.append('configs')

    placeholders.imports.push(`
        import { Router } from "@roxi/routify";
        import { routes } from "../.routify/routes";
    `)

    placeholders.configs.push(`const config = ${(stringify(configs.routify.runtime))}`)

    placeholders.html.push(`<Router { config } { routes } />`)
}
