#!/usr/bin/env node

'use strict'

const { dirname } = require('path');
const Application = require('../lib/Application');

const COMMANDS_DIR = 'commands';
const BASE_PATH = dirname(__dirname);
const COMMANDS_PATH = BASE_PATH + '/' + COMMANDS_DIR;
const CONFIG_FILE = 'qt.json';
const CONFIG_PATH = process.cwd() + '/' + CONFIG_FILE;

const application = new Application(COMMANDS_PATH, CONFIG_PATH);

application.run().then(exitCode => {
    process.exit(exitCode);
}).catch(console.error);