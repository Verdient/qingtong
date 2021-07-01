const { createInterface } = require('readline');

let readline = null;
module.exports = {

    /**
     * 创建读行
     * @author Verdient。
     */
    createReadline(){
        if(readline === null){
            readline = createInterface({
                input: process.stdin,
                output: process.stdout
            });
        }
        return readline;
    },

    /**
     * 询问
     * @param {String} name 问题
     * @param {String} tip 提示
     * @param {String} defaultAnswer 默认答案
     * @return {Promise}
     * @author Verdient。
     */
    async question(name, tip, defaultAnswer)
    {
        return new Promise((resolve) => {
            let question = name;
            if(tip){
                question += '(' + tip.brightYellow + ')';
            }
            if(typeof defaultAnswer !== 'undefined'){
                question += ' [' + String(defaultAnswer).brightGreen + ']';
            }
            question += '：';
            let readline = this.createReadline();
            readline.question(question, (answer) => {
                if(answer === ''){
                    if(typeof defaultAnswer !== 'undefined'){
                        answer = defaultAnswer;
                    }else{
                        return resolve(this.question(name, tip, defaultAnswer));
                    }
                }
                // readline.close();
                resolve(answer);
            });
        });
    },

    /**
     * 是否允许执行
     * @param {String} name 问题
     * @param {String} tip 提示
     * @param {Boolean} allow 默认允许
     * @return {Promise}
     * @author Verdient。
     */
    async allow(name, tip, allow)
    {
        let defaultAnswer = allow === true ? 'y'.brightGreen : 'n'.brightRed;
        let answer = await this.question(name, tip, defaultAnswer);
        if(answer === 'y' || answer === 'yes'){
            return true;
        }
        return false;
    }
}