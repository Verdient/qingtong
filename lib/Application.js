'use strict'

const colors = require('colors');
const BaseObject = require('./BaseObject');
const Router = require('./Router');

/**
 * 应用
 * @author Verdient。
 */
class Application extends BaseObject
{
    /**
     * @inheritdoc
     * @author Verdient。
     */
    init()
    {
        super.init();
        this._argv = process.argv.splice(2);
        this._router = null;
    }

    /**
     * 获取路由对象
     * @return {Router}
     * @author Verdient。
     */
    get router()
    {
        if(this._router === null){
            this._router = new Router();
        }
        return this._router;
    }

    /**
     * 运行
     * @author Verdient。
     */
    async run()
    {
        return this.execute(this.requestCommand());
    }

    /**
     * 执行
     * @param {String} command 命令
     * @author Verdient。
     */
    async execute(command)
    {
        if(this.router.hasCommand(command)){
            try{
                await this.router.dispatch(command, this.params());
            }catch(e){
                console.error(colors.brightRed(e));
            }
        }else{
            this.printCommands(this.router.commands);
        }
    }

    /**
     * 获取请求的命令
     * @return {String|Undefined}
     * @author Verdient。
     */
    requestCommand()
    {
        return this._argv[0];
    }

    /**
     * 参数
     * @return {Array}
     * @author Verdient。
     */
    params()
    {
        return this._argv.splice(1);
    }

    /**
     * 打印命令
     * @param {Array} commands 命令集合
     * @author Verdient。
     */
    printCommands(commands)
    {
        let commandsString = '';
        commands.forEach(value => {
            commandsString += '    ' + colors.brightGreen(value) + '\n'
        });
        console.info(colors.brightCyan('使用方法: qt <命令>') +
            '\n\n' +
            '<命令> 为下列中的任一项：\n' + commandsString.substr(0, commandsString.length - 6)
        );
    }
}

module.exports = Application;