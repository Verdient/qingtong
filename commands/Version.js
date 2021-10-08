'use strict'

const Command = require('../lib/Command');

/**
 * 版本
 * @author Verdient。
 */
class Version extends Command {
    /**
     * @inheritdoc
     * @author Verdient。
     */
    async run() {
        let version = require('../package.json').version;
        console.log(version);
    }
}

module.exports = Version;