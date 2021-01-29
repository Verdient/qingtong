'use strict'

const Configurable = require('./Configurable');

/**
 * Command
 * 命令
 * -------
 * @author Verdient。
 */
class Command extends Configurable
{
	/**
	 * init()
	 * 初始化
	 * ------
	 * @author Verdient。
	 */
	init(){
		super.init();
		this._params = [];
	}

	/**
	 * params(Array value)
	 * 设置参数
	 * -------------------
	 * @param {Array} value 内容
	 * @author Verdient。
	 */
	set params(value){
		if(Array.isArray(value)){
			this._params = value;
		}
	}

	/**
	 * params()
	 * 获取参数
	 * --------
	 * @return {Array}
	 * @author Verdient。
	 */
	get params(){
		return this._params;
	}

	/**
	 * question(String name, String tip, String defaultAnswer)
	 * 询问
	 * -------------------------------------------------------
	 * @param {String} name 问题
	 * @param {String} tip 提示
	 * @param {String} defaultAnswer 默认答案
	 * -------------------------------------
	 * @return {Promise}
	 * @author Verdient。
	 */
	async question(name, tip, defaultAnswer){
		return new Promise((resolve) => {
			let question = name;
			if(tip){
				question += '(' + tip.brightYellow + ')';
			}
			if(typeof defaultAnswer !== 'undefined'){
				question += ' [' + String(defaultAnswer).brightGreen + ']';
			}
			question += '：';
			this.getReadline().question(question, (answer) => {
				if(answer === ''){
					if(typeof defaultAnswer !== 'undefined'){
						answer = defaultAnswer;
					}else{
						return resolve(this.question(name, tip, defaultAnswer));
					}
				}
				if(!isNaN(answer)){
					answer = Number(answer);
				}
				resolve(answer);
			});
		});
	}

	/**
	 * allow(String name, String tip, Boolean allow)
	 * 是否允许执行
	 * -----------------------------------------------
	 * @param {String} name 问题
	 * @param {String} tip 提示
	 * @param {String} allow 默认允许
	 * -----------------------------
	 * @return {Promise}
	 * @author Verdient。
	 */
	async allow(name, tip, allow){
		let defaultAnswer = allow === true ? 'y'.brightGreen : 'n'.brightRed;
		let answer = await this.question(name, tip, defaultAnswer);
		if(answer === 'y' || answer === 'yes'){
			return true;
		}
		return false;
	}

	/**
	 * run()
	 * 运行
	 * -----
	 * @author Verdient。
	 */
	async run(){

	}

	/**
	 * execute()
	 * 执行
	 * ---------
	 * @author Verdient。
	 */
	async execute(){
		await this.run();
		this.closeReadline();
	}

	/**
	 * configs()
	 * 获取配置项
	 * ---------
	 * @return {Array|False}
	 * @author Verdient。
	 */
	static configs(){
		return false;
	}
}

module.exports = Command;