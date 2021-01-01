module.exports = (placeholders, helpers) => {
    placeholders.imports.push(`
        import { Router } from "@roxi/routify";
        import { routes } from "../.routify/routes";
    `)

    placeholders.constants.createAfter(`
    
        __CONFIGS__
    `)

    if(!placeholders.style){
        helpers.createContent(`
            <style>
              
            </style>
        `)
    }
}