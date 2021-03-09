/**
 * @module canvasit
 */

/**
 * @typedef {object} Fragment
 * @prop {object} blueprint
 * @prop {object} template
 * @prop {string} path
 * @prop {string} name
 */

/**
 * @typedef {object} Blueprint
 * @prop {'base'|'feature'|'template'|string} type
 * @prop {Object.<string, Import>=} imports
 * @prop {ConfigsCallBack=} configs
 * @prop {BlueprintHooks} hooks
 */

/**
 * @typedef {object} BlueprintHooks
 * @prop {BlueprintHookCallback} beforeConfig
 * @prop {BlueprintHookCallback} afterConfig
 * @prop {BlueprintHookCallback} beforeCopy
 * @prop {BlueprintHookCallback} afterCopy
 * @prop {BlueprintHookCallback} beforePatch
 * @prop {BlueprintHookCallback} afterPatch
 */

/**
 * @callback BlueprintHookCallback
 * @param {import('./lib/blueprint/hookHelpers')['HookHelpers']['prototype']} BlueprintHook
 */

/**
 * @typedef {object} Import
 * @prop {string[]} entry
 */

/**
 * @callback ConfigsCallBack
 * @param {import('./lib/blueprint/configHelpers')['blueprintHelpers']} helpers
 */
