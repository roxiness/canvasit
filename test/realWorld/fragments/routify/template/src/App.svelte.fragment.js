module.exports.patch = ({ placeholders, configs, stringify, createAfter }) => {    
    createAfter('constants', 'configs')    

    placeholders.imports += `
        import { Router } from "@roxi/routify";
        import { routes } from "../.routify/routes";
    `
    // placeholders.configs += `const config = ${stringify(configs.routify.runtime)}`

    placeholders.html += `< Router { config } />`
}
