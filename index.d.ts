declare module "lib/blueprint/$require" {
    export type DependenciesMap = {
        [x: string]: string[];
    };
    export type ScriptMode = ('commonjs' | 'esm' | undefined);
    /**
     * @param  {...string} importPath
     */
    export function $require(...importPath: string[]): {
        (_eval: any): string;
        toString(): string;
        is$require: boolean;
    };
    /**
     *
     * @param {{dependencies: {}, declarations: {}}} param0
     * @param {'commonjs'|'esm'} mode
     */
    export function composeImports({ dependencies, declarations }: {
        dependencies: {};
        declarations: {};
    }, mode?: 'commonjs' | 'esm'): {
        imports: any[];
        declarations: any[];
    };
    /**
     * replaces $require placeholders with actual calls and
     * returns the body and a list of aliased dependencies found
     * @param {string} body
     * @returns {{body: string, dependencies: string[]}}
     */
    export function parse$requires(body: string): {
        body: string;
        dependencies: string[];
    };
    /**
     *
     * @param {string} content
     * @param {DependenciesMap} dependenciesMap
     * @param {ScriptMode} mode
     */
    export function parseImports(content: string, dependenciesMap: DependenciesMap, mode: ScriptMode): {
        body: string;
        imports: any[];
        declarations: any[];
    };
    /**
     *
     * @param {Object.<string, string[]>} dependencyMap
     * @param {string[]} presentDependencies
     */
    export function mapDependenciesToVariables(dependencyMap: {
        [x: string]: string[];
    }, presentDependencies: string[]): {
        dependencies: {};
        declarations: {};
    };
}
declare module "lib/Template" {
    export class Template {
        constructor(template?: string, options?: {});
        _options: {};
        _template: string;
        _placeholders: {
            [x: string]: Placeholder;
        };
        /**
         * gets placeholders from a template
         * @param {string} content
         * @returns {Object<string, Placeholder>}
         */
        _getPlaceholdersFromTemplate(content: string): {
            [x: string]: Placeholder;
        };
        /**
         * creates a new placeholder
         * @param {string} name
         * @param {Placeholder} sibling
         * @param {'before'|'after'|'first'|'last'} order
         */
        _create(name: string, sibling: Placeholder, order: 'before' | 'after' | 'first' | 'last'): boolean;
        /**
         * returns a populated and sanitized template
         */
        _getOutput(): Promise<string>;
        prepend(name: any): void;
        append(name: any): void;
    }
    class Placeholder {
        constructor(parent: any, name: any);
        parent: any;
        name: any;
        inlineName: string;
        parts: any[];
        push(...parts: any[]): void;
        unshift(...parts: any[]): void;
        prepend(name: any): void;
        append(name: any): void;
    }
    export {};
}
declare module "lib/Template.spec" {
    export {};
}
declare module "lib/utils/index" {
    /**
     * @template {{}} T
     * @template {{}} T2
     * @param {T} target
     * @param  {...T2} sources
     * @return {T&Partial<T2>} //jsdoc unaware of mutation - incorrectly wants partial T2
     */
    export function deepAssign<T extends {}, T2 extends {}>(target: T, ...sources: T2[]): T & Partial<T2>;
    export function isObject(v: any): boolean;
    export function isObjectOrArray(v: any): boolean;
    /**
     * Like JSON.stringify, but unquotes all values
     * @param {*} obj
     */
    export function stringify(obj: any, level?: number): any;
    export function emptyDirPartial(output: any, ignore: any): void;
    export function verifyPathExists(path: any): void;
}
declare module "lib/filePatcher" {
    /**
     *
     * @param {string} filepath
     * @param {string[]} folders
     * @param {string} output
     * @param {Object.<string, any>} configs
     * @param {*} imports
     */
    export function patchFile(filepath: string, folders: string[], output: string, configs: {
        [x: string]: any;
    }, imports: any): Promise<boolean>;
}
declare module "lib/blueprint/$require.spec" {
    export {};
}
declare module "lib/blueprint/configHelpers" {
    export namespace blueprintHelpers {
        /**
         * returns a root config
         * @param {string} name
         */
        export function getConfig(name: string): {
            __symlink: string;
        };
        /**
         * returns a root config
         * @param {string} name
         */
        export function getConfig(name: string): {
            __symlink: string;
        };
        /**
         * returns a stringified root config
         * unlike JSON.stringify, values are not stringified
         * @param {string} name
         */
        export function getConfigString(name: string): string;
        /**
         * returns a stringified root config
         * unlike JSON.stringify, values are not stringified
         * @param {string} name
         */
        export function getConfigString(name: string): string;
        export { $require };
        export { stringify };
    }
    import { $require } from "lib/blueprint/$require";
    import { stringify } from "lib/utils";
}
declare module "lib/blueprint/hookHelpers" {
    export type HookHelperContext = {
        output: string;
        configs: {
            [x: string]: any;
        };
        imports: {
            [x: string]: Import;
        };
        fragments: any;
        blueprint: any;
    };
    export type Import = string[];
    /**
     * @typedef {object} HookHelperContext
     * @prop {string} output
     * @prop {Object.<string, any>} configs
     * @prop {Object.<string, Import>} imports
     * @prop {any} fragments
     * @prop {any} blueprint
     */
    /**
    * @typedef {string[]} Import
    */
    export class HookHelpers {
        /** @param {HookHelperContext} HookHelperContext */
        constructor(HookHelperContext: HookHelperContext);
        output: string;
        configs: {
            [x: string]: any;
        };
        imports: {
            [x: string]: Import;
        };
        fragments: any;
        blueprint: any;
        stringify: typeof stringify;
        /**
         * transforms a file
         * @param {string} filename
         * @param {function} transformFn
         */
        transform: (filename: string, transformFn: Function) => void;
        /**
         * creates a file
         * @param {string} filename
         * @param {string} content
         */
        writeTo: (filename: string, content: string) => void;
        /**
         *
         * @param {string} content
         * @param {("commonjs"|"esm"|undefined)} mode
         * @returns {{body: string, imports: string[], declarations: string[]}}
         */
        parseImports: (content: string, mode: ("commonjs" | "esm" | undefined)) => {
            body: string;
            imports: string[];
            declarations: string[];
        };
        removeFile: (filename: any) => void;
    }
    import { stringify } from "lib/utils";
}
type Fragment = {
    blueprint: object;
    template: object;
    path: string;
    name: string;
};
type Blueprint = {
    type: 'base' | 'feature' | 'template' | string;
    imports?: {
        [x: string]: Import;
    } | undefined;
    configs?: ConfigsCallBack | undefined;
    hooks: BlueprintHooks;
};
type BlueprintHooks = {
    beforeConfig: BlueprintHookCallback;
    afterConfig: BlueprintHookCallback;
    beforeCopy: BlueprintHookCallback;
    afterCopy: BlueprintHookCallback;
    beforePatch: BlueprintHookCallback;
    afterPatch: BlueprintHookCallback;
};
type BlueprintHookCallback = (BlueprintHook: typeof import("lib/blueprint/hookHelpers")['HookHelpers']['prototype']) => any;
type Import = {
    entry: string[];
};
type ConfigsCallBack = (helpers: typeof import("lib/blueprint/configHelpers")['blueprintHelpers']) => any;
declare module "lib/blueprint/fragmentMapper" {
    /**
     * Curried function: fragmentMapper(basepath)(path)
     *
     *
     * @param {string} basepath
     */
    export function fragmentMapper(basepath: string): (path: string) => Fragment[] | false;
}
declare module "lib/blueprint/populateConfig" {
    /**
     * walks through fragments to build a config
    //  * @param {{}[]} fragments
    //  * @param {Object.<string, {}>} configs
     */
    export function populateConfigs(fragments: any, configs: any): any;
}
declare module "lib/utils/fileWalker" {
    export function fileWalker(dirs: any, cb: any, ignore: any): Promise<void>;
}
declare module "default.config" {
    export const output: string;
    export const include: any[];
    export const basepath: any;
    export const watch: boolean;
    export const exec: any;
    export const ignore: any[];
    export const prettier: boolean;
    export const hooks: {};
}
declare module "canvasit" {
    /**
     *
     * @param {string[]|string} paths
     * @param {string} output
     * @param {any} options
     */
    export function merge(paths: string[] | string, output: string, options?: any): Promise<{
        configs: {};
        fragments: any;
    }>;
    /** @type {Blueprint} */
    export let Blueprint: Blueprint;
}
