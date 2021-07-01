'use strict'

const slog = require('single-line-log');

/**
 * 基础对象
 * @author Verdient。
 */
class BaseObject
{
    /**
     * 构造函数
     * @author Verdient。
     */
    constructor()
    {
        this.init();
    }

    /**
     * 初始化
     * @author Verdient。
     */
    init(){

    }

    /**
     * 打印
     * @param {String} message 内容
     * @param {Boolean} singleLine 单行
     * @author Verdient。
     */
    print(message, singleLine)
    {
        if(!singleLine){
            console.log(message);
        }else{
            slog(message);
        }
    }

    /**
     * 成功信息
     * @param {String} message 内容
     * @param {Boolean} singleLine 单行
     * @author Verdient。
     */
    success(message, singleLine)
    {
        this.print(String(message).inverse.brightGreen, singleLine);
    }

    /**
     * 提示信息
     * @param {String} message 内容
     * @param {Boolean} singleLine 单行
     * @author Verdient。
     */
    info(message, singleLine)
    {
        this.print(String(message).brightBlue, singleLine);
    }

    /**
     * 错误信息
     * @param {String} message 内容
     * @param {Boolean} singleLine 单行
     * @author Verdient。
     */
    error(message, singleLine)
    {
        this.print(String(message).brightRed, singleLine);
    }
}

module.exports = BaseObject;