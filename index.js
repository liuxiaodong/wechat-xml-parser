'use strict';

var debug = require('debug')('wechat-xml-parser');
var parseString = require('xml2js').parseString;
var WXBizMsgCrypt = require('wechat-crypto');

module.exports = middleware;

var _toString = Object.prototype.toString;

var defaultOptions = {
  async: true,
  explicitArray: true,
  normalize: true,
  trim: true
};

/**
  * 字符串格式化
  * keep: 保持不变
  * lowerCase: 转为消息
  * underscored: 转为下划线形式
  */
var attrFormats = {
  keep: function(str) {
    return str.trim();
  },
  lowerCase: function(str) {
    return str.trim().toLowerCase();
  },
  underscored: function(str) {
    return str.trim().replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
  }
};

function middleware(options) {
  options = options || {};
  var attrProcessors, dataProp = 'body';
  if (typeof options.attrFormat === 'function') {
    attrProcessors = options.attrFormat;
  } else {
    attrProcessors = attrFormats[options.attrFormat || 'keep'];
  }

  if (typeof attrProcessors !== 'function') {
    throw new Error('attrFormat can be `keep` `lowerCase` `underscored` or a function');
  }

  var crypter;
  if (options.token && options.encrypt_key && options.appid){
    crypter = new WXBizMsgCrypt(options.token, options.encrypt_key, options.appid);
  }

  if (typeof options.dataProp === 'string') {
    dataProp = options.dataProp;
  }
  delete options.attrFormat;
  delete options.dataProp;

  return function wechatParser(req, res, next) {
    /* istanbul ignore if */
    if (req._body) return next();
    var method = req.method.toLowerCase();
    if (method !== 'post') return next();
    getBody(req, function(err, buf) {
      /* istanbul ignore if */
      if (err) {
        debug('get req body %j', err);
        return next();
      }
      req.rawBuf = buf;
      parse(buf, options, attrProcessors, crypter, function(err, data){
        /* istanbul ignore if */
        if (err) {
          next();
        } else {
          req._body = true;
          req[dataProp] = data || {};
          next();
        }
      });
    });
  };
}

function getBody(req, callback) {
  var chunks = [];
  var size = 0;
  req.on('data', function(chunk) {
    chunks.push(chunk);
    size += chunk.length;
  });
  req.on('end', function() {
    var buf = Buffer.concat(chunks, size);
    callback(null, buf.toString());
  });
  req.once('error', callback);
}

function parse(buf, parserOptions, attrProcessors, crypter, callback) {
  parseString(buf, parserOptions, function(err, xml) {
    /* istanbul ignore if */
    if (err) {
      debug('xml parse %j', err);
      return callback(err);
    }

    if (!xml) {
      debug('xml is empty');
      return callback();
    }

    var data = xml.xml;
    format(data, attrProcessors);
    var encryptAttr = attrProcessors('Encrypt');
    if (crypter && data[encryptAttr]) {
      var message = crypter.decrypt(data[encryptAttr]).message;
      parseString(message, parserOptions, function(err, ret){
        /* istanbul ignore if */
        if (err) {
          debug('xml parse %j', err);
          return callback(err);
        }

        /* istanbul ignore if */
        if (!ret) {
          debug('xml is empty');
          return callback();
        }

        var result = ret.xml;
        format(result, attrProcessors);

        callback(null, result);
      });
    } else {
      callback(null, data);
    }
  });  
}

function format(data, attrProcessors){
  /* istanbul ignore else */
  if (data) {
    var isArray = _toString.call(data) === '[object Array]';
    for (var p in data) {
      var value = data[p];
      var attr = p;
      if (!isArray) attr = attrProcessors(attr);
      if (attr !== p) {
        data[attr] = value;
        delete data[p];
      }
      if (_toString.call(value) === '[object Array]' && value.length === 1) {
        value = value[0];
      }
      data[attr] = value;
      if (_toString.call(value) === '[object Array]' || _toString.call(value) === '[object Object]') {
        format(data[attr], attrProcessors);
      }
    }
  }
}