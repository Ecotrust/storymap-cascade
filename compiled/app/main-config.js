/*
  This file has been modified from Esri's original version.
  It now contains modifications to support local stories.
*/
(function() {
  function loadJS(url, isExternal) {
    var script = document.createElement('script');

    if (isExternal) {
      url = document.location.protocol == 'file:' ? 'http:' + url : url;
    }
    else {
      url += '?v=' + app.version + (!app.isProduction ? '&_=' + new Date().getTime() : '');
    }

    script.src = url;
    script.async = false;
    document.body.appendChild(script);
  }

  function loadCSS(url, isExternal) {
    if (isExternal) {
      url = document.location.protocol == 'file:' ? 'http:' + url : url;
    }
    else {
      url += '?v=' + app.version + (!app.isProduction ? '&_=' + new Date().getTime() : '');
    }

    var el = document.createElement('link');

    el.setAttribute('rel', 'stylesheet');
    el.setAttribute('type', 'text/css');
    el.setAttribute('href', url);
    document.getElementsByTagName('head')[0].appendChild(el);
  }

  function getUrlVar(name) {
    var vars = [], hash;

    if (window.location.href.indexOf('?') == -1) {
      return null;
    }

    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      hash[0] = hash[0].split('#')[0];
      vars.push(hash[0]);
      vars[hash[0]] = (hash[1] === undefined) ? true : hash[1];
    }
    return vars[name];
  }

  function getJSAPIVersionDirectory(url) {
    var jsapiUrl = url;
    // Find last character
    var charAtLastIndex = jsapiUrl.charAt(jsapiUrl.length - 1);
    // if it is "/", remove it.
    if (charAtLastIndex === '/') {
      jsapiUrl = url.substring(0, url.length - 1);
    }
    // split on slashes.
    var pieces = jsapiUrl.split('/');
    // Take last piece.
    return pieces[pieces.length - 1];
  }

  function showLocalStoryError(message) {
    console.error(message);
    document.querySelector('#fatalError .error-title').textContent = 'Local story unavailable';
    document.querySelector('#fatalError .error-msg').textContent = message;
    document.querySelector('#fatalError').style.display = 'block';
    ['#loadingOverlay', '#loadingIndicator', '#loadingMessage'].forEach(function(selector) {
      document.querySelector(selector).style.display = 'none';
    });
  }

  function checkLocalStory(ready) {
    var params = new URLSearchParams(location.search);
    var ids = params.getAll('appid');

    if (!ids.length || !ids[0]) {
      showLocalStoryError('Provide a story ID in the URL: ?appid=<32-character ArcGIS item ID>.');
      return;
    }

    if (ids.length !== 1 || !/^[a-f0-9]{32}$/i.test(ids[0])) {
      showLocalStoryError('Invalid appid. Provide exactly one ID containing 32 hexadecimal characters (0-9, a-f).');
      return;
    }

    if (location.protocol !== 'http:' && location.protocol !== 'https:') {
      showLocalStoryError('Open this application through an HTTP or HTTPS web server, not a local file.');
      return;
    }

    app.localStoryId = ids[0].toLowerCase();
    var baseUrl = 'storymaps/' + app.localStoryId + '/';
    app.localStory = {
      itemUrl: baseUrl + 'description.json',
      dataUrl: baseUrl + 'data.json',
      resourcesUrl: baseUrl + 'resources/'
    };
    app.indexCfg.appid = app.localStoryId;

    function checkFile(url, method, loaded) {
      var request = new XMLHttpRequest();
      request.open(method, url, true);
      request.timeout = 15000;
      request.onload = function() {
        if (request.status < 200 || request.status >= 300) {
          showLocalStoryError('Could not access "' + url + '" (HTTP ' + request.status +
            '). Check that the story files exist and the web server can serve them.');
          return;
        }
        loaded(request.responseText);
      };
      request.onerror = function() {
        showLocalStoryError('A network error prevented access to "' + url + '".');
      };
      request.ontimeout = function() {
        showLocalStoryError('The request for "' + url + '" timed out.');
      };
      request.send();
    }

    function loadJSON(url, loaded) {
      checkFile(url, 'GET', function(text) {
        var value;
        try {
          value = JSON.parse(text);
        }
        catch (error) {
          showLocalStoryError('Invalid JSON in "' + url + '": ' + error.message);
          return;
        }
        loaded(value);
      });
    }

    loadJSON(app.localStory.itemUrl, function(item) {
      if (!item || item.id !== app.localStoryId || typeof item.created !== 'number') {
        showLocalStoryError('Invalid metadata in "' + app.localStory.itemUrl +
          '": the id must match the story folder and created must be a numeric timestamp.');
        return;
      }

      loadJSON(app.localStory.dataUrl, function(data) {
        var values = data && data.values;
        if (!values || !values.config || !values.settings || !values.template ||
            !Array.isArray(values.sections) || !values.sections.length) {
          showLocalStoryError('Invalid Cascade data in "' + app.localStory.dataUrl +
            '": expected values.config, settings, template, and nonempty sections.');
          return;
        }

        var resources = [];
        var resourcePattern = new RegExp(
          '^(?:https?:)?//[^/]+/sharing/rest/content/items/' + app.localStoryId + '/resources/(.+)$'
        );
        function collectResources(value) {
          if (Array.isArray(value)) {
            value.forEach(collectResources);
          }
          else if (value && typeof value === 'object') {
            Object.keys(value).forEach(function(key) {
              collectResources(value[key]);
            });
          }
          else if (typeof value === 'string') {
            var match = value.match(resourcePattern);
            if (match) {
              var url = app.localStory.resourcesUrl + match[1];
              if (resources.indexOf(url) === -1) {
                resources.push(url);
              }
            }
          }
        }
        collectResources(data);

        function checkNextResource() {
          if (!resources.length) {
            ready();
            return;
          }
          checkFile(resources.shift(), 'HEAD', checkNextResource);
        }
        checkNextResource();
      });
    });
  }

  function defineDojoConfig() {
    var path1 = location.pathname.replace(/\/[^/]+$/, '/');
    var path2 = location.pathname.replace(/\/[^/]+$/, '');
    var path3 = location.pathname.replace(/\/src\/[^/]*$/, '/');
    var jsapi4Directory = getJSAPIVersionDirectory(app.pathJSAPI4);

    window.dojoConfig = {
      parseOnLoad: true,
      async: ! app.isProduction,
      isDebug: false,
      useDeferredInstrumentation: true,
      /*cacheBust: ! app.isProduction,*/
      has: {
        'dojo-preload-i18n-Api': false,
        // stop reporting when/then errors from the jsapi
        'esri-promise-compatibility': 1,
        'esri-webgl-max-contexts': -1
      },
      map: {
        'esri4/core/workers/JobProxy': {
          'dojo/dojo.js': '../' + jsapi4Directory + '/dojo/dojo.js'
        }
      },
      packages: [
        {
          name: 'storymaps',
          location: path1 + 'app/storymaps'
        },
        {
          name: 'storymaps-react',
          location: path3 + 'build/app/storymaps'
        },
        {
          name: 'issue-checker',
          location: path3 + 'build/app/storymaps/issue-checker'
        },
        {
          name: 'lib',
          location: path1 + 'lib'
        },
        {
          name: 'templateConfig',
          // If the application is deployed on a Portal (apps path contains /apps/MapSeries/ or /home/MapSeries/)
          // commonConfig.js is loaded from the parent folder, otherwise it's loaded from the app folder
          location: (/(\/)([a-zA-Z0-9]+(\/))*(apps\/|home\/)([a-zA-Z0-9]+\/)/).test(document.location.pathname) ? path2.substr(0,path2.lastIndexOf('/MapSeries')) : path2.replace(/\/+$/, '') + '/app'
        },
        {
          name: 'lib-build',
          location: path1 + 'lib-build'
        },
        {
          name: 'resources',
          location: path1 + 'resources/'
        },
        {
          name: 'esri4',
          location: app.pathJSAPI4 + 'esri'
        },
        {
          name: '@dojo',
          location: app.pathJSAPI4 + '@dojo'
        },
        {
          name: 'tslib',
          location: app.pathJSAPI4 + 'tslib',
          main: 'tslib'
        },
        {
          name: 'maquette',
          location: app.pathJSAPI4 + 'maquette',
          main: 'dist/maquette.umd'
        },
        {
          name: 'maquette-jsx',
          location: app.pathJSAPI4 + 'maquette-jsx',
          main: 'dist/maquette-jsx.umd'
        },
        {
          name: 'maquette-css-transitions',
          location: app.pathJSAPI4 + 'maquette-css-transitions',
          main: 'dist/maquette-css-transitions.umd'
        }
      ],
      aliases: [
        ['text', 'lib-build/text'],
        ['lib-build/i18n', 'dojo/i18n'],
        ['underscore', 'lib-build/lodash'],
        ['react', 'lib/react/react'],
        ['react-dom', 'lib/react/react-dom'],
        ['redux', 'lib/redux/index'],
        ['react-redux', 'lib/react-redux/index'],
        ['react-bootstrap', 'lib/react-bootstrap/react-bootstrap']
      ]
    };
  }

  app.isProduction = true;

  defineDojoConfig();

  if (location.search.match(/locale=([\w\-]+)/)) {
    window.dojoConfig.locale = RegExp.$1;
  }

  app.isInBuilder = getUrlVar('edit') || getUrlVar('fromScratch') || getUrlVar('fromscratch');
  app.isPrint = getUrlVar('print');
  app.indexCfg = configOptions; // eslint-disable-line no-undef

  app.isInBuilder = !! app.isInBuilder;
  app.isPrint = (!!app.isPrint) && !app.isInBuilder;

  checkLocalStory(startApplication);

  function startApplication() {
  loadCSS(app.pathJSAPI3 + 'esri/css/esri.css', true);
  loadCSS(app.pathJSAPI3 + 'dijit/themes/claro/claro.css', true);

  if (app.isProduction) {
    if (app.isInBuilder) {
      loadCSS('app/builder-min.css');
    }
    else if (app.isPrint) {
      loadCSS('app/print-min.css');
    }
    else {
      loadCSS('app/viewer-min.css');
    }
  }

  if (navigator.appName.indexOf('Internet Explorer') != -1) {
    var badBrowser = (
      navigator.appVersion.indexOf('MSIE 9') == -1 && //v9 is ok
      navigator.appVersion.indexOf('MSIE 1') == -1 //v10, 11, 12, etc. is fine too
    );

    if (badBrowser) {
      document.querySelector('#fatalError .error-title').innerHTML = 'Sorry!';
      document.querySelector('#fatalError .error-msg').innerHTML = 'This story is not supported in Internet Explorer before version 11. <a href="http://browsehappy.com/" target="_blank">Please update your browser</a>';
      document.querySelector('#fatalError').style.display = 'block';
    }
  }

  if (app.isProduction) {
    window.dojoConfig.aliases.push(['Handlebars', 'handlebars.runtime']);
  }
  else {
    window.dojoConfig.aliases.push(['Handlebars', 'lib-build/hbs/handlebars.js']);
  }

  loadJS(app.pathJSAPI3 + 'init.js', true);
  loadJS('app/config.js');

  if (app.isProduction) {
    _ = {}; // eslint-disable-line no-undef

    if (app.isInBuilder) {
      loadJS('app/builder-min.js');
    }
    else if (app.isPrint) {
      loadJS('app/print-min.js');
    }
    else {
      loadJS('app/viewer-min.js');
    }
  }

  if (document.location.protocol == 'file:') {
    $(document).ready(function() {
      $('#fatalError .error-title').html('Application loading failed');
      $('#fatalError .error-msg').html('The application has to be accessed through a web server. Consult user guide for detail.');
      $('#fatalError').show();
    });
  }
  else {
    loadJS('app/main-app.js');
  }

  // Enable Google Analytics on storymaps.esri.com
  if (window.location.href.toLowerCase().indexOf('storymaps.esri.com') >= 0) {
    var _gaq = _gaq || [];

    _gaq.push(['_setAccount', 'UA-26529417-1']);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script');

      ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0];

      s.parentNode.insertBefore(ga, s);
    })();
  }

  loadJS('app/custom-scripts.js');

  if (! app.isProduction) {
    loadJS('//localhost:35729/livereload.js');
  }
  }
})();
