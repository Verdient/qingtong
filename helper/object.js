'use strict';

const class2type = {
	'[object Array]': 'array',
	'[object Boolean]': 'boolean',
	'[object Date]': 'date',
	'[object Error]': 'error',
	'[object Function]': 'function',
	'[object Number]': 'number',
	'[object Object]': 'object',
	'[object RegExp]': 'regexp',
	'[object String]': 'string',
	'[object AsyncFunction]': 'asyncFunction',
	'[object Set]': 'set',
	'[object Map]': 'map'
}

const core_toString = class2type.toString;
const core_hasOwn = class2type.hasOwnProperty;

/**
 * type(Mixed obj)
 * 对象类型
 * ---------------
 * @param Mixed obj 对象
 * ---------------------
 * @return {String}
 * @mirror jQuery
 * @author Verdient。
 */
let type = function(data){
	if(data == null){
		return String(data);
	}
	return typeof data === "object" || typeof data === "function" ? class2type[core_toString.call(data)] || "object" : typeof data;
}

/**
 * isPlainObject(Mixed obj)
 * 是否是素对象
 * ------------------------
 * @param Mixed obj 对象
 * ---------------------
 * @return {Boolean}
 * @mirror jQuery
 * @author Verdient。
 */
let isPlainObject = function(obj){
	if(!obj || type(obj) !== "object" || obj.nodeType){
		return false;
	}
	try{
		if(obj.constructor &&
			!core_hasOwn.call(obj, "constructor") &&
			!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")){
			return false;
		}
	}catch(e){
		return false;
	}
	let key;
	for(key in obj){}
	return key === undefined || core_hasOwn.call( obj, key );
}

/**
 * isEmptyObject(Mixed obj)
 * 是否是空对象
 * ------------------------
 * @param Mixed obj 对象
 * ---------------------
 * @return {Boolean}
 * @mirror jQuery
 * @author Verdient。
 */
let isEmptyObject = function(obj) {
	let name;
	for(name in obj){
		return false;
	}
	return true;
}

/**
 * merge()
 * 合并对象
 * --------
 * @return {Object}
 * @mirror jQuery
 * @author Verdient。
 */
let merge = function(){
	let options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		length = arguments.length;

	if(length < 2){
		return target;
	}
	for(let i = 1 ; i < length; i++ ){
		if((options = arguments[i]) != null){
			for(name in options){
				src = target[name];
				copy = options[name];
				if(target === copy){
					continue;
				}
				if(copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))){
					if (copyIsArray){
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					}else{
						clone = src && isPlainObject(src) ? src : {};
					}
					target[name] = merge(clone, copy);
				}else if(copy !== undefined){
					target[name] = copy;
				}
			}
		}
	}
	return target;
}

/**
 * inArray(Mixed needle, Array haystack)
 * 判断元素是否在数组中
 * -------------------------------------
 * @param {Mixed} needle 搜索的值
 * @param {Array} haystack 搜索的数组
 * ---------------------------------
 * @return {Boolean}
 * @author Verdient。
 */
let inArray = (needle, haystack) => {
	for(let i in haystack){
		if(haystack[i] == needle){
			return true;
		}
	}
	return false;
}

/**
 * ksort(Object data)
 * 根据键名排序
 * ------------------
 * @param {Object} data 待排序的数据
 * --------------------------------
 * @return {Object}
 * @author Verdient。
 */
let ksort = (data, compareFunction) => {
	let keys = Object.keys(data).sort(compareFunction);　　
	let result = {};
	keys.forEach((key) => {
		result[key] = data[key];
	});
	return result;
}

module.exports = {
	type,
	isPlainObject,
	isEmptyObject,
	merge,
	inArray,
	ksort
}