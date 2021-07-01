'use strict'

const slog = require('single-line-log');

/**
 * 进度条
 * @author Verdient。
 */
class ProgressBar
{
    /**
     * 构造函数
     * @param {String} tip 提示
     * @param {Integer} length 长度
     * @author Verdient。
     */
    constructor(tip, length, singleLine)
    {
        this.tip = String(tip || '进度').brightBlue;
        this.length = length || 50;
        this.log = slog.stdout;
        this.singleLine = singleLine === true ? true : false;
    }

    /**
     * 渲染
     * @param {Integer} completed 已完成的
     * @param {Integer} total 总数
     * @param {String} tip 提示
     * @author Verdient。
     */
    render(completed, total, tip)
    {
        let percent = (completed / total).toFixed(4);
        let cellNum = Math.floor(percent * this.length);
        let cell = '';
        for(let i = 0; i < cellNum; i++){
            cell += '█';
        }
        let empty = '';
        for(let i = 0; i < this.length - cellNum; i++){
            empty += '░';
        }
        if(!tip){
            tip = this.tip;
        }
        let text = tip + ': ' + cell + empty + ' ' + completed + '/' + total + ' (' + (100 * percent).toFixed(2) + '%)';
        this.log(text);
        if(completed == total){
            if(this.singleLine){
                this.log('');
            }else{
                console.log('');
            }
        }
    };
}

module.exports = ProgressBar;