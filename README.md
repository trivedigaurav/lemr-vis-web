# lemr-vis-web

## Getting Started

To get started, install the pre-requisites and then clone emr-vis-web as described below:

### Prerequisites

1. You need git to clone the emr-vis-web repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

2. You must have node.js and its package manager (npm) installed. You can download them from [http://nodejs.org/](http://nodejs.org/) or get them using your favourite package manager. For example, if you are on a Mac and have [homebrew][homebrew] installed, run `$ brew install node`.

3. We use the [Apache Tomcat](http://tomcat.apache.org/) server to deploy the app. On a Mac with [homebrew][homebrew] you may use `$ brew install tomcat` to get it.

4. We have separate repository for our backend service. Visit [emr-nlp-server](https://github.com/NLPReViz/emr-nlp-server) for more. 

### Clone emr-vis-web

1. Navigate to the home directory of your tomcat server. You can use `$ catalina version` and find out what `CATALINA_HOME` is set to.
2. `cd` to the _webapps/_ directory. If you are using the default tomcat setup, your present working directory would be something like _/usr/local/Cellar/tomcat/7.0.54/libexec/webapps/_.
3. Clone the emr-vis-web repository into the webapps direcory using [git][git]:

    ```
    cd webapps
    git clone https://github.com/NLPReViz/emr-vis-web.git
    cd emr-vis-web
    ```

### Install Dependencies

1. Make sure you have [node.js][node] installed. 

2. Run the install script:

    ```
    yarn install
    ```

3. (Skip this step to leave default settings as it is.) 
   In case you need to change the backend service's path, edit the `config.backend` variable in _package.json_ **or**  use the following commands:

    ```
    npm config set emr-vis-web:backend <relative/path/to/backend/service>
    npm start
    ```
    
    Valid examples of this path include _"http://localhost:9090/backEndService"_, _"/backEndService"_ etc.
    
    Editing package.json would be a permanent solution while using the `npm config` lets you include the config settings for the current terminal session.

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