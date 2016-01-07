/* global describe: true, it: true */
'use strict';

var express = require('express');
var should = require('should');
var request = require('supertest');
var xmlParser = require('../');
var WXBizMsgCrypt = require('wechat-crypto');
var crypto = require('crypto');

var config = {
  id: 'gh_956b2584a111',
  token: 'swechatcardtest',
  appid: 'wx309678780eb63111',
  app_secret: 'f65a2f757b92787f137c359fa5699111',
  encrypt_key: '5iteleZLwN1UplKO08L7Fa57H5EuwPaTqnjvO85u111'
};
var openid = 'ovKXbsxcjA05QLUcShoQkAMfkECE';

var createXml = function (need_encrypt){
  var msg = '<MsgType><![CDATA[event]]></MsgType><Event><![CDATA[ShakearoundUserShake]]></Event><ChosenBeacon><Uuid><![CDATA[121212121212]]></Uuid><Major>1111</Major><Minor>1111</Minor><Distance>0.057</Distance></ChosenBeacon><AroundBeacons><AroundBeacon><Uuid><![CDATA[121212121212]]></Uuid><Major>2222</Major><Minor>2222</Minor><Distance>166.816</Distance></AroundBeacon><AroundBeacon><Uuid><![CDATA[121212121212]]></Uuid><Major>3333</Major><Minor>3333</Minor><Distance>15.013</Distance></AroundBeacon></AroundBeacons>';
  var timestamp = parseInt(new Date().getTime() / 1000, 0) + '';
  var xml = '<xml><ToUserName><![CDATA[' + config.id + ']]></ToUserName><FromUserName><![CDATA[' + openid + ']]></FromUserName><CreateTime>' + timestamp + '</CreateTime>' + msg + '</xml>';
  if (!need_encrypt) return xml;
  var crypter = new WXBizMsgCrypt(config.token, config.encrypt_key, config.appid);
  var encrypt = crypter.encrypt(xml);
  xml = '<xml><ToUserName><![CDATA[' + config.id + ']]></ToUserName><Encrypt><![CDATA[' + encrypt + ']]></Encrypt></xml>';
  return xml;
};

describe('xml-parser', function(){
  it.only('with default options and not encrypt', function(done){
    var app = express();
    app.use(xmlParser());
    var xml = createXml();
    app.post('/test', function(req, res) {
      console.log(JSON.stringify(req.body));
      var aroundBeacon = req.body.AroundBeacons.AroundBeacon;
      if (req.body.FromUserName === openid && req.body.ChosenBeacon.Uuid === '121212121212' && aroundBeacon[0].Uuid === '121212121212') {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    console.log(xml);
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('http method is put', function(done){
    var app = express();
    app.use(xmlParser());
    var xml = createXml();
    app.put('/test', function(req, res) {
      if (!req.body) {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).put('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('empty data', function(done){
    var app = express();
    app.use(xmlParser());
    var xml = createXml();
    app.post('/test', function(req, res) {
      if (req.body && Object.keys(req.body).length === 0) {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send('')
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('dataProp=weixin', function(done){
    var app = express();
    app.use(xmlParser({dataProp: 'weixin'}));
    var xml = createXml();
    app.post('/test', function(req, res) {
      var aroundBeacon = req.weixin.AroundBeacons.AroundBeacon;
      if (!req.body && req.weixin.FromUserName === openid && req.weixin.ChosenBeacon.Uuid === '121212121212' && aroundBeacon[0].Uuid === '121212121212') {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('with default options and encrypt', function(done){
    var app = express();
    app.use(xmlParser());
    var xml = createXml(true);
    app.post('/test', function(req, res) {
      if (req.body.ToUserName === config.id && req.body.Encrypt) {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('encrypt', function(done){
    var app = express();
    app.use(xmlParser({
      appid: config.appid,
      token: config.token,
      encrypt_key: config.encrypt_key
    }));
    var xml = createXml(true);
    app.post('/test', function(req, res) {
      var aroundBeacon = req.body.AroundBeacons.AroundBeacon;
      if (req.body.FromUserName === openid && req.body.ChosenBeacon.Uuid === '121212121212' && aroundBeacon[0].Uuid === '121212121212') {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('encrypt and attrFormat=underscored', function(done){
    var app = express();
    app.use(xmlParser({
      appid: config.appid,
      token: config.token,
      encrypt_key: config.encrypt_key,
      attrFormat: 'underscored'
    }));
    var xml = createXml(true);
    app.post('/test', function(req, res) {
      var aroundBeacon = req.body.around_beacons.around_beacon;
      if (req.body.from_user_name === openid && req.body.chosen_beacon.uuid === '121212121212' && aroundBeacon[0].uuid === '121212121212') {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('encrypt and attrFormat=lowerCase', function(done){
    var app = express();
    app.use(xmlParser({
      appid: config.appid,
      token: config.token,
      encrypt_key: config.encrypt_key,
      attrFormat: 'lowerCase'
    }));
    var xml = createXml(true);
    app.post('/test', function(req, res) {
      var aroundBeacon = req.body.aroundbeacons.aroundbeacon;
      if (req.body.fromusername === openid && req.body.chosenbeacon.uuid === '121212121212' && aroundBeacon[0].uuid === '121212121212') {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });
  });

  it('encrypt and attrFormat=test', function(){
    (function(){
      var app = express();
      app.use(xmlParser({
        appid: config.appid,
        token: config.token,
        encrypt_key: config.encrypt_key,
        attrFormat: 'test'
      }));
    }).should.throw();
  });

  it('encrypt and attrFormat is object', function(){
    (function(){
      var app = express();
      app.use(xmlParser({
        appid: config.appid,
        token: config.token,
        encrypt_key: config.encrypt_key,
        attrFormat: {}
      }));
    }).should.throw();
  });

  it('encrypt and attrFormat is function', function(done){
    var app = express();
    app.use(xmlParser({
      appid: config.appid,
      token: config.token,
      encrypt_key: config.encrypt_key,
      attrFormat: function(attr) {
        return 'aaa' + attr.toLowerCase();
      }
    }));
    var xml = createXml(true);
    app.post('/test', function(req, res) {
      var aroundBeacon = req.body.aaaaroundbeacons.aaaaroundbeacon;
      if (req.body.aaafromusername === openid && req.body.aaachosenbeacon.aaauuid === '121212121212' && aroundBeacon[0].aaauuid === '121212121212') {
        res.json({result: 'success'});
      } else {
        res.json({result: 'error'});
      }
    });
    request(app).post('/test')
    .set('Content-Type', 'application/xml')
    .send(xml)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      res.body.result.should.equal('success');
      done();
    });    
  });

});

