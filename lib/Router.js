'use strict'

const { readdirSync } = require('fs');
const { dirname } = require('path');
const BaseObject = require('./BaseObject');

/**
 * 路由
 * @author Verdient。
 */
class Router extends BaseObject
{
    /**
     * @inheritdoc
     * @author Verdient。
     */
    init()
    {
        super.init();
        this._commands = [];
        this._commandsMap = {};
        this.collectCommands();
    }

    /**
     * 收集命令
     * @author Verdient。
     */
    collectCommands()
    {
        let commandsPath = dirname(__dirname) + '/' + 'commands';
        let commands = readdirSync(commandsPath);
        let commandName;
        commands.forEach(command => {
            commandName = this.normalizeCommandName(command);
            this._commands.push(commandName);
            this._commandsMap[commandName] = commandsPath + '/' + command;
        });
    }

    /**
     * 格式化命令名
     * @param {String} name 名称
     * @return {String}
     * @author Verdient。
     */
    normalizeCommandName(name)
    {
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
     * 获取命令集合
     * @author Verdient。
     */
    get commands()
    {
        return this._commands;
    }

    /**
     * 是否存在命令
     * @param {String} command 命令
     * @return {Boolean}
     * @author Verdient。
     */
    hasCommand(command)
    {
        return this._commands.indexOf(command)!== -1;
    }

    /**
     * 获取命令的类
     * @param {String} command 命令
     * @return {Object|Null}
     * @author Verdient。
     */
    getCommandClass(command)
    {
        if(this.hasCommand(command)){
            return require(this._commandsMap[command]);
        }else{
            return null;
        }
    }

    /**
     * 分配
     * @param {String} command 命令
     * @param {Array} params
     * @return {Mixed}
     * @author Verdient。
     */
    async dispatch(command, params)
    {
        let commandClass = this.getCommandClass(command);
        if(commandClass){
            let instance = new commandClass();
            instance.params = params;
            return await instance.execute(params);
        }
        return false;
    }
}

module.exports = Router;