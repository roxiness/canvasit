#!/usr/bin/env node

const { configent } = require('configent');
const { merge } = require('../canvasit');
const pkg = require('../package.json');
const { argv } = require('dashargs');

const { fragments, ...options } = argv();

if (!fragments) return console.log('Please supply the fragments arg.');

merge(fragments.split(/[, ]/), undefined, options);

require('update-notifier')({ pkg }).notify();
