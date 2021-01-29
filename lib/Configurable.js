'use strict'

const { existsSync, readFileSync } = require('fs');
const Origin = require('./Origin');

/**
 * Configurable
 * 可配置
 * ------------
 * @author Verdient。
 */
class Configurable extends Origin
{
	/**
	 * init()
	 * 初始化
	 * ------
	 * @author Verdient。
	 */
	init(){
		super.init();
		this._configFile = 'qt.json';
		this._configPath = process.cwd() + '/' + this._configFile;
		this._config = null;
	}

	/**
	 * config()
	 * 获取配置
	 * --------
	 * @return {Object}
	 * @author Verdient。
	 */
	get config(){
		if(this._config === null){
			try{
				this._config = JSON.parse(readFileSync(this._configPath, {
					encoding: 'utf-8'
				}));
			}catch(e){
				this._config = {};
			}
		}
		if(typeof this._config !== 'object'){
			this._config = {};
		}
		return this._config;
	}

	/**
	 * isConfiged()
	 * 获取是配置过
	 * ------------
	 * @return {Boolean}
	 * @author Verdient。
	 */
	get isConfiged(){
		return existsSync(this._configPath);
	}
}

module.exports = Configurable;
