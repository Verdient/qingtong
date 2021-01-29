'use strict'

const { existsSync, readdirSync, statSync } = require('fs');
const OssCommand = require('../lib/OssCommand');
const ProcessBar = require('../lib/ProgressBar');
const Remove = require('./remove');

/**
 * Publish
 * 发布
 * -------
 * @author Verdient。
 */
class Publish extends OssCommand
{
	/**
	 * init()
	 * 初始化
	 * ------
	 * @author Verdient。
	 */
	init(){
		super.init();
		this._files = {};
		this._fileCount = 0;
		this._remove = null;
	}

	/**
	 * autoRemove()
	 * 获取是否自动清除
	 * -------------
	 * @return {Boolean}
	 * @author Verdient。
	 */
	get autoRemove(){
		return this.config.autoRemove;
	}

	/**
	 * remove()
	 * 获取移除组件
	 * ----------
	 * @return {Remove}
	 * @author Verdient。
	 */
	get remove(){
		if(this.autoRemove && this._remove === null){
			this._remove = new Remove();
		}
		return this._remove;
	}

	/**
	 * configs()
	 * 获取配置项
	 * ---------
	 * @return {Array|False}
	 * @author Verdient。
	 */
	static configs(){
		return ['oss', 'path', 'duration', 'autoRemove'];
	}

	/**
	 * collection()
	 * 收集信息
	 * ------------
	 * @author Verdient。
	 */
	async collection(path){
		await this.collectionPublishFiles(path);
		if(this.autoRemove){
			await this.collectionRemoveFiles();
		}
	}

	/**
	 * collectionPublishFiles()
	 * 收集要发布的文件
	 * ------------------------
	 * @author Verdient。
	 */
	async collectionPublishFiles(path){
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
						this.collectionPublishFiles(realPath);
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
	 * collectionRemoveFiles()
	 * 收集要移除的文件
	 * -----------------------
	 * @author Verdient。
	 */
	async collectionRemoveFiles(){
		if(this.autoRemove){
			return this.remove.collection();
		}
	}

	/**
	 * putConfig()
	 * 推送配置
	 * -----------
	 * @return {Promise}
	 * @author Verdient。
	 */
	async putConfig(){
		return this.oss.putBucketWebsite(this.config.oss.bucket, {
			index: this.config.oss.indexPage,
			error: this.config.oss.errorPage
		});
	}

	/**
	 * removeFiles()
	 * 移除上个版本
	 * ----------------
	 * @return {Promise}
	 * @author Verdient。
	 */
	async removeFiles(){
		if(this.config.oss.indexPage !== this.config.oss.errorPage){
			await this.oss.deleteMulti([this.config.oss.indexPage, this.config.oss.errorPage]);
		}else{
			await this.oss.delete(this.config.oss.indexPage);
		}
		if(this.autoRemove && this.hasFilesToRemove){
			await this.remove.removeFiles();
		}
	}

	/**
	 * putFiles()
	 * 推送文件
	 * ----------
	 * @return {Promise}
	 * @author Verdient。
	 */
	async putFiles(){
		let processBar = new ProcessBar('正在发布新版本');
		let count = 0;
		for(let path in this._files){
			await this.oss.put(path, this._files[path]);
			count++;
			processBar.render(count, this._fileCount, true);
		}
	}

	/**
	 * hasFilesToRemove()
	 * 是否有要移除的文件
	 * ------------------
	 * @return {Boolean}
	 * @author Verdient。
	 */
	get hasFilesToRemove(){
		return !this.remove.isEmpty;
	}

	/**
	 * publish()
	 * 发布
	 * ---------
	 * @author Verdient。
	 */
	async publish(){
		let question = '是否将 ' + this.config.path.brightRed + ' 中的文件发布到 ' + String(this.config.oss.bucket).brightRed;
		if(!await this.allow(question)){
			return;
		}
		this.print('正在收集信息');
		await this.collection();
		if(this._fileCount === 0){
			return this.error('没有需要发布的文件');
		}
		if(this.autoRemove && this.hasFilesToRemove && this.remove.skipPrevious){
			let previousPublishDate = await this.remove.previousPublishDate();
			this.info('上个版本的发布时间为：' + previousPublishDate + '（精确到小时）');
			this.info('自动移除将跳过上个版本');
		}
		question = '即将发布 ' + String(this._fileCount).brightRed + ' 个文件到 ' + String(this.config.oss.bucket).brightRed;
		let expirationDate = await this.remove.expirationDate();
		let durationDays =  await this.remove.durationDays();
		if(this.autoRemove && this.hasFilesToRemove){
			question += ' 并移除 ' +
			expirationDate.brightRed +
			' (约' + durationDays + '天前) 的 ' +
			String(this.remove.fileCount).brightRed +
			' 个文件'
		}
		question += '，是否继续？';
		if(!await this.allow(question)){
			return;
		}
		this.info('上传配置中');
		await this.putConfig();
		await this.removeFiles();
		await this.putFiles();
		this.success('发布成功');
	}

	/**
	 * run()
	 * 运行
	 * ----
	 * @author Verdient。
	 */
	async run(){
		if(this.params.length === 0){
			return await this.publish();
		}else{
			let command = this.params[0];
			switch(command){
				case 'lastPublishAt':
					let previousPublishAt = await this.remove.previousPublishAt();
					this.print(new Date(previousPublishAt).toLocaleString());
					return true;
				default:
					this.error('未知的命令: ' + command);
					return false;
			}
		}
	}
}

module.exports = Publish