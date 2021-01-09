const { parse, config, strip, argv } = require('dashargs')
const { configent } = require('configent')
const { merge } = require('../canvasit')

const { fragments, ...options } = argv()


merge(fragments.split(/[, ]/), undefined, options)