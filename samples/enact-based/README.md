# Summary
A web browser for webOS Open Source Edition.

# Description
The browser is composed of two parts, 1) platform agnostic browser UI written on top of Enact framework and 2) a separate js library to support webview component, data binding, tab management policy, and platform-specific integration.

# Features
* Basic navigation via address bar, backward/forward button
* History
* Bookmark
* Most visited sites
* Recently closed sites
* Preferences
* Startup page selection
* Search engine selection
* Some customized layout options

# Installation
## How to build
Before building the app, the following tools and libraries are required:

```
* Node
* NPM
```

Also, the Enact command line tool must be installed globally. Use the following command to install it:

```sh
npm install -g @enact/cli
```

After you get all the tools and libraries, go to below path.
```
com.webos.app.enactbrowser/samples/enact-based/
```

Build the app with below command.
```
npm run build
```

## How to set up development environment on PC
This app is a chrome extension, you can load it to Chrome as a extension and run it on Chrome browser as well as inspect it.
1) Build the app
2) Load the built app on "chrome://extensions"

# Usage
## On target device
1) Turn on the device
2) Connect to the internet
3) Press windows key to see the app list
4) Click on "Web Browser" icon

## On PC
1) Launch Chrome and go to "chrome://apps"
2) Launch the app named "Enact-based Browser Sample"

# Author
- Mikyung Kim (mikyung27.kim@lge.com)
- Alexey Domokurov (alexey.domokurov@lge.com)

# Copyright and License Information

Unless otherwise specified, all content, including all source code files and
documentation files in this repository are:

Copyright (c) 2018 LG Electronics, Inc.

Unless otherwise specified or set forth in the NOTICE file, all content,
including all source code files and documentation files in this repository are:
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this content except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
