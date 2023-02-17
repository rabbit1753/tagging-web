# 標記系統

## Lab Equipment
* 伺服器編號：59
* 帳號：widm
* 密碼：widmwidm
* Docker Container：tagging-web

## Requirements
* uvicorn
* fastapi
* npm
* [http-server](https://www.npmjs.com/package/http-server)

## Folder Structure
tagging-web-server/
  |- Story-ERE-Labeling-Tool/
  |   |- script.js
  |   |- tagging-page.html
  |   |- bootstrap.bundle.min.js
  |   |- bootstrap.min.css
  |   |- style.css
  |- text_and_tagging/
  |- Progress Tracking.ipynb
  |- server.py

## Usage
啟動標記系統的後端
`uvicorn --host 0.0.0.0 --reload server:app`
啟動標記系統的前端
`http-server -p 8123`

最後標記系統的登入網址為：http://140.115.54.59:8123/tagging-page.html