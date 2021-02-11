#!/usr/bin/env node

const { merge } = require('../canvasit');
const pkg = require('../package.json');
const { argv } = require('dashargs');

require('update-notifier')({ pkg, updateCheckInterval: 0 }).notify();

const { fragments, ...options } = argv();

merge(fragments, undefined, options);
