'use strict'

const { spawn, spawnSync } = require('child_process');
const { exists }  = require('fs');
const { platform, type, homedir } = require('os');
const Command = require('../lib/Command');
const CHECKER_OS = 'CHECKER_OS';
const CHECKER_NO_BIN = 'CHECKER_NO_BIN';
const CHECKER_NO_FILE = 'CHECKER_NO_FILE';

/**
 * Install
 * 安装
 * -------
 * @author Verdient。
 */
class Install extends Command
{
	/**
	 * init()
	 * 初始化
	 * ------
	 * @author Verdient。
	 */
	init(){
		super.init();
		this.checkerMap = {
			CHECKER_OS: this.checkOS,
			CHECKER_NO_BIN: this.checkNoBin,
			CHECKER_NO_FILE: this.checkNoFile
		}
		this._softwares = {
			'homebrew': {
				description: 'MacOS/Linux软件包管理器',
				checkers: [{
					checker: CHECKER_OS,
					args: [['MacOS']]
				}, {
					checker: CHECKER_NO_BIN,
					args: ['brew']
				}],
				installScript: [
					['rm', '-f', '.installHomeBrew'],
					['wget', 'https://raw.githubusercontent.com/Homebrew/install/master/install', '-O', '.installHomeBrew'],
					['/usr/bin/ruby', '.installHomeBrew'],
					['rm', '-f', '.installHomeBrew']
				]
			},
			'oh-my-zsh': {
				description: '命令行美化工具',
				checkers: [{
					checker: CHECKER_OS,
					args: [['MacOS']]
				}, {
					checker: CHECKER_NO_FILE,
					args: ['~/.oh-my-zsh/oh-my-zsh.sh']
				}],
				installScript: [
					['rm', '-f', '.installOhMyZsh'],
					['wget', 'https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh',  '-O', '.installOhMyZsh'],
					['sh', '.installOhMyZsh'],
					['rm', '-f', '.installOhMyZsh']
				]
			}
		};
	}

	/**
	 * OS()
	 * 获取操作系统
	 * ----------
	 * @return {String}
	 * @author Verdient。
	 */
	get OS(){
		let osPlatform = platform();
		let osType = type();
		if(osPlatform === 'darwin' && osType === 'Darwin'){
			return 'MacOS';
		}
		return false;
	}

	/**
	 * softwares()
	 * 获取软件集合
	 * -----------
	 * @return {Object}
	 * @author Verdient。
	 */
	get softwares(){
		return this._softwares;
	}

	/**
	 * isInstalled(String command)
	 * 是否已安装
	 * ---------------------------
	 * @param {String} command 命令
	 * ---------------------------
	 * @author Verdient。
	 */
	isInstalled(command){
		let result = spawnSync('which', [command]);
		let output = result.stdout.toString().replace('\n', '');
		if(output === ''){
			output = result.stderr.toString().replace('\n', '');
		}
		if(output.indexOf(command) !== -1){
			return output;
		}
		return false;
	}

	/**
	 * run()
	 * 运行
	 * ----
	 * @author Verdient。
	 */
	async run(){
		let software = this.parseName(this.params[0]);
		if(software){
			if(await this.checkInstall(software)){
				this.info('开始安装 ' + software.name);
				if(await this.install(software)){
					this.success(software.name + ' 安装成功');
				}else{
					this.error(software.name + ' 安装失败');
				}
			}
		}else{
			this.printHelp();
		}
	}

	/**
	 * checkOS(Object software)
	 * 检查操作系统
	 * ------------------------
	 * @param {Object} software 安装信息
	 * --------------------------------
	 * @author Verdient。
	 */
	async checkOS(software, oslist){
		if(!oslist.includes(this.OS)){
			this.error(software.name + ' 只能在以下系统上安装：' + oslist.join(', '));
			return false;
		}
		return true;
	}

	/**
	 * checkInstall(Object software)
	 * 检查安装信息
	 * --------------------------------
	 * @param {Object} software 安装信息
	 * -----------------------------------
	 * @author Verdient。
	 */
	async checkInstall(software){
		for(let checker of software.checkers){
			let checkerFunction;
			if(typeof checker.checker === 'string'){
				checkerFunction = this.checkerMap[checker.checker];
			}else if(typeof checker.checker === 'function'){
				checkerFunction = checker.checker;
			}
			let args = JSON.parse(JSON.stringify(checker.args));
			args.unshift(software);
			if(!await checkerFunction.apply(this, args)){
				return false;
			}
		}
		return true;
	}

	/**
	 * checkNoBin(Object software, String bin)
	 * 检查无二进制文件
	 * --------------------------------------
	 * @param {Object} software 安装信息
	 * @param {String} bin 二进制命令
	 * --------------------------------
	 * @author Verdient。
	 */
	async checkNoBin(software, bin){
		let path = this.isInstalled(bin);
		if(!path){
			return true;
		}else{
			this.error(software.name + ' 已存在于 ' + path + ', 请勿重复安装');
		}
		return false;
	}

	/**
	 * checkNoFile(Object software, String path)
	 * 检查无文件
	 * -----------------------------------------
	 * @param {Object} software 安装信息
	 * @param {String} path 文件路径
	 * --------------------------------
	 * @author Verdient。
	 */
	async checkNoFile(software, path){
		return new Promise((resolve => {
			if(path.substr(0, 1) === '~'){
				path = homedir() + path.substr(1);
			}
			exists(path, (isExist) => {
				if(isExist){
					this.error(software.name + ' 已安装 , 请勿重复安装');
					resolve(false);
				}else{
					resolve(true);
				}
			});
		}));
	}

	/**
	 * install(Object software)
	 * 安装
	 * ------------------------
	 * @param {Object} software 软件信息
	 * --------------------------------
	 * @author Verdient。
	 */
	async install(software){
		return new Promise(async (resolve, revoke) => {
			if(Array.isArray(software.installScript)){
				for(let command of software.installScript){
					let args = command.splice(1);
					if(!await this.execCommand(command[0], args)){
						return false;
					}
				}
			}
		});
	}

	/**
	 * execCommand(String command, Array args)
	 * 执行命令
	 * ---------------------------------------
	 * @param {String} command 命令
	 * @param {Array} args 参数
	 * ---------------------------
	 * @return {Promise}
	 * @author Verdient。
	 */
	async execCommand(command, args){
		return new Promise((resolve, revoke) => {
			let childProcess = spawn(command, args, {
				stdio: ['inherit', 'inherit', 'inherit']
			});
			childProcess.on('error', error => {
				revoke(error);
			});
			childProcess.on('exit', () => {
				resolve(true);
			});
		});
	}

	/**
	 * parseName(String name)
	 * 解析名称
	 * ----------------------
	 * @param {String} name 名称
	 * ------------------------
	 * @return {Object/False}
	 * @author Verdient。
	 */
	parseName(name){
		let names = Object.keys(this.softwares);
		if(typeof name === 'string'){
			name = name.split('@');
			if(names.includes(name[0])){
				let result = {
					name: name[0],
					version: typeof name[1] === 'string' ? name[1] : null
				};
				for(let i in this.softwares[name[0]]){
					result[i] = this.softwares[name[0]][i];
				}
				return result;
			}
		}
		return false;
	}

	/**
	 * printHelp()
	 * 打印帮助
	 * -----------
	 * @author Verdient。
	 */
	printHelp(){
		this.error('仅支持安装以下软件：');
		let message = '';
		let interval = 20;
		for(let i in this.softwares){
			let realnIterval = interval - i.length;
			if(realnIterval < 0){
				realnIterval = 0;
			}
			message += i + ' '.repeat(realnIterval) + this.softwares[i].description + '\n';
		}
		this.info(message);
	}
}

module.exports = Install;