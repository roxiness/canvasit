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
 * @prop {object=} hooks
 */

/**
 * @typedef {object} Import
 * @prop {string[]} entry
 */

/**
 * @callback ConfigsCallBack
 * @param {import('./lib/blueprint/configHelpers')['blueprintHelpers']} helpers
 */

 /**
  * @type {object} hooks
  * @prop 
  */

  /** @typedef {import('./lib/blueprint/hookHelpers').foo} createHookHelpers */

  /** @typedef {createHookHelpers.helpers} HookHelpers */