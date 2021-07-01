'use strict'

const OSS = require('ali-oss');
const Command = require('./Command');

/**
 * OSS命令
 * @author Verdient。
 */
class OssCommand extends Command
{
    /**
     * @inheritdoc
     * @author Verdient。
     */
    init()
    {
        super.init();
        this._oss = null;
    }

    /**
     * @inheritdoc
     * @return {Array|False}
     * @author Verdient。
     */
    static configs()
    {
        return ['oss'];
    }

    /**
     * 获取OSS对象
     * @return {OSS}
     * @author Verdient。
     */
    get oss()
    {
        if(this._oss === null){
            this._oss = new OSS(this.config.oss)
        }
        return this._oss;
    }

    /**
     * 获取文件
     * @param {String} name 文件名称
     * @author Verdient。
     */
    async fetchFile(fileName)
    {
        try{
            return await this.oss.get(fileName);
        }catch(e){
            return null;
        }
    }
}

module.exports = OssCommand;