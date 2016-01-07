微信推送消息解析
---
[![Build Status](https://travis-ci.org/liuxiaodong/wechat-xml-parser.png)](https://travis-ci.org/liuxiaodong/wechat-xml-parser)
[![Coverage Status](https://coveralls.io/repos/liuxiaodong/wechat-xml-parser/badge.svg?branch=master&service=github)](https://coveralls.io/github/liuxiaodong/wechat-xml-parser?branch=master)


### 用法  

```
	var app = require('express')();
	var xmlParser = require('wechat-xml-parser');

	app.use(xmlPrrser(options));

	xml:  

		<xml>
			<ToUserName><![CDATA[gh_956b2584a111]]></ToUserName>
			<FromUserName><![CDATA[ovKXbsxcjA05QLUcShoQkAMfkECE]]></FromUserName>
			<CreateTime>1452142781</CreateTime>
			<MsgType><![CDATA[event]]></MsgType>
			<Event><![CDATA[ShakearoundUserShake]]></Event>
			<ChosenBeacon>
				<Uuid><![CDATA[121212121212]]></Uuid>
				<Major>1111</Major>
				<Minor>1111</Minor>
				<Distance>0.057</Distance>
			</ChosenBeacon>
			<AroundBeacons>
				<AroundBeacon>
					<Uuid><![CDATA[121212121212]]></Uuid>
					<Major>2222</Major>
					<Minor>2222</Minor>
					<Distance>166.816</Distance>
				</AroundBeacon>
				<AroundBeacon>
					<Uuid><![CDATA[121212121212]]></Uuid>
					<Major>3333</Major>
					<Minor>3333</Minor>
					<Distance>15.013</Distance>
				</AroundBeacon>
			</AroundBeacons>
		</xml>


	result:  

		{
		  "ToUserName": "gh_956b2584a111",
		  "FromUserName": "ovKXbsxcjA05QLUcShoQkAMfkECE",
		  "CreateTime": "1452142918",
		  "MsgType": "event",
		  "Event": "ShakearoundUserShake",
		  "ChosenBeacon": {
		    "Uuid": "121212121212",
		    "Major": "1111",
		    "Minor": "1111",
		    "Distance": "0.057"
		  },
		  "AroundBeacons": {
		    "AroundBeacon": [
		      {
		        "Uuid": "121212121212",
		        "Major": "2222",
		        "Minor": "2222",
		        "Distance": "166.816"
		      },
		      {
		        "Uuid": "121212121212",
		        "Major": "3333",
		        "Minor": "3333",
		        "Distance": "15.013"
		      }
		    ]
		  }
		}	
```

`options:`  

`dataProp:`  xml 解析后的结果数据挂在到 req 对象上的属性名称，默认是 `body`  

`attrFormat:`  数据格式化 例：{AppId:'123'} -> {app_id: '123'}  

```
	* keep  保持不变  {AppId: '123'} -> {AppId: '123'}       
	* lowerCase 转小写  {AppId: '123'} -> {appid: '123'}      
	* underscored 转小写并以下划线间隔 {AppId: '123'} -> {app_id: '123'}   
	* 也可是一个函数  function(attr){ return attr.toLowerCase(); }  

	* 默认为 keep
``` 

`token:`  公众号 token  
`appid:`  公众号 appid  
`encrypt_key:`  公众号加密 key  
* 若需要解密 xml 数据，则需要配置以上 3 个参数  


