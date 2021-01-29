'use strict'

const OssCommand = require('../lib/OssCommand');
const ProcessBar = require('../lib/ProgressBar');

/**
 * Remove
 * 移除以前的版本
 * ------------
 * @author Verdient。
 */
class Remove extends OssCommand
{
	/**
	 * init()
	 * 初始化
	 * ------
	 * @author Verdient。
	 */
	init(){
		super.init();
		this.batchSize = 100;
		this._timestamp = false;
		this._previousPublishAt = false;
		this._files = [];
	}

	/**s
	 * configs()
	 * 获取配置项
	 * ---------
	 * @return {Array|False}
	 * @author Verdient。
	 */
	static configs(){
		return ['oss', 'duration', 'skipPrevious'];
	}

	/**
	 * skipPrevious()
	 * 获取是否跳过上个版本
	 * -----------------
	 * @return {Boolean}
	 * @author Verdient。
	 */
	get skipPrevious(){
		return this.config.skipPrevious;
	}

	/**
	 * previousPublishAt()
	 * 上个版本发布时间
	 * -------------------
	 * @return {Integer}
	 * @author Verdient。
	 */
	async previousPublishAt(){
		if(this._previousPublishAt === false){
			this._previousPublishAt = 0;
			let file = await this.fetchFile(this.config.oss.indexPage);;
			if(!file && this.config.oss.errorPage !== this.config.oss.indexPage){
				file = await this.fetchFile(this.config.oss.errorPage);
			}
			if(file){
				let date = new Date(file.res.headers['last-modified']);
				let minutes = date.getMinutes();
				let seconds = date.getSeconds();
				if(minutes !== 0 || seconds !== 0){
					date.setMinutes(0);
					date.setSeconds(0);
					this._previousPublishAt = date.valueOf();
				}else{
					date.setMilliseconds(0);
					this._previousPublishAt = date.valueOf() - 3600000;
				}
			}
		}
		return this._previousPublishAt;
	}

	/**
	 * timestamp()
	 * 获取时间戳
	 * -----------
	 * @return {Integer}
	 * @author Verdient。
	 */
	async timestamp(){
		if(this._timestamp === false){
			this._timestamp = Date.now();
			if(this.skipPrevious && await this.hasProvious()){
				this._timestamp = await this.previousPublishAt();
			}
		}
		return this._timestamp;
	}

	/**
	 * expirationDate()
	 * 获取过期日期
	 * ----------------
	 * @return {String}
	 * @author Verdient。
	 */
	async expirationDate(){
		let timestamp = await this.timestamp() - this.duration;
		return new Date(timestamp).toLocaleString();
	}

	/**
	 * previousPublishDate()
	 * 上个版本发布的日期
	 * ---------------------
	 * @return {String}
	 * @author Verdient。
	 */
	async previousPublishDate(){
		if(await this.hasProvious()){
			let previousPublishAt = await this.previousPublishAt();
			return new Date(previousPublishAt).toLocaleString();
		}
		return null;
	}

	/**
	 * hasProvious()
	 * 是否有上个版本
	 * --------------
	 * @return {String}
	 * @author Verdient。
	 */
	async hasProvious(){
		let previousPublishAt = await this.previousPublishAt();
		return previousPublishAt !== 0;
	}

	/**
	 * duration()
	 * 获取有效期
	 * ----------
	 * @return {Integer}
	 * @author Verdient。
	 */
	get duration(){
		return this.config.duration * 1000;
	}

	/**
	 * durationDays()
	 * 获取有效天数
	 * --------------
	 * @return {Integer}
	 * @author Verdient。
	 */
	async durationDays(){
		let duration = this.duration;
		if(this.skipPrevious){
			duration += (Date.now() - await this.previousPublishAt());
		}
		return Math.floor(duration / 86400000);
	}

	/**
	 * collection()
	 * 收集信息
	 * ------------
	 * @auhtor Verdient。
	 */
	async collection(){
		let finished = false;
		let result;
		let marker;
		let timestamp = await this.timestamp();
		while(!finished){
			result = await this.oss.list(marker ? {
				marker: marker
			} : undefined);
			if(Array.isArray(result.objects)){
				let lastModified;
				result.objects.forEach(file => {
					lastModified = new Date(file.lastModified).valueOf();
					if(timestamp - lastModified > this.duration){
						this._files.push(file.name);
					}
				});
			}
			if(result.isTruncated){
				marker = result.nextMarker;
			}else{
				finished = true;
			}
		}
	}

	/**
	 * fileCount()
	 * 获取文件数量
	 * -----------
	 * @return {Integer}
	 * @author Verdient。
	 */
	get fileCount(){
		return this._files.length;
	}

	/**
	 * isEmpty()
	 * 获取是否为空
	 * ----------
	 * @return {Boolean}
	 * @author Verdient。
	 */
	get isEmpty(){
		return this.fileCount === 0;
	}

	/**
	 * removeFiles()
	 * 移除文件
	 * -------------
	 * @author Verdient。
	 */
	async removeFiles(){
		let fileNames = [];
		let batch = 0;
		let processBar = new ProcessBar('正在移除文件');
		let count = 0;
		for(let file of this._files){
			fileNames.push(file);
			batch++;
			count++;
			processBar.render(count, this.fileCount);
			if(batch === this.batchSize){
				await this.oss.deleteMulti(fileNames);
				fileNames = [];
				batch = 0;
			}
		}
		if(fileNames.length > 0){
			await this.oss.deleteMulti(fileNames);
		}
	}

	/**
	 * run()
	 * 运行
	 * ----
	 * @author Verdient。
	 */
	async run(){
		if(this.skipPrevious && await this.hasProvious()){
			let previousPublishDate = await this.previousPublishDate();
			this.info('上个版本的发布时间为：' + previousPublishDate + '（精确到小时）');
			this.info('本次操作将跳过上个版本');
		}
		let expirationDate = await this.expirationDate();
		let durationDays = await this.durationDays();
		let question = '是否移除 ' +
		String(this.config.oss.bucket).brightRed +
		' 中 ' +
		expirationDate.brightRed +
		' 前（约' + durationDays + '天前）' +
		'的文件';
		if(!await this.allow(question)){
			return;
		}
		this.print('正在收集信息');
		await this.collection();
		if(this.isEmpty){
			return this.error('没有需要移除的文件');
		}
		question = '即将移除 ' +
		String(this.config.oss.bucket).brightRed +
		' 中的 ' +
		String(this.fileCount).brightRed +
		' 个文件，是否继续？';
		if(!await this.allow(question)){
			return;
		}
		await this.removeFiles();
		this.success('移除成功');
	}
}

module.exports = Remove;