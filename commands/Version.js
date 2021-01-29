'use strict'

const Command = require('../lib/Command');

/**
 * Version
 * 版本
 * -------
 * @author Verdient。
 */
class Version extends Command
{
	/**
	 * run()
	 * 运行
	 * ----
	 * @author Verdient。
	 */
	async run(){
		let version = require('../package.json').version;
		console.log(version);
	}
}

module.exports = Version;