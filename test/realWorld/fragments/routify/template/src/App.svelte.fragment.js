module.exports.patch = ({ placeholders, configs }) => { 
    console.log(placeholders._placeholders)
    placeholders.constants.append('configs')

    placeholders.imports.push`
        import { Router } from "@roxi/routify";
        import { routes } from "../.routify/routes";
    `
    // placeholders.configs += `const config = ${stringify(configs.routify.runtime)}`

    placeholders.html.push`< Router { config } />`
}
