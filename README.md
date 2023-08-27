<div align='center'>
    <img width="128" src="./public/assets/icons/128px.png"/>
    <h1>Browser screen time</h1>
</div>

[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0.en.html)

Browser screen time is an extension which helps you track of the amount of time you spend online

## Downloading the extension

### Chrome
[Chrome extension link](https://chrome.google.com/webstore/detail/browser-screen-time/nlkcecddkejakmaipagbcemeohfomedn)

### Firefox
[Firefox addon link](https://addons.mozilla.org/en-US/firefox/addon/browser-screen-time)

## Building the extension
Run ```npm install``` to install dependencies, then ```npm run dev``` to build, or ```npm run watch``` to build and then watch for changes.

### Building for chrome
Chrome manifest v3 no longer supports background scripts, instead moving to service_workers. Replace the line `"scripts": [ "background.js" ]` 
with `"service_worker": "background.js"` and the extension should work with chrome. In the future this process could be automated.

        
        