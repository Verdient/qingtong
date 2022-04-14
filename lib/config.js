'use strict'

module.exports = {
    "oss": {
        "type": "object",
        "children": {
            "region": {
                "default": "oss-cn-hangzhou",
                "type": "string",
                "required": true,
                "description": "OSS区域"
            },
            "bucket": {
                "default": undefined,
                "type": "string",
                "required": true,
                "description": "OSS文件夹"
            },
            "accessKeyId": {
                "default": undefined,
                "type": "string",
                "required": true,
                "description": "OSS授权编号"
            },
            "accessKeySecret": {
                "default": undefined,
                "type": "string",
                "required": true,
                "description": "OSS授权秘钥"
            }
        }
    },
    "autoRemove": {
        "type": "boolean",
        "default": false,
        "required": false,
        "description": "是否自动移除过期文件"
    },
    "path": {
        "type": "string",
        "default": () => {
            return process.cwd() + '/' + 'dist';
        },
        "required": true,
        "description": "发布文件路径"
    },
    "duration": {
        "type": "number",
        "default": 15552000,
        "required": true,
        "description": "文件生命周期"
    },
    "skipPrevious": {
        "type": "boolean",
        "default": true,
        "required": false,
        "description": "是否跳过上个版本"
    },
    "ssh": {
        "type": "object",
        "children": {
            "host": {
                "type": "string",
                "default": undefined,
                "required": true,
                "description": "服务器地址"
            },
            "username": {
                "type": "string",
                "default": "root",
                "required": true,
                "description": "用户名"
            },
            "privateKey": {
                "type": "string",
                "default": undefined,
                "required": true,
                "description": "私钥路径"
            },
            "targetPath": {
                "type": "string",
                "default": undefined,
                "required": true,
                "description": "目标路径"
            }
        }
    }
}