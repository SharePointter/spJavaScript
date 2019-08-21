//==================================================================================================================== MODULAR
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
        var SkdSpJs = window.SkdSpJs || {};
        //  ROOT
        SkdSpJs.MOD_APP = {
            DEBUG: true,
            NAME: 'MOD_APP',
            mods: [],
            create_module: function(moduleID, creator) {
                if (typeof moduleID === 'string' && typeof creator === 'function') {
                    this.mods.push(moduleID);
                    this[moduleID] = {
                        create: creator,
                        instance: null,
                        data: {}
                    };
                } else {
                    console.log(1, "Module " + moduleId + " Registration: FAILED: one or more arguments are of incorrect type");
                }
            },
            init: function(startMods) {
                var _scripts = [{
                    'script': '',
                    fxn: ''
                }];
                for (var i = 0; i < _scripts.length; i++) {
                    var _sodLoaded = false;
                    if (typeof(_v_dictSod) !== 'undefined' && _v_dictSod[_scripts[i]] == null) {
                        RegisterSod(_scripts[i].script, _spPageContextInfo.siteServerRelativeUrl + '/_layouts/15/' + _scripts[i].script);
                        RegisterSodDep(_scripts[i].script, 'sp.js');
                    } else {
                        _sodLoaded = _v_dictSod[_scripts[i].script].state === Sods.loaded;
                    }
                    EnsureScriptFunc(_scripts[i].script, _scripts[i].fxn, function() {
                        this.DEBUG ? console.log(_scripts[i].script + ' loaded') : ''
                    });
                    if (_sodLoaded) {
                        this.DEBUG ? console.log(_scripts[i].script + ' loaded') : '';
                        continue;
                    } else {
                        EnsureScriptFunc(_scripts[i].script, _scripts[i].fxn, function() {
                            this.DEBUG ? console.log(_scripts[i].script + ' loaded') : '';
                        });
                    }
                }
                startMods ? this.startAll(startMods) : this.startAll(this.mods);
            },
            startAll: function(mods) {
                for (var i = 0; i < mods.length; i++) {
                    this.start(mods[i]);
                }
                console.log(this.NAME, ': ', this);
            },
            start: function(moduleID) {
                if (this[moduleID]) {
                    this[moduleID].instance = this[moduleID].create(this, moduleID);
                    this[moduleID].instance.init();
                } else {
                    console.log(this[moduleID]);
                }
            },
            stop: function(moduleID) {
                if (this[moduleID] && this[moduleID].instance) {
                    this[moduleID].instance.destroy();
                    this[moduleID].instance = null;
                } else {
                    console.log("Stop Module '" + moduleID + "': FAILED : module does not exist or has not been started");
                }
            },
            stopAll: function(mods) {
                for (var i = 0; i < mods.length; i++) {
                    this.stop(mods[i]);
                }
            }
            ajaxSpData: function(url, method, headers, payload, ajaxObj) {
                if (!method) {
                    method = "GET";
                    headers = {
                        "Accept": "application/json; odata=verbose"
                    };
                }
                var ajaxOptions = {
                    url: url,
                    type: method,
                    headers: headers
                };
                if (typeof ajaxObj != "undefined") {
                    for (var p in ajaxObj) {
                        ajaxOptions[p] = ajaxObj[p];
                    }
                }
                if (typeof payload != "undefined") {
                    ajaxOptions.data = payload; //JSON.stringify(payload);
                }
                return $.ajax(ajaxOptions);
            },
            errorFn: function(xhr, status, error) {
                console.log(xhr, status, error);
                var err = JSON.parse(xhr.responseText);
                alert(err.Message);
            },
            createDOMElement: function(options) {
                //options = { t: 'tagName', c: 'className', s: 'text.', a: { 'attr': 'value' }, a2: [ 'attr' ], h: 'html', k: [{ children }] };
                var el = null;
                if (!options.t) { //tagName
                    el = document.createDocumentFragment();
                } else {
                    el = document.createElement(options.t);
                    if (options.c) { //className
                        el.className = options.c;
                    }
                    if (options.a) { //attributes
                        for (var p in options.a) {
                            el.setAttribute(p, options.a[p]);
                        }
                    }
                    if (options.a2) { //attributes
                        for (var i = 0; i < options.a2.length; i++) {
                            el.setAttribute(options.a2[i], '');
                        }
                    }
                    if (options.h !== undefined) { //html
                        el.innerHTML = options.h;
                    }
                }
                if (options.s) { //text
                    el.appendChild(document.createTextNode(options.s));
                }
                if (window.HTMLElement === undefined) { // IE 8 doesn't have HTMLElement
                    window.HTMLElement = Element;
                }
                if (options.k && options.k.length) { //child/ren
                    for (var x = 0; x < options.k.length; x++) {
                        el.appendChild(options.k[x] instanceof window.HTMLElement ? options.k[x] : this.createDOMElement(options.k[x]));
                    }
                }
                return el;
            },
            showWaitDialog: function(doClose) {
                var waitDlg = typeof(SP.UI.ModalDialog.get_childDialog) == "function" ? SP.UI.ModalDialog.get_childDialog() : null;
                if (waitDlg == null) {
                    SP.SOD.loadMultiple(['strings.js', 'sp.ui.dialog.js'], function() {
                        waitDlg = SP.UI.ModalDialog.showWaitScreenWithNoClose('Please wait...', '...', 100, 300);
                    });
                } else if (waitDlg != null && doClose) {
                    waitDlg.close();
                    waitDlg = null;
                    // $('#DeltaPlaceHolderMain').css('visibility', 'visible');
                }
                return;
            },
            events: {
                events: {},
                on: function(eventName, fn) {
                    this.events[eventName] = this.events[eventName] || [];
                    if (this.events[eventName].length > 0 && this.events[eventName].indexOf(fn) > -1) {
                        return;
                    } else {
                        this.events[eventName].push(fn);
                    }
                },
                off: function(eventName, fn) {
                    if (this.events[eventName]) {
                        for (var i = 0; i < this.events[eventName].length; i++) {
                            if (this.events[eventName][i] === fn) {
                                this.events[eventName].splice(i, 1);
                                break;
                            }
                        }
                    }
                },
                emit: function(eventName, data, context) {
                    if (this.events[eventName]) {
                        if (!context) {
                            this.events[eventName].forEach(function(fn) {
                                fn(data);
                            });
                        } else {
                            this.events[eventName].forEach(function(fn) {
                                console.log(eventName);
                                fn.apply(context, data);
                            });
                        }
                    }
                }
            },
            data: {}
        };
        //  MOD
        SkdSpJs.MOD_APP.create_module('MOD_Name', function(_u, modId) {
            function init() {
                //
            }

            function destroy() {
                //
            }
            return {
                init: init,
                destroy: destroy
            };
        });
    });
