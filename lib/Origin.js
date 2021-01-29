'use strict'

const { createInterface } = require('readline');

/**
 * Origin
 * 源对象
 * ------
 * @author Verdient。
 */
class Origin
{
	/**
	 * constructor()
	 * 构造函数
	 * -------------
	 * @author Verdient。
	 */
	constructor(){
		this._readline = null;
		this.init();
	}

	/**
	 * init()
	 * 初始化
	 * ------
	 * @author Verdient。
	 */
	init(){

	}

	/**
	 * getReadline()
	 * 获取逐行读取对象
	 * --------------
	 * @return {Object}
	 * @author Verdient。
	 */
	getReadline(){
		if(this._readline === null){
			this._readline = createInterface({
				input: process.stdin,
				output: process.stdout
			});
		}
		return this._readline;
	}

	/**
	 * closeReadline()
	 * 关闭逐行读取
	 * ---------------
	 * @author Verdient。
	 */
	closeReadline(){
		if(this._readline !== null){
			this._readline.close();
		}
	}

	/**
	 * print(String message, Boolean singleLine)
	 * 打印
	 * -----------------------------------------
	 * @param {String} message 内容
	 * @param {Boolean} singleLine 单行
	 * --------------------------------
	 * @author Verdient。
	 */
	print(message, singleLine){
		if(!singleLine){
			console.log(message);
		}else{
			slog(message);
		}
	}

	/**
	 * success(String message, Boolean singleLine)
	 * 成功信息
	 * -------------------------------------------
	 * @param {String} message 内容
	 * @param {Boolean} singleLine 单行
	 * --------------------------------
	 * @author Verdient。
	 */
	success(message, singleLine){
		this.print(String(message).inverse.brightGreen, singleLine);
	}

	/**
	 * info(String message, Boolean singleLine)
	 * 提示信息
	 * -------------------------------------------
	 * @param {String} message 内容
	 * @param {Boolean} singleLine 单行
	 * --------------------------------
	 * @author Verdient。
	 */
	info(message, singleLine){
		this.print(String(message).brightBlue, singleLine);
	}

	/**
	 * error(String message, Boolean singleLine)
	 * 错误信息
	 * -----------------------------------------
	 * @param {String} message 内容
	 * @param {Boolean} singleLine 单行
	 * --------------------------------
	 * @author Verdient。
	 */
	error(message, singleLine){
		this.print(String(message).brightRed, singleLine);
	}
}

module.exports = Origin;