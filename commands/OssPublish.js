'use strict'

const { existsSync, readdirSync, statSync } = require('fs');
const OssCommand = require('../lib/OssCommand');
const ProcessBar = require('../lib/ProgressBar');
const Console = require('../lib/Console');

/**
 * 通过OSS发布
 * @author Verdient。
 */
class OssPublish extends OssCommand
{
    /**
     * @inheritdoc
     * @author Verdient。
     */
    init()
    {
        super.init();
        this._files = {};
        this._fileCount = 0;
    }

    /**
     * @inheritdoc
     * @author Verdient。
     */
    configs()
    {
        return ['path', 'oss'];
    }

    /**
     * 收集信息
     * @author Verdient。
     */
    async collection(path)
    {
        let base = this.config.path;
        if(!path){
            path = base;
        }
        if(existsSync(path)){
            let files = readdirSync(path);
            if(Array.isArray(files)){
                let fileStat;
                let realPath;
                let relativePath;
                for(let file of files){
                    realPath = path + '/' + file;
                    fileStat = statSync(realPath);
                    if(fileStat.isDirectory()){
                        this.collection(realPath);
                    }else{
                        relativePath = realPath.replace(base, '');
                        this._files[relativePath] = realPath;
                        this._fileCount++;
                    }
                }
            }
        }
    }

    /**
     * 推送配置
     * @return {Promise}
     * @author Verdient。
     */
    async putConfig()
    {
        return this.oss.putBucketWebsite(this.config.oss.bucket, {
            index: this.config.oss.indexPage,
            error: this.config.oss.errorPage
        });
    }

    /**
     * 推送文件
     * @return {Promise}
     * @author Verdient。
     */
    async putFiles()
    {
        let processBar = new ProcessBar('正在发布新版本');
        let count = 0;
        for(let path in this._files){
            await this.oss.put(path, this._files[path]);
            count++;
            processBar.render(count, this._fileCount, true);
        }
    }

    /**
     * 运行
     * @author Verdient。
     */
    async run()
    {
        let question = '是否将 ' + this.config.path.brightRed + ' 中的文件发布到 ' + String(this.config.oss.bucket).brightRed;
        if(!await Console.allow(question)){
            return;
        }
        this.print('正在收集信息');
        await this.collection();
        if(this._fileCount === 0){
            return this.error('没有需要发布的文件');
        }
        question = '即将发布 ' + String(this._fileCount).brightRed + ' 个文件到 ' + String(this.config.oss.bucket).brightRed + '，是否继续？';
        if(!await Console.allow(question)){
            return;
        }
        this.info('上传配置中');
        await this.putConfig();
        await this.putFiles();
        this.success('发布成功');
    }
}

module.exports = OssPublish