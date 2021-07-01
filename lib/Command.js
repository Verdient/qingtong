'use strict'

const Configurable = require('./Configurable');

/**
 * 命令
 * @author Verdient。
 */
class Command extends Configurable
{
    /**
     * @inheritdoc
     * @author Verdient。
     */
    init()
    {
        super.init();
        this._params = [];
    }

    /**
     * 设置参数
     * @param {Array} value 内容
     * @author Verdient。
     */
    set params(value)
    {
        if(Array.isArray(value)){
            this._params = value;
        }
    }

    /**
     * 获取参数
     * @return {Array}
     * @author Verdient。
     */
    get params()
    {
        return this._params;
    }

    /**
     * 运行
     * @author Verdient。
     */
    async run()
    {

    }

    /**
     * 执行
     * @author Verdient。
     */
    async execute()
    {
        await this.ensureConfig();
        await this.run();
    }
}

module.exports = Command;