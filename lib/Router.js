'use strict'

const { readdirSync, writeFile } = require('fs');
const { dirname } = require('path');
const Configurable = require('./Configurable');
const config = require('./config');

/**
 * Router
 * 路由
 * ------
 * @author Verdient。
 */
class Router extends Configurable
{
	/**
	 * init()
	 * 初始化
	 * ------
	 * @author Verdient。
	 */
	init(){
		super.init();
		let commandsPath = dirname(__dirname) + '/' + 'commands';
		this._commands = [];
		this._commandsMap = {};
		let commands = readdirSync(commandsPath);
		let commandName;
		commands.forEach(command => {
			commandName = this.normalizeCommandName(command);
			this._commands.push(commandName);
			this._commandsMap[commandName] = commandsPath + '/' + command;
		});
	}

	/**
	 * normalizeCommandName(String name)
	 * 格式化命令名
	 * ---------------------------------
	 * @param {String} name 名称
	 * ------------------------
	 * @return {String}
	 * @author Verdient。
	 */
	normalizeCommandName(name){
		name = String(name).replace('.js', '');
		name = name.split('');
		name.forEach((element, index) => {
			if(/^[A-Z]+$/.test(element)){
				name[index] = (index > 0 ? '-' : '') + element.toLowerCase();
			}
		});
		return name.join('');
	}

	/**
	 * commands()
	 * 获取命令集合
	 * ----------
	 * @author Verdient。
	 */
	get commands(){
		return this._commands;
	}

	/**
	 * hasCommand(String command)
	 * 是否存在命令
	 * --------------------------
	 * @param {String} command 命令
	 * ---------------------------
	 * @return {Boolean}
	 * @author Verdient。
	 */
	hasCommand(command){
		return this._commands.indexOf(command)!== -1;
	}

	/**
	 * getCommandClass(String command)
	 * 获取命令类
	 * -------------------------------
	 * @param {String} command 命令
	 * ---------------------------
	 * @return {Object|Null}
	 * @author Verdient。
	 */
	getCommandClass(command){
		if(this.hasCommand(command)){
			return require(this._commandsMap[command]);
		}else{
			return null;
		}
	}

	/**
	 * isConfiged()
	 * 是否已配置过
	 * ------------
	 * @return Boolean
	 * @author Verdient。
	 */
	isConfiged(){
		return existsSync(this._configPath);
	}

	/**
	 * ensureConfig(Command command)
	 * 确保配置
	 * -----------------------------
	 * @param {Command} command 命令
	 * ----------------------------
	 * @return {Boolean}
	 * @author Verdient。
	 */
	async ensureConfig(command){
		let configs = command.configs();
		if(Array.isArray(configs) && configs.length !== 0){
			for(let name of configs){
				await this.normalizeConfig(name, config[name]);
			}
			await this.saveConfig();
		}
		return true;
	}

	/**
	 * saveConfig()
	 * 保存配置文件
	 * ------------
	 * @return {Promise}
	 * @author Verdient。
	 */
	saveConfig(){
		return new Promise((resolve, revoke) => {
			writeFile(this._configPath, JSON.stringify(this.config, null, 2), (error) => {
				this._config = null;
				if(error){
					this.error('配置文件写入失败，请检查相关权限');
					revoke(error);
				}else{
					resolve(0);
				}
			});
		});
	}

	/**
	 * normalizeConfig(String name, Object description)
	 * 格式化配置
	 * ------------------------------------------------
	 * @param {String} name 名称
	 * @param {Object} description 描述
	 * --------------------------------
	 * @author Verdient。
	 */
	async normalizeConfig(name, description, previous){
		if(!previous){
			previous = [];
		}
		let config = this.config;
		for(let i of previous){
			config = config[i];
		}
		if(typeof config[name] === 'undefined'){
			config[name] = description.type === 'object' ? {} : null;
		}
		if(description.type === 'object'){
			previous.push(name);
			for(let subName in description.children){
				await this.normalizeConfig(subName, description.children[subName], previous);
			}
		}else{
			let type = typeof config[name];
			if(type !== description.type){
				let defaultValue = description.default;
				if(typeof defaultValue == 'function'){
					defaultValue = await defaultValue();
				}
				if(description.required){
					config[name] = await this.question(description.description, name, defaultValue);
				}else{
					config[name] = defaultValue;
				}
			}
		}
	}

	/**
	 * run(String command, Array params)
	 * 运行
	 * ---------------------------------
	 * @param {String} command 命令
	 * @param {Array} params
	 * ----------------------------
	 * @return {Mixed}
	 * @author Verdient。
	 */
	async run(command, params){
		let commandClass = this.getCommandClass(command);
		if(commandClass){
			await this.ensureConfig(commandClass);
			let instance = new commandClass();
			instance.params = params;
			return await instance.execute(params);
		}
		return false;
	}
}

module.exports = Router;