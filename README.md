# lemr-vis-web

## Getting Started

To get started, install the pre-requisites and then clone lemr-vis-web as described below:

### Prerequisites

1. You need git to clone the lemr-vis-web repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

2. You must have node.js and its package manager (npm) installed. You can download them from [http://nodejs.org/](http://nodejs.org/) or get them using your favourite package manager. For example, if you are on a Mac and have [homebrew][homebrew] installed, run `$ brew install node`.

3. We have separate repository for our backend service. Visit [lemr-nlp-server](https://github.com/trivedigaurav/lemr-nlp-server) for more. 


### Install Dependencies

1. Make sure you have [node.js][node] installed. 

2. Install yarn: `(sudo) npm install -g yarn` 

2. Run the install script: `yarn install`

3. (Skip this step to leave default settings as it is.) 
   In case you need to change the backend service's path, edit the `SERVER_URL` variable in _app/js/services.js_.

### Run the Application
The project does not come with a pre-configured websever. You may use [http-server][http-server] to start serving the app.

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own web server, such as Apache or Nginx. Just
configure your server to serve the files under the `app/` directory.


[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[grunt]: http://gruntjs.com/
[homebrew]: http://brew.sh/
[http-server]: https://github.com/indexzero/http-server
