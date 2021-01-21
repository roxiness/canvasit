#!/usr/bin/env node

const { configent } = require('configent');
const { merge } = require('../canvasit');
const pkg = require('../package.json');
const { argv } = require('dashargs');

require('update-notifier')({ pkg, updateCheckInterval: 0 }).notify();

const { fragments, ...options } = argv();

if (!fragments) return console.log('Please supply the fragments arg.');

merge(fragments.split(/[, ]/), undefined, options);
