'use strict'

const { existsSync, readFileSync, writeFile } = require('fs');
const BaseObject = require('./BaseObject');
const Console = require('./Console');
const configDescriptions = require('./config');

/**
 * 可配置对象
 * @author Verdient。
 */
class Configurable extends BaseObject
{
    /**
     * @inheritdoc
     * @author Verdient。
     */
    init()
    {
        super.init();
        this._configFile = 'qt.json';
        this._configPath = process.cwd() + '/' + this._configFile;
        this._config = null;
    }

    /**
     * 设置所需的配置项
     * @return {Array}
     * @author Verdient。
     */
    configs()
    {
        return [];
    }

    /**
     * 获取配置
     * @return {Object}
     * @author Verdient。
     */
    get config()
    {
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
     * 获取是否已配置
     * @return {Boolean}
     * @author Verdient。
     */
    get isConfiged()
    {
        return existsSync(this._configPath);
    }

    /**
     * 确保配置
     * @param {Command} command 命令
     * @return {Boolean}
     * @author Verdient。
     */
    async ensureConfig()
    {
        let configs = this.configs();
        if(Array.isArray(configs) && configs.length !== 0){
            for(let name of configs){
                await this.normalizeConfig(name, configDescriptions[name]);
            }
            await this.saveConfig();
        }
        return true;
    }

    /**
     * 保存配置文件
     * @return {Promise}
     * @author Verdient。
     */
    saveConfig()
    {
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
     * 格式化配置
     * @param {String} name 名称
     * @param {Object} description 描述
     * @author Verdient。
     */
    async normalizeConfig(name, description, previous)
    {
        let config = this.config;
        if(Array.isArray(previous)){
            for(let i of previous){
                config = config[i];
            }
        }else{
            previous = [];
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
                config[name] = null;
                let defaultValue = description.default;
                if(typeof defaultValue == 'function'){
                    defaultValue = await defaultValue();
                }
                if(description.required){
                    let value = await Console.question(description.description, name, defaultValue);
                    switch(description.type){
                        case 'string':
                            config[name] = String(value);
                            break;
                        case 'boolean':
                            if(value === 'true'){
                                config[name] = true;
                            }else if(value === 'false'){
                                config[name] = false;
                            }else{
                                config[name] = Boolean(value);
                            }
                            break;
                        case 'number':
                            config[name] = Number(value);
                            break;
                        default:
                            config[name] = value;
                            break;
                    }
                }else{
                    config[name] = defaultValue;
                }
            }
        }
    }
}

module.exports = Configurable;
