#!/usr/bin/env node

import program from 'caporal';
import updateNotifier from 'update-notifier';

import pkg from '../package.json';
import init from './commands/init';

program.STRING = value => (typeof value === 'string' ? value : null);

updateNotifier({ pkg }).notify();

program.version(pkg.version).description('A command line scaffolding tool and helper for Boldr.');

init.register(program);

program.parse(process.argv);
