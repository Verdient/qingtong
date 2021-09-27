'use strict'

const { spawn } = require('child_process');
const { Client } = require('ssh2');
const { normalize } = require('path');
const { existsSync, readdirSync, statSync, unlinkSync, readFileSync } = require('fs');
const Command = require('../lib/Command');
const Console = require('../lib/Console');

/**
 * 通过SSH发布
 * @author Verdient。
 */
class SshPublish extends Command
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
        this._connention = null;
    }

    /**
     * @inheritdoc
     * @return {Array|False}
     * @author Verdient。
     */
    configs()
    {
        return ['path', 'ssh'];
    }

    /**
     * 执行命令
     * @param {String} command 命令
     * @param {Array} args 参数
     * @return {Promise}
     * @author Verdient。
     */
    async execCommand(command, args)
    {
        return new Promise((resolve, revoke) => {
            let childProcess = spawn(command, args, {
                cwd: this.config.path
            });
            childProcess.on('error', error => {
                revoke(error);
            });
            childProcess.on('exit', () => {
                resolve(true);
            });
        });
    }

    /**
     * 连接到服务器
     * @return {Client}
     * @author Verident。
     */
    connect()
    {
        return new Promise((resolve, revoke) => {
            if(this._connention === null){
                this._connention = new Client;
                this._connention.on('ready', () => {
                    resolve(this._connention);
                }).on('error', (error) => {
                    revoke(error);
                }).connect({
                    host: this.config.ssh.host,
                    port: 22,
                    username: this.config.ssh.username,
                    privateKey: readFileSync(this.config.ssh.privateKey)
                });
            }else{
                resolve(this._connention);
            }
        });
    }

    /**
     * 获取临时路径
     * @return {String}
     * @author Verdient。
     */
    tmpPath()
    {
        return normalize(this.config.path + '/../compressed_dist.tar.gz');
    }

    /**
     * 获取目标
     * @return {String}
     * @author Verdient。
     */
    target()
    {
        return this.config.ssh.username + '@' + this.config.ssh.host + ':' + this.config.ssh.targetPath;
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
     * 压缩文件
     * @return {Promise}
     * @author Verdient。
     */
    async compresseFiles()
    {
        let tmpPath = this.tmpPath();
        if(existsSync(tmpPath)){
            if(!await Console.allow('存在压缩文件 ' + tmpPath + ' 继续将会导致该文件被删除，是否继续？')){
                return false;
            }
            unlinkSync(tmpPath);
        }
        this.print('正在压缩文件');
        await this.execCommand('tar', ['-czf', this.tmpPath(), './']);
        return true;
    }

    /**
     * 推送文件
     * @return {Promise}
     * @author Verdient。
     */
    async putFiles()
    {
        if(await this.compresseFiles()){
            let tmpPath = this.tmpPath();
            if(!existsSync(tmpPath)){
                this.error(tmpPath + ' 不存在');
                return false;
            }
            this.print('正在上传文件');
            await this.execCommand('scp', ['-i', this.config.ssh.privateKey, this.tmpPath(), this.target()]);
            unlinkSync(tmpPath);
            if(await this.uncompressFiles()){
                return true;
            }
        }
        return false;
    }

    /**
     * 解压文件
     * @return {Promise}
     * @author Verdient。
     */
    async uncompressFiles()
    {
        let connection = await this.connect()
        return new Promise((resolve, revoke) => {
            this.print('正在解压文件');
            let compressedFilePath = this.config.ssh.targetPath + '/compressed_dist.tar.gz';
            let commands = [
                'tar -xzf ' + compressedFilePath + ' -C ' + this.config.ssh.targetPath,
                'rm -f ' + compressedFilePath
            ];
            connection.exec(commands.join(';'), (error, stream) => {
                if(error){
                    revoke(error);
                };
                stream.on('close', () => {
                    resolve(true);
                    connection.end();
                }).on('data', (data) => {
                    console.log(data.toString());
                }).stderr.on('data', (data) => {
                    console.error(data.toString());
                    resolve(false);
                });
            })
        });
    }

    /**
     * @inneritdoc
     * @author Verdient。
     */
    async run()
    {
        let target = this.target();
        let question = '是否将 ' + this.config.path.brightRed + ' 中的文件发布到 ' + target.brightRed;
        if(!await Console.allow(question)){
            return;
        }
        this.print('正在收集信息');
        await this.collection();
        if(this._fileCount === 0){
            return this.error('没有需要发布的文件');
        }
        question = '即将发布 ' + String(this._fileCount).brightRed + ' 个文件到 ' + target.brightRed;
        question += '，是否继续？';
        if(!await Console.allow(question)){
            return;
        }
        if(await this.putFiles()){
            this.success('发布成功');
        }
    }
}

module.exports = SshPublish