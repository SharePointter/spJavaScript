var SkdSpJs = window.SkdSpJs || {};
//+++++++++++++++++++++++      /_layouts/15/closeConnection.aspx?loginasanotheruser=true
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
//====================================================================================================================UTILITIES
    SkdSpJs.Utils = {
        base: _spPageContextInfo.webServerRelativeUrl === '/' ? '' : _spPageContextInfo.webServerRelativeUrl,
        getScriptIfNotCached: function(_script, callback) {
            jQuery.ajax({
                dataType: "script",
                cache: true,
                url: SkdSpJs.Utils.base + "_layouts/15/" + _script,
                success: callback,
                error: function() {
                    console.log(_script + ': was cached');
                }
            });
        },
        clearAllSearchFilters: function() {
            var hash = window.location.hash;
            if (hash.indexOf('Default') == 1) {
                hash = unescape(hash);
                var kIdx = hash.indexOf('"k":');
                var rIdx = hash.indexOf('","');
                var query = hash.substring(kIdx + 5, rIdx);
                query = query.replace(/\\/g, '');
                window.location.href = window.location.pathname + window.location.search + '#k=' + escape(query);
            } else {
                window.location.href = window.location.pathname + window.location.search + "#";
            }
        },
        clearRefinerFilters: function(e) { // event handler
            var qryGrpName = $(e.target).attr('data-clientCntrl'); // change this get query group name.
            var scriptManager = Srch.ScriptApplicationManager.get_current();
            var queryGroup = scriptManager.queryGroups[qryGrpName];
            var searchControls = queryGroup.displays;
            for (var i = 0; i < searchControls.length; i++) {
                if (searchControls[i] instanceof Srch.Refinement) {
                    searchControls[i].clearAllRefiners();
                    break;
                }
            }
            queryGroup.DataProvider.issueQuery();
        },
        isDomElem: function(obj) { //obj = $('.selector')[0];
            if ((obj instanceof HTMLCollection || obj instanceof HTMLDivElement || obj instanceof Element) && obj.length) {
                for (var a = 0, len = obj.length; a < len; a++) {
                    if (!checkInstance(obj[a])) {
                        //console.log(a);
                        return false;
                    }
                }
                return true;
            } else {
                if (obj.tagName) {
                    return true;
                } else {
                    //console.log(obj.constructor.name);
                    return checkInstance(obj);
                }
            }

            function checkInstance(elem) {
                if ((elem instanceof jQuery && elem.length) || elem instanceof HTMLElement) {
                    return true;
                }
                return false;
            }
        },
        exportHtmlToExcel: function() {
            var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>",
                ua = window.navigator.userAgent,
                msie = ua.indexOf("MSIE "),
                tab = document.getElementById('{818AAD80-3CAD-48C6-AABA-D0A225A4D08F}-{70352EC0-82B2-4175-98A2-84A9B95003BA}'); // id of table. change this as needed.
            textRange, j = 0,
                for (j = 0; j < tab.rows.length; j++) {
                    tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
                    //tab_text=tab_text+"</tr>";
                }
            tab_text = tab_text + "</table>";
            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) { // If Internet Explorer
                txtArea1.document.open("txt/html", "replace");
                txtArea1.document.write(tab_text);
                txtArea1.document.close();
                txtArea1.focus();
                sa = txtArea1.document.execCommand("SaveAs", true, "Global View Task.xls");
            } else { //other browser not tested on IE 11
                sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
            }
            return (sa);
        },
        stringifyJsonCustom: function(json) {
            if (typeof json != 'string') {
                json = JSON.stringify(json, undefined, 2);
            }
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        },
        resizeFieldElmInModalDlg: function() {
            $('#DeltaPlaceHolderMain>div.row>div.left-main.left-col-innerpages.col-md-10>div.main_area table').first().find('td.ms-cellstyle.ms-vb2>a.ms-listlink').each(function(index) {
                $(this).on('click', function() {
                    var intervalID = setInterval(function() {
                        var lastBoxModal = $(SP.UI.ModalDialog.get_childDialog().get_lastTabStop()).closest('tr').prevAll().eq(2).find('textarea');
                        lastBoxModal.attr("style", "padding:5px!important;height:200px");
                    }, 1000);
                    setTimeout(function() {
                        clearInterval(intervalID);
                    }, 10000);
                });
            });
        },
        skdModalDlg: function() {
            var cswpGuid = null;
            /*
                    var opt = { title: title, url: url, dialogReturnValueCallback: null, html: null, args: null, allowMaximize: null, showClose: null, autoSize: null, showMaximized: null, height: null, width: null, xPos: null, yPos: null }
            */
            function setOptions(opt) {
                var options = {};
                options.dialogReturnValueCallback = opt.dialogReturnValueCallback || onDlgClose;
                opt.showMaximized ? options.showMaximized = opt.showMaximized : '';
                opt.title ? options.title = decodeURIComponent(opt.title) : '';
                opt.autoSize ? options.autoSize = opt.autoSize : '';
                options.allowMaximize = opt.allowMaximize || true;
                opt.height ? options.height = opt.height : '';
                opt.width ? options.width = opt.width : '';
                options.showClose = opt.showClose || true;
                opt.html ? options.html = opt.html : '';
                opt.args ? options.args = opt.args : '';
                opt.xPos ? options.x = opt.xPos : '';
                opt.yPos ? options.y = opt.yPos : '';
                opt.url ? options.url = opt.url : '';
                return options;
            }

            function _resizeDlg() {
                var dlg = typeof(SP.UI.ModalDialog.get_childDialog) == "function" ? SP.UI.ModalDialog.get_childDialog() : null;
                if (dlg != null) {
                    dlg.autoSize();
                    var dlgWin = $(".ms-dlgContent", window.parent.document);
                    dlgWin.css({
                        top: ($(window.top).height() / 2 - (dlgWin.height() / 2)) + "px",
                        left: $(window.top).width() / 2 - (dlgWin.width() / 2) + "px",
                        height: '98vh;',
                        overflow: 'auto;'
                    });
                    $('.ms-dlgTitle').css({
                        'padding': '10px 30px 5px 5px'
                    });
                } else {
                    setTimeout(resizeDlg, 100);
                }
            }

            function isMobile() {
                if (navigator.userAgent.match(/Mobi/)) {
                    return true;
                }
                if ('screen' in window && window.screen.width < 993) {
                    return true;
                }
                var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (connection && connection.type === 'cellular') {
                    return true;
                }
                return false;
            }

            function resizeDlg(cntr) {
                var dlg = typeof(SP.UI.ModalDialog.get_childDialog) == "function" ? SP.UI.ModalDialog.get_childDialog() : null;
                if (dlg != null && dlg.$e_0 != null) {
                    var dom = dlg.$e_0.getElementById("DeltaPlaceHolderMain");
                    //console.log(dom);
                    if (dom) {
                        dlg.autoSize();
                        var dlgWin = $(".ms-dlgContent", window.parent.document);
                        dlgWin.css({
                            top: ($(window.top).height() / 2 - (dlgWin.height() / 2)) + "px",
                            left: $(window.top).width() / 2 - (dlgWin.width() / 2) + "px",
                            height: '98vh;',
                            overflow: 'auto;'
                        });
                        $('.ms-dlgTitle').css({
                            'padding': '10px 30px 5px 5px'
                        });
                    } else {
                        cntr = cntr + 1;
                        cntr < 25 ? setTimeout(function() {
                            resizeDlg(cntr);
                        }, 200) : console.log('DLG Timed Out');
                    }
                } else {
                    cntr = cntr + 1;
                    cntr < 20 ? setTimeout(function() {
                        resizeDlg(cntr);
                    }, 200) : console.log('DLG Timed Out');
                }
            }

            function renderDlg(options) {
                $.ajax({
                    url: OpenPopUpPageWithDialogOptions(options),
                    async: true,
                    cache: false,
                    success: function(data) {
                        !options.showMaximized ? resizeDlg(0) : '';
                    },
                    error: function(err) {
                        console.log(err);
                    }
                });
            }

            function createDlg(opt, cswpId) {
                var options = setOptions(opt);
                if (!options.html) {
                    if (!isMobile()) {
                        cswpGuid = cswpId ? cswpId : cswpGuid;
                        renderDlg(options);
                    } else {
                        window.location.href = options.url;
                    }
                } else {
                    $.ajax({
                        url: options.html,
                        type: "GET"
                    }).done(function(data) {
                        var htmlElement = document.createElement('div');
                        $(htmlElement).append(data);
                        options.html = htmlElement;
                        renderDlg(options);
                    });
                }
            }

            function onDlgClose(result, returnedValue) {
                console.log(result, returnedValue);
                if (result === 1 && returnedValue && returnedValue.newFileUrl && returnedValue.newFileUrl.indexOf('/sites/trgs/Documents/') > -1) {
                    console.log(result, returnedValue);
                } else {
                    var groups = Srch.ScriptApplicationManager.get_current().queryGroups;
                    $.each(groups, function() {
                        if (this.displays != null && this.displays.length > 0) {
                            if (this.displays[0] instanceof Srch.ContentBySearch) {
                                var _id = this.displays[0].get_id();
                                if (_id === cswpGuid) {
                                    cswpGuid = '';
                                    this.dataProvider.issueQuery();
                                }
                            }
                        }
                    });
                }
            }
            return {
                createDlg: createDlg,
                resizeDlg: resizeDlg
            };
        },
        domObserver: function(target, _attributes, _subtree, _childList, _attributeFilter, _attributeOldValue, _characterDataOldValue, fnCallback) { //TARGET MUST BE A NODE ELEMENT
            var observer = new MutationObserver(function() {
                fnCallback();
            });
            var config = {
                attributes: _attributes,
                subtree: _subtree,
                childList: _childList,
                attributeFilter: _attributeFilter,
                attributeOldValue: _attributeOldValue,
                characterDataOldValue: _characterDataOldValue
            };
            observer.observe(target, config);
        },
        extend: function(obj1, obj2) {
            obj1.prototype.extend = function(obj2) {
                for (var i in obj2) {
                    if (obj2.hasOwnProperty(i)) {
                        this[i] = obj2[i];
                    }
                }
            };
        },
        centerVert: function(jQuerycontainer, jQueryelToCenter, defaultMargin) {
            var diff = ((jQuerycontainer.height() - jQueryelToCenter.height()) / 2);
            if (diff > 0) {
                jQueryelToCenter.css('margin-top', diff);
                jQueryelToCenter.css('margin-bottom', diff);
            } else {
                jQueryelToCenter.css('margin-top', defaultMargin);
                jQueryelToCenter.css('margin-bottom', defaultMargin);
            }
        },
        centerHorz: function(jQuerycontainer, jQueryelToCenter, defaultMargin) {
            var diff = ((jQuerycontainer.heightwidth() - jQueryelToCenter.width()) / 2);
            if (diff > 0) {
                jQueryelToCenter.css('margin-left', diff);
                jQueryelToCenter.css('margin-right', diff);
            } else {
                jQueryelToCenter.css('margin-left', defaultMargin);
                jQueryelToCenter.css('margin-right', defaultMargin);
            }
        },
        executeWhenElemRenders: function(jQueryelem, fnTrue, fnFalse) {
            (jQueryelem.length) ? (fnTrue) : (requestAnimationFrame(fnFalse));
        },
        autoScroll: function(jQuerycontainer, jQueryelem, adjustInt) {
            jQuerycontainer.animate({
                scrollTop: (jQueryelem.offset().top - adjustInt) - jQuerycontainer.offset().top + jQuerycontainer.scrollTop()
            });
        },
        addCssToHead: function(cssStr) { // cssStr = "header { float: left; opacity: 0.8; }"
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(''));
            document.head.appendChild(style);
            style.sheet.insertRule(cssStr);
        },
        createDomElement: function(options) {
            var el, a, i;
            if (!options.tagName) {
                el = document.createDocumentFragment();
            } else {
                el = document.createElement(options.tagName);
                if (options.className) {
                    el.className = options.className;
                }
                if (options.attributes) {
                    for (a in options.attributes) {
                        el.setAttribute(a, options.attributes[a]);
                    }
                }
                if (options.html !== undefined) {
                    el.innerHTML = options.html;
                }
            }
            if (options.text) {
                el.appendChild(document.createTextNode(options.text));
            }
            if (window.HTMLElement === undefined) { // IE 8 doesn't have HTMLElement
                window.HTMLElement = Element;
            }
            if (options.child && options.child.length) {
                for (i = 0; i < options.child.length; i++) {
                    el.appendChild(options.child[i] instanceof window.HTMLElement ? options.child[i] : _createDomElement(options.child[i]));
                }
            }
            return el;
        },
        triggerPostback: function() {
            var elementName = $("input[id$=SaveItem]").attr("name");
            WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(elementName, "", true, "", "", false, true));
            WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(elementName, "", true, "", "", false, true));
        },
        nestDomEls: function() { //takes args and nests them within each other with the last arg being the inner most elem.
            var nestedEl;
            var rootNode = arguments["0"];
            var nodes = Array.prototype.slice.call(arguments, 1);
            //debugger;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i + 1]) {
                    nodes[i].appendChild(nodes[i + 1]);
                } else {
                    nestedEl = nodes[0];
                }
            }
            return rootNode.appendChild(nestedEl);
            /*
                    var domeElArr = [
                            "table, table table-bordered",
                            "thead",
                            "tr",
                            "th"
                    ];
                    domeElArr.map(function(str){
                            var el = createDOMElement.apply(this, str.split(', '));
                            merfTableElArr.push(el);
                    });
                    var merfTable = nestDomEls.apply(this, merfTableElArr);
            */
        },
        cacheDomElem: function(CacheStore, selector) {
            var CacheStore = window[CacheStore] || {};
            if (CacheStore[selector] !== undefined) {
                return CacheStore[selector];
            } else {
                utils.ifElemIsRendered(jQuery(selector), function() {
                    console.log(jQuery(selector))
                }, utils.cacheDom(CacheStore, selector, force));
                CacheStore[selector] = jQuery(selector);
                return CacheStore[selector];
            }
        },
        getStrDiffByInt: function(a, b) {
            var i = 0;
            var j = 0;
            var result = "";
            while (j < b.length) {
                if (a[i] != b[j] || i == a.length)
                    result += b[j];
                else
                    i++;
                j++;
            }
            return result.length;
        },
        showWaitDialog: function() {
            var waitDlg = typeof(SP.UI.ModalDialog.get_childDialog) == "function" ? SP.UI.ModalDialog.get_childDialog() : null;
            if (waitDlg == null) {
                SP.SOD.loadMultiple(['strings.js', 'sp.ui.dialog.js'], function() {
                    waitDlg = SP.UI.ModalDialog.showWaitScreenWithNoClose('Loading...', '', 100, 300);
                });
            } else if (waitDlg != null) {
                waitDlg.close();
                waitDlg = null;
                $('#DeltaPlaceHolderMain').css('visibility', 'visible');
            }
            return;
        },
        showSpStatus: function(message, color) {
            if (message && !_u.statusId) {
                var _status = SP.UI.Status.addStatus(message);
                SP.UI.Status.setStatusPriColor(_status, color);
                return _status;
            } else {
                SP.UI.Status.removeStatus(_u.statusId);
                _u.statusId = null;
            }
            return;
        },
        dateTimeFormatter: function(date_tz) { //'2017-02-17T22:32:25.000Z'
            if (!date_tz || date_tz == '') {
                return '';
            }
            var date = new Date(date_tz);
            var formatOptions = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            var dateString = date.toLocaleDateString('en-US', formatOptions); // => "02/17/2017, 11:32 PM"
            //dateString = dateString.replace(',', '').replace('PM', 'p.m.').replace('AM', 'a.m.'); // => "02/17/2017 11:32 p.m."
            dateString = dateString.replace(',', '').replace(/\//g, '-').replace('PM', 'pm').replace('AM', 'am');
            return dateString;
        },
        timeDateFormat: function(date_tz) {
            if (!date_tz || date_tz == '') {
                return '';
            }
            var date = date_tz ? new Date(date_tz) : new Date();
            var date = new Date(date_tz);
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? (hours < 10 ? '0' + hours : hours) : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "-" + date.getFullYear() + " " + strTime;
        },
        spFriendlyDateTime: function(dateObj) {
            return SP.DateTimeUtil.SPRelativeDateTime.getRelativeDateTimeString(datObj, true, SP.DateTimeUtil.SPCalendarType.none, false);
        },
        currencyFormatter: function(val) {
            if (typeof Intl != 'undefined') {
                var newV = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2
                });
                var newVal = newV.format(val);
                return newVal === '-$0.00' ? '$0.00' : newVal;
            } else {
                var newVal = parseFloat(val).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
                newVal = newVal.indexOf('-') > -1 ? newVal.replace('-', '-$') : '$' + newVal;
                return newVal == '-$0.00' ? '$0.00' : newVal;
            }
        },
        getPropertyValue: function(obj, propKey) {
            var _val = $.grep(obj, function(e) {
                return e.Key == propKey;
            })[0].Value;
            return _val;
        },
        getFieldValue: function(elm) {
            var fldGetters = {
                'type_Choice': function(elm) {
                    return $(elm).find('>select').val();
                },
                'type_MultiChoice': function(elm) {
                    var valArr = [];
                    $(elm).find('ul>li.selected').each(function() {
                        valArr.push($(this).find('input').val());
                    });
                    return valArr;
                },
                'type_DateTime': function(elm) {
                    return $(elm).find('>div.form_datetime>input').val();
                },
                'type_Text': function(elm) {
                    return $(elm).find('input').val();
                },
                'type_Note': function(elm) {
                    return $(elm).find('textarea').val();
                }
            }
            var fType = $(elm).attr('class');
            return fldGetters[fType](elm);
        },
        compareArrs: function(arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            for (var i = 0, l = arr1.length; i < l; i++) {
                if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
                    if (!arr1[i].compare(arr2[i]) && arr1.indexOf(arr2[i]) < 0) {
                        return false;
                    }
                } else if (arr1[i] !== arr2[i] && arr1.indexOf(arr2[i]) < 0) {
                    return false;
                }
            }
            return true;
        },
        getLoadedScriptPath: function(jsfile) {
            var scriptElements = document.getElementsByTagName('script');
            var i, element, myfile;
            for (i = 0; element = scriptElements[i]; i++) {
                myfile = element.src;
                if (myfile.indexOf(jsfile) >= 0) {
                    var myurl = myfile.substring(0, myfile.indexOf(jsfile));
                }
            }
            return myurl;
        },
        spDecode: function(toDecode) {
            return unescape(toDecode.replace(/_x/g, "%u").replace(/_/g, ""));
        },
        spEncode: function(toEncode) {
            var charToEncode = toEncode.split('');
            var encodedString = "";
            for (var i = 0; i < charToEncode.length; i++) {
                encodedChar = escape(charToEncode[i]); //.toLowerCase();
                if (encodedChar.length == 3) {
                    encodedString += encodedChar.replace("%", "_x00") + "_";
                } else if (encodedChar.length == 5) {
                    encodedString += encodedChar.replace("%u", "_x") + "_";
                } else {
                    encodedString += encodedChar;
                }
            }
            return encodedString;
        },
        htmlDecode: function(input) {
            var e = document.createElement('div');
            e.innerHTML = input;
            return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
        },
        //
        getFileNAppend: function(jQueryelem, Url) {
            jQuery.ajax({
                url: Url,
                type: "GET"
            }).done(handler);

            function handler(data) {
                jQueryelem.append(data);
            }
        },
        //
        validateInput: function(jQueryinputElem) {
            if (jQuery.trim(jQueryinputElem.val()) == '') {
                alert("Please provide a proper response.");
                return false;
            } else {
                return true;
            }
        },
        //
        skdSort: function(a, b, prop) {
            if (a.get_item(prop) > b.get_item(prop))
                return -1;
            if (a.get_item(prop) < b.get_item(prop))
                return 1;
            return 0;
        },
        matchesSelector: function(el, selector) {
            var p = Element.prototype;
            var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
            };
            return f.call(el, selector);
        },
        getUrlParam: function(prm, url, decode) { //GetUrlKeyValue('View', false, window.location.href)
            decode = decode || false;
            getUrlKeyValueCustom() {
                var Params = {};
                var query = window.location.search.substring(1).split("&");
                for (var i = 0, max = query.length; i < max; i++) {
                    if (query[i] === "")
                        continue;
                    var param = query[i].split("=");
                    Params[decodeURIComponent(param[0])] = decode ? decodeURIComponent(param[1] || "") : param[1] || "";
                }
                return Params[prm];
            }
            return typeof GetUrlKeyValue === 'function' ? GetUrlKeyValue(prm, decode, url) : getUrlKeyValueCustom();
        },
        generateGuid: function() {
            var result, i, j;
            result = '';
            for (j = 0; j < 32; j++) {
                if (j == 8 || j == 12 || j == 16 || j == 20)
                    result = result + '-';
                i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
                result = result + i;
            }
            return result;
        },
        isSpPageInEditMode: function() { //SP.SOD.executeFunc('SP.Ribbon.js', 'SP.ClientContext', SkdSpJs.Utils.isSpPageInEditMode);
            return document.getElementById("Ribbon.WikiPageTab-title") ? document.forms[MSOWebPartPageFormName]._wikiPageMode.value == "Edit" : document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value == "1";
        },
        windowResizeEvent: function() {
            var TO = false;
            var resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';
            $(window).on(resizeEvent, function() {
                TO && clearTimeout(TO);
                TO = setTimeout(resizeBody, 200);
            });

            function resizeBody() {
                var dim = {
                    height: window.innerHeight || $(window).height(),
                    width: window.innerWidth || $(window).width(),
                }
                console.log(dim);
                return dim;
            }
        },
        addJsOrCssLinkToHead: function(resourceObj) { //        addResource({tag:'link'/'script', urlType:'href'/'src', url:'/SiteAssets/app/css/jquery-ui.min.css', type:'text/css'/'text/javascript'});
            var elem = document.createElement(resourceObj.tag);
            elem[resourceObj.urlType] = resourceObj.url;
            elem.type = resourceObj.type;
            document.getElementsByTagName("head")[0].appendChild(elem);
            return;
        },
        createJsOrCssFile: function(filename, filetype) {
            var fileref;
            if (filetype == "js") { //if filename is a external JavaScript file
                fileref = document.createElement('script');
                fileref.setAttribute("type", "text/javascript");
                fileref.setAttribute("src", filename);
            } else if (filetype == "css") { //if filename is an external CSS file
                fileref = document.createElement("link");
                fileref.setAttribute("rel", "stylesheet");
                fileref.setAttribute("type", "text/css");
                fileref.setAttribute("href", filename);
            }
            return fileref;
        },
        replaceJsOrCssFile: function(oldfilename, newfilename, filetype) { //will not remove the script from memory if js
            var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none"; //determine element type to create nodelist using
            var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none"; //determine corresponding attribute to test for
            var allsuspects = document.getElementsByTagName(targetelement);
            for (var i = allsuspects.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
                if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename) != -1) {
                    var newelement = createjscssfile(newfilename, filetype);
                    allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i]);
                }
            }
        },
        getSpVersion: function() {
            var uiVer;
            switch (_spPageContextInfo.webUIVersion) {
                case 12:
                    uiVer = "SharePoint 2007";
                    break;
                case 14:
                    uiVer = "SharePoint 2010";
                    break;
                case 15:
                    uiVer = "SharePoint 2013";
                    break;
                default:
                    uiVer = "(unknown)";
                    break;
            }
            return uiVer
        },
        getTimeToExecFxn: function(fnToEvaluate) {
            var performance = window.performance;
            var t0 = performance.now();
            fnToEvaluate();
            var t1 = performance.now();
            console.log("Call to doWork took " + (t1 - t0) + " milliseconds.");
            return (t1 - t0);
        },
        poll: function(fn, timeout, interval) {
            var endTime = Number(new Date()) + (timeout || 2000);
            interval = interval || 100;
            var checkCondition = function(resolve, reject) {
                var result = fn();
                if (result) {
                    resolve(result);
                } else if (Number(new Date()) < endTime) {
                    setTimeout(checkCondition, interval, resolve, reject);
                } else {
                    reject(new Error('timed out for ' + fn + ': ' + arguments));
                }
            };
            return new Promise(checkCondition);
            /* USAGE
                    poll(function() {
                            return document.getElementById('lightbox').offsetWidth > 0;
                    }, 2000, 150).then(function() {
                            // Polling done, now do something else!
                    }).catch(function() {
                            // Polling timed out, handle the error!
                    });
            */
        },
        debounce: function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },
        getabsoluteUrl: function() {
            var a;
            return function(url) {
                if (!a) a = document.createElement('a');
                a.href = url;
                return a.href;
            };
        }
        throttle: function(callback, limit) {
            var wait = false;
            return function() {
                if (!wait) {
                    callback.apply(null, arguments);
                    wait = true;
                    setTimeout(function() {
                        wait = false;
                    }, limit);
                }
            }
        },
        fireOnce: function(fn, context) {
            var result;
            return function() {
                if (fn) {
                    result = fn.apply(context || this, arguments);
                    fn = null;
                }
                return result;
            };
        },
        isNative: function(value) {
            var toString = Object.prototype.toString;
            var fnToString = Function.prototype.toString;
            var reHostCtor = /^\[object .+?Constructor\]$/;
            var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&').replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

            function isNative(value) {
                var type = typeof value;
                return type == 'function' ? reNative.test(fnToString.call(value)) : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
            }
        },
        logObjInfo: function(obj) {
            if (typeof obj === "object") {
                for (; obj != null; obj = Object.getPrototypeOf(obj)) {
                    var op = Object.getOwnPropertyNames(obj);
                    for (var i = 0; i < op.length; i++) {
                        var opDesc = Object.getOwnPropertyDescriptor(obj, op[i]);
                        console.info(this, op[i], opDesc);
                    }
                }
            } else {
                console.info(typeof obj, obj);
            }
        },
        logAllFxn: function() {
            var call = Function.prototype.call;
            Function.prototype.call = function() {
                console.log(this, arguments);
                return call.apply(this, arguments);
            };
        },
        traceFxn: function(func, methodName) {
            String.prototype.times = function(count) {
                return count < 1 ? '' : new Array(count + 1).join(this);
            };
            var indentCount = -4;
            var traceOn = function() {
                var startTime = +new Date;
                var indentString = " ".times(indentCount += 4);
                console.info(indentString + methodName + '(' + Array.prototype.slice.call(arguments).join(', ') + ')');
                console.info(Array.prototype.slice.call(arguments).join(', '));
                var result = func.apply(this, arguments);
                console.info(indentString + methodName, '-> ', result, "(", new Date - startTime, 'ms', ")");
                console.info(result);
                indentCount -= 4;
                return result;
            }
            traceOn.traceOff = func;
            for (var prop in func) {
                traceOn[prop] = func[prop];
            }
            console.log("tracing " + methodName);
            return traceOn;
        },
        traceAll: function(root, recurse) { //AVOID THIS ON window. RESULTS IN OVERSIZE STACK
            var nativeCodeEx = /\[native code\]/;
            var tracing = tracing || [];
            if ((root == window) || !((typeof root == 'object') || (typeof root == 'function'))) {
                return;
            }
            for (var key in root) {
                if ((root.hasOwnProperty(key)) && (root[key] != root)) {
                    var thisObj = root[key];
                    if (typeof thisObj == 'function') {
                        if ((this != root) && !thisObj.traceOff && !nativeCodeEx.test(thisObj)) {
                            root[key] = traceFxn(root[key], key);
                            tracing.push({
                                obj: root,
                                methodName: key
                            });
                        }
                    }
                    recurse && this.traceAll(thisObj, true);
                }
            }
        },
        untraceAll: function() {
            for (var i = 0; i < this.tracing.length; ++i) {
                var thisTracing = this.tracing[i];
                thisTracing.obj[thisTracing.methodName] =
                    thisTracing.obj[thisTracing.methodName].traceOff;
            }
            console.log("tracing disabled");
            tracer.tracing = [];
        },
        logThisFunction: function(func, name) {
            var functionLogger = {};
            functionLogger.log = true;
            functionLogger.getLoggableFunction = function(func, name) {
                return function() {
                    if (functionLogger.log) {
                        var logText = name + '(';
                        for (var i = 0; i < arguments.length; i++) {
                            if (i > 0) {
                                logText += ', ';
                            }
                            logText += arguments[i];
                        }
                        logText += ');';
                        console.log(logText);
                    }
                    return func.apply(this, arguments);
                };
            };
            functionLogger.addLoggingToNamespace = function(namespaceObject) {
                for (var name in namespaceObject) {
                    var potentialFunction = namespaceObject[name];
                    if (Object.prototype.toString.call(potentialFunction) === '[object Function]') {
                        namespaceObject[name] = functionLogger.getLoggableFunction(potentialFunction, name);
                    }
                }
            };
        },
        waitForNamespace: function(namespace, timeout, callback, interval) {
            var defaultInterval = interval >= 0 ? interval : 100; // try every 100 milliseconds (10 times per second) number chosen to enhance performance;
            if (window[namespace]) { // namespace exists
                callback();
            } else if (timeout <= 0) { // check if we reached the timeout
                return;
            } else {
                setTimeout(function() { // namespace does not exist, wait interval amount then try again;
                    waitFor(namespace, timeout - defaultInterval, callback, interval);
                }, defaultInterval);
            }
        },
        getCommentsFromElm: function(elm, blnDeep) {
            var blnDeep = (blnDeep || false);
            var jComments = $([]);
            elm.each(function(intI, objNode) {
                var objChildNode = objNode.firstChild;
                var strParentID = $(this).attr("id");
                while (objChildNode) {
                    if (objChildNode.nodeType === 8) {
                        console.log(objChildNode);
                        jComments = jComments.add("<div rel='" + strParentID + "'>" + objChildNode.nodeValue + "</div>");
                    } else if (blnDeep && (objChildNode.nodeType === 1)) {
                        jComments = jComments.add(getCommentsFromElm($(objChildNode), true));
                    }
                    objChildNode = objChildNode.nextSibling;
                }
            });
            return (jComments);
        },
        exists: function(namespace) {
            var tokens = namespace.split('.');
            return tokens.reduce(function(prev, curr) {
                return (typeof prev == "undefined") ? prev : prev[curr];
            }, window);
        },
        getAllMethods: function(object) {
            return Object.getOwnPropertyNames(object).filter(function(property) {
                return typeof object[property] == 'function';
            });
        },
        getInstanceMethodNames: function(obj, stop) {
            let array = [];
            let proto = Object.getPrototypeOf(obj);
            while (proto && proto !== stop) {
                Object.getOwnPropertyNames(proto)
                    .forEach(name => {
                        if (name !== 'constructor') {
                            if (hasMethod(proto, name)) {
                                array.push(name);
                            }
                        }
                    });
                proto = Object.getPrototypeOf(proto);
            }
            return array;
        },
        restrictInputChars: function(elm, e, restrictionType) {
            var resType = {
                'digitsOnly': /[1234567890]/g,
                'floatOnly': /[0-9\.]/g,
                'alphaOnly': /[A-Za-z]/g,
                'alphaMeta': /[A-Za-z\-_\s]/g,
                'alphaNumeric': /[A-Za-z\d\-_.\s]/g
            };
            if (!e) var e = window.event
            if (e.keyCode) code = e.keyCode;
            else if (e.which) code = e.which;
            var character = String.fromCharCode(code);
            if (code == 27) {
                this.blur();
                return false;
            }
            if (!e.ctrlKey && code != 9 && code != 8 && code != 36 && code != 37 && code != 38 && (code != 39 || (code == 39 && character == "'")) && code != 40) {
                if (character.match(resType[restrictionType])) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        spGridView: function() {
            SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
                SP.SOD.executeFunc('inplview', 'InitGridFromView', function() {
                    function gridViewPoll() {
                        if (typeof(g_SPGridInitInfo) != 'undefined') {
                            var viewId = decodeURIComponent($('table[summary="BW"]').attr('o:webquerysourcehref').split('View=')[1]);
                            if ("spgridcontainer_" + g_SPGridInitInfo[viewId]) {
                                var jsGridContainer = $get("spgridcontainer_" + g_SPGridInitInfo[viewId].jsInitObj.qualifier);
                                if (jsGridContainer) {
                                    var jsGrid = jsGridContainer.jsgrid || 'undefined';
                                    if (jsGrid != 'undefined') {
                                        jsGrid.AttachEvent(SP.JsGrid.EventType.OnPropertyChanged, function(e) {
                                            var currTme = ((Date.now()) - performance.timing.navigationStart);
                                            vntTmr = vntTmr == 0 ? currTme : vntTmr;
                                            var tmDiff = currTme - vntTmr;
                                            //console.log(tmDiff);
                                            if (tmDiff > 0 && tmDiff < 2000) {
                                                vntTmr = 0;
                                                if ((e.fieldKey).length < 4) {
                                                    //console.log(tmDiff);
                                                    //getFieldTotal(e.fieldKey);
                                                }
                                            } else {
                                                vntTmr = ((Date.now()) - performance.timing.navigationStart);
                                            }
                                        });
                                    } else {
                                        setTimeout(gridViewPoll, 500);
                                    }
                                } else {
                                    setTimeout(gridViewPoll, 500);
                                }
                            } else {
                                setTimeout(gridViewPoll, 500);
                            }
                        } else {
                            setTimeout(gridViewPoll, 500);
                        }
                    }
                    gridViewPoll();
                    Sys.Application.add_load(gridViewPoll);
                });
            });
        },
        dragAndDropCheckInFxn: function(_ctx) {
            var currUrl = window.location.protocol + '<url>/Forms/EditForm.aspx?ID=';
            var i = 0;
            var _newDndFxn = function() {
                var fileArr = _ctx.ListData.Row.map(function(e) {
                    var fileName = e.FileLeafRef;
                    fileId = e.ID;
                    fileType = e.DraftDocumentType
                    var editFormUrl = currUrl + fileId + '&Source=' + window.location.href;
                    if (fileType === 'Select One' || fileType === undefined) {
                        var options = SP.UI.$create_DialogOptions();
                        options.title = "Add File Metadata";
                        options.url = editFormUrl;
                        options.autoSize = true;
                        options.dialogReturnValueCallback = function(result) {
                            if (result == SP.UI.DialogResult.OK) {
                                _fileCheckIn(e.FileRef);
                            }
                            if (result == SP.UI.DialogResult.cancel) {
                                _newDndFxn();
                            }
                        };
                        SP.UI.ModalDialog.showModalDialog(options);
                    }
                    i++
                });
                $('div.ms-dlgOverlay').remove();
            };
            var _fileCheckIn = function(filePath) {
                var ctx = SP.ClientContext.get_current();
                var web = ctx.get_web();
                var file = web.getFileByServerRelativeUrl(filePath);
                var listItem = file.get_listItemAllFields();
                listItem.update();
                file.checkIn();
                ctx.executeQueryAsync(
                    function() {
                        window.location.reload();
                    },
                    function(sender, args) {
                        console.log(args);
                    }
                );
            };
            var UploadProgressFunc = function(percentDone, timeElapsed, state) {
                state.percentDone = percentDone;
                var messageType = ProgressMessage.EMPTY;
                switch (state.status) {
                    case 1:
                        messageType = ProgressMessage.VALIDATION;
                        break;
                    case 3:
                        messageType = ProgressMessage.UPLOADING;
                        break;
                    case 4:
                        messageType = ProgressMessage.UPLOADED;
                        setTimeout(_newDndFxn(), 2000);
                        break;
                    case 5:
                        messageType = ProgressMessage.CANCELLED;
                        break;
                }
                UpdateProgressBar(messageType, state);
            };
            return UploadProgressFunc;
        },
        idleTimer: function() {
            var t;
            //window.onload = resetTimer;
            //debugger;
            window.onmousemove = resetTimer; // catches mouse movements
            window.onmousedown = resetTimer; // catches mouse movements
            window.onclick = resetTimer; // catches mouse clicks
            window.onscroll = resetTimer; // catches scrolling
            window.onkeypress = resetTimer; //catches keyboard actions
            function logout() {
                //debugger;
                window.location.href = '/action/logout'; //Adapt to actual logout script
            }

            function reload() {
                //debugger;
                window.location = self.location.href; //Reloads the current page
            }

            function resetTimer() {
                //debugger;
                clearTimeout(t);
                t = setTimeout(logout, 1800000); // time is in milliseconds (1000 is 1 second)
                t = setTimeout(reload, 300000); // time is in milliseconds (1000 is 1 second)
            }
        },
        updateWebPartParameters: function() {
            EnsureScript("inplview", typeof InitAllClvps, null, true);
            InitAllClvps();
            for (var k in g_ctxDict) {
                if (g_ctxDict[k].ListTitle === 'User Information List') {
                    var wpCtx = window['ctx' + g_ctxDict[k].ctxId];
                    var webPart = $("#WebPart" + wpCtx.wpq);
                    window.location.href = window.location.href + "#InplviewHash" + wpCtx.clvp.wpid + "=FilterField1=Name&FilterValue1=" + _name;
                    break;
                }
            }
        },
        getDateDifference: function(datePart, fromDate, toDate) {
            datePart = datePart.toLowerCase();
            var diff = toDate - fromDate;
            var divideBy = {
                w: 604800000,
                d: 86400000,
                h: 3600000,
                n: 60000,
                s: 1000
            };
            return Math.floor(diff / divideBy[datePart]);
        },
        skdDownloadAllAttachments: function(n) {
            var fileLinks = $('#idAttachmentsTable tr td.ms-vb a');
            //console.log(fileLinks);
            function downloadFile(n) {
                if (n >= fileLinks.length) {
                    return false;
                }
                var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
                var isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
                //iOS devices do not support downloading
                if (/(iP)/g.test(navigator.userAgent)) {
                    alert('Your device does not support files downloading. Please try again in desktop browser.');
                    return false;
                }
                var _url = $(fileLinks[n]).attr('href');
                var _title = $(fileLinks[n]).text();
                if (isChrome || isSafari) {
                    var link = document.createElement('a');
                    link.href = _spPageContextInfo.webAbsoluteUrl + '/_layouts/download.aspx?SourceUrl=' + _spPageContextInfo.siteAbsoluteUrl + _url;
                    link.setAttribute("target", "_blank");
                    link.download = _title;
                    link.style.display = "none";
                    document.body.appendChild(link);
                    if (document.createEvent) {
                        var e = document.createEvent('MouseEvents');
                        e.initEvent('click', true, true);
                        link.dispatchEvent(e);
                        return true;
                    }
                }
                if (_url.indexOf('?') === -1) {
                    _url += '?download';
                }
                window.open(_spPageContextInfo.webAbsoluteUrl + '/_layouts/download.aspx?SourceUrl=' + _spPageContextInfo.siteAbsoluteUrl + _url, '_blank');
                return true;
            }
            var isDownloaded = downloadFile(n + 1);
            isDownloaded ? setTimeout(function() {
                skdDownloadAllAttachments(n + 1);
            }, 1000) : '';
        }
    };
//====================================================================================================================JSOM
    SkdSpJs.Jsom = {
        getCtx: function(siteUrl) {
            return siteUrl ? (siteUrl != _spPageContextInfo.webAbsoluteUrl ? new SP.ClientContext(siteUrl) : SP.ClientContext.get_current()) : SP.ClientContext.get_current();
        },
        getWeb: function(siteUrl) {
            var _ctx = SP.ClientContext.get_current();
            var _web = _ctx.get_web();
            _ctx.load(_web);
            _ctx.executeQueryAsync(
                Function.createDelegate(this, this.onQuerySucceeded),
                Function.createDelegate(this, this.onQueryFailed)
            );
        },
        getAllLists: function(siteUrl) {
            var _ctx = SP.ClientContext.get_current();
            var _web = _ctx.get_web();
            var _lists = _web.get_lists();
            _ctx.load(_lists);
            _ctx.executeQueryAsync(
                Function.createDelegate(this, this.onQuerySucceeded),
                Function.createDelegate(this, this.onQueryFailed)
            );
        },
        getAllWebsInSC: function(propArr, fnSuccess, siteUrl) { //AVOID FOR LARGE SC
            var result = [],
                level = 0;
            var ctx = SP.ClientContext.get_current();
            var rootWeb = ctx.get_site().get_rootWeb();
            ctx.load(rootWeb, propArr);
            result.push(rootWeb);
            var colPropertiesToRetrieve = String.format('Include({0})', propArr.join(','));
            var enumWebsInner = function(web, result, fnSuccess) {
                level++;
                var ctx = web.get_context();
                var webs = web.get_webs();
                ctx.load(webs, colPropertiesToRetrieve);
                ctx.executeQueryAsync(
                    function() {
                        for (var i = 0; i < webs.get_count(); i++) {
                            var web = webs.getItemAtIndex(i);
                            result.push(web);
                            enumWebsInner(web, result, fnSuccess, error);
                        }
                        level--;
                        if (level == 0 && fnSuccess)
                            fnSuccess(result);
                    },
                    function(sender, args) {
                        console.log('Error: ' + args);
                    }
                );
            };
            enumWebsInner(rootWeb, result, fnSuccess);
        },
        getAllLists: function(fnSuccess, siteUrl) {
            var _ctx = SP.ClientContext.get_current();
            var _lists = _ctx.get_web().get_lists();
            _ctx.load(_lists);
            (_sp.ctx).executeQueryAsync(
                function() {
                    fnSuccess(_sp.lists);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        getListByName: function(listTitle, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var list = (_sp.lists).getByTitle(listTitle);
            (_sp.ctx).load(list);
            (_sp.ctx).executeQueryAsync(
                function() {
                    fnSuccess(list);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        getListById: function(listId, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var list = (_sp.lists).getById(listId);
            (_sp.ctx).load(list);
            (_sp.ctx).executeQueryAsync(
                function() {
                    fnSuccess(list);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        getListViews: function() {
            //Get the client context,web and list object
            var clientContext = new SP.ClientContext();
            var oWeb = clientContext.get_web();
            var oList = oWeb.get_lists().getByTitle('Products');
            //Get the list view and load it to client context and execute the batch
            oListViews = oList.get_views();
            clientContext.load(oListViews);
            clientContext.executeQueryAsync(QuerySuccess, QueryFailure);
        },
        createList: function(listTitle, templateType, propObj, fnSuccess, siteUrl) { //SETABLE PROPERTRIES: customSchemaXml, dataSourceProperties, description, quickLaunchOption, documentTemplateType, templateFeatureId, typeId, url
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var lists = _sp.lists
            var lci = new SP.ListCreationInformation();
            lci.set_title(listTitle);
            lci.set_templateType(SP.ListTemplateType[templateType]);
            if (propObj) {
                for (var key in propObj) {
                    if (propObj.hasOwnProperty(key)) {
                        lci[key](propObj[key]);
                    }
                }
            }
            var newList = lists.add(lci);
            ctx.load(newList);
            ctx.executeQueryAsync(
                function(newList) {
                    fnSuccess(newList);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        updateDefaultView: function() {
            var ctx = SP.ClientContext.get_current();
            var lists = ctx.get_lists();
            var list = listCollection.getByTitle("yourListTitle");
            var defaultView = list.get_defaultView();
            var defaultViewFields = defaultView.get_viewFields();
            defaultViewFields.add("Title");
            defaultViewFields.add("Modified");
            defaultViewFields.add("NewField");
            defaultViewFields.add("Attachments");
            defaultViewFields.add("Status");
            defaultView.update();
            viewContext.executeQueryAsync();
        },
        createListView: function() {
            var listCollection = web.get_lists();
            list = listCollection.getByTitle("Test");
            viewCollection = list.get_views();
            viewContext.load(viewCollection);
            var createView = new SP.ViewCreationInformation();
            createView.set_title("TestView");
            var viewFields = ["Column1", "Column2"];
            createView.set_viewFields(viewFields);
            //optional
            //
            var camlQuery = new SP.CamlQuery();
            var query = "<Where><Eq><FieldRef Name='Column1' /><Value Type='Text'>2</Value></Eq></Where>";
            camlQuery.set_viewXml(query);
            createView.set_query(camlQuery);
            //
            createView.set_rowLimit(1);
            //
            createView.set_viewTypeKind(2048); //none	 0;    html	 1;    grid	 2048;    calendar	 524288;    recurrence	 8193;    chart	 131072;    gantt	 67108864;
            ////optional-end
            viewCollection.add(createView);
            viewContext.load(viewCollection);
            viewContext.executeQueryAsync(ViewCreated, onFail);
        },
        updateViewJSOM: function() {
            viewContext = SP.ClientContext.get_current();
            var web = viewContext.get_web();
            var listCollection = web.get_lists();
            list = listCollection.getByTitle("Test");
            viewCollection = list.get_views();
            view = viewCollection.getByTitle("GridView");
            var camlQuery = new SP.CamlQuery();
            var query = "<Where><Eq><FieldRef Name='Column1' /><Value Type='Text'>1</Value></Eq></Where>";
            camlQuery.set_viewXml(query);
            view.set_viewQuery(camlQuery);
            view.set_rowLimit(2);
            view.update();
            viewContext.load(view);
            viewContext.executeQueryAsync(ViewModified,
                function onFail(sender, args) {
                    console.log(args.get_message());
                });
        },
        deleteViewJSOM: function() {
            viewContext = SP.ClientContext.get_current();
            var web = viewContext.get_web();
            var listCollection = web.get_lists();
            list = listCollection.getByTitle("Test");
            viewCollection = list.get_views();
            view = viewCollection.getByTitle("GridView");
            view.deleteObject();
            viewContext.executeQueryAsync(ViewDeleted,
                function onFail(sender, args) {
                    console.log(args.get_message());
                });
        },
        getAllFields: function(listName, viewName) {
            var ctx = new SP.ClientContext(_spPageContextInfo.webServerRelativeUrl);
            var list = ctx.get_web().get_lists().getByTitle(listName);
            var fieldCollection = list.get_fields();
            ctx.load(fieldCollection);
            var view = list.get_views().getByTitle(viewName);
            var viewFieldCollection = view.get_viewFields();
            ctx.load(viewFieldCollection);
            ctx.executeQueryAsync(
                function() {
                    var cont = 0;
                    var fields = 'SP.FieldCollection from list.get_fields()'
                    fields += 'Internal Name - Static Name - Title\n';
                    fields += '--------------------------- \n';
                    var listEnumerator = fieldCollection.getEnumerator();
                    while (listEnumerator.moveNext()) {
                        fields += listEnumerator.get_current().get_internalName() + ' - ' + listEnumerator.get_current().get_staticName() + ' - ' + listEnumerator.get_current().get_title() + ";\n "; //
                        cont++;
                    }
                    console.log(fields + '-------------------------- \n Number of Fields: ' + cont);
                    var cont = 0;
                    var viewfields = '\nSP.ViewFieldCollection from view.get_viewFields() \n';
                    viewfields += 'Internal Name \n';
                    viewfields += '--------------------------- \n';
                    var listEnumerator = viewFieldCollection.getEnumerator();
                    while (listEnumerator.moveNext()) {
                        viewfields += listEnumerator.get_current() + "\n";
                        cont++;
                    }
                    console.log(viewfields + '-------------------------- \n Number of Fields: ' + cont);
                },
                function(sender, args) {
                    console.log('Request collListItem failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                }
            );
        },
        createField: function(listName, siteUrl) {
            var clientContext = new SP.ClientContext(siteUrl);
            var oList = clientContext.get_web().get_lists().getByTitle(listName);
            var fieldSchema = (
                '<Field Type="Note" ' +
                'Name="fName" ' +
                'StaticName="fName" ' +
                'DisplayName = "fName" ' +
                'NumLines="10" ' +
                'Required="FALSE" ' +
                'Group="SKD Columns">' +
                '</Field>'
            );
            this.oField = oList.get_fields().addFieldAsXml(
                fieldSchema,
                true, //default view
                (SP.AddFieldOptions.addToDefaultContentType & SP.AddFieldOptions.addFieldCheckDisplayName) //https://msdn.microsoft.com/en-us/library/office/ee553410.aspx
            );
            var fieldNumber = clientContext.castTo(oField, SP.FieldNumber);
            fieldNumber.set_maximumValue(100);
            fieldNumber.set_minimumValue(35);
            fieldNumber.update();
            clientContext.load(oField);
            clientContext.executeQueryAsync(
                function() {
                    fnSuccess(oField);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        createFields: function() {
            var clientContext = new SP.ClientContext.get_current();
            var oWebsite = clientContext.get_web();
            oList = clientContext.get_web().get_lists().getByTitle('CustomList');
            var fldCollection = oList.get_fields();
            var f1 = clientContext.castTo(
                fldCollection.addFieldAsXml(
                    '<Field Type="Text" DisplayName="NewField" Name="NewField" />',
                    true,
                    SP.AddFieldOptions.addToDefaultContentType
                ),
                SP.FieldText //SP.FieldType: https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spfieldtype.aspx
            );
            f1.set_title("CurrentDate");
            f1.set_description("sample desc");
            f1.update();
            var f2 = clientContext.castTo(
                oList.get_fields().addFieldAsXml(
                    '<Field Type="Choice"  DisplayName="choice" Name="fldchoice" />',
                    true,
                    SP.AddFieldOptions.addToDefaultContentType
                ),
                SP.FieldChoice
            );
            var choices = Array("Approved", "Rejected", "Progress");
            f2.set_choices(choices);
            f2.update();
            clientContext.executeQueryAsync(
                function onQuerySucceeded() {
                    alert("List Field Updated");
                },
                function onQueryFailed(sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                }
            );
        },
        createSiteLookupColumn: function() {
            clientContext = new SP.ClientContext.get_current();
            oWebSite = clientContext.get_web();
            //Lookup List
            oList = oWebSite.get_lists().getByTitle('Countries');
            clientContext.load(oList);
            clientContext.load(oWebSite);
            clientContext.executeQueryAsync(
                function() {
                    var fieldXml = "<Field Name='Country' DisplayName='Country' Type='Lookup' Required='FALSE' Group='Operations'/>";
                    var lookupField = oWebSite.get_fields().addFieldAsXml(fieldXml, true, SP.AddFieldOptions.addFieldCheckDisplayName);
                    var fieldLookup = clientContext.castTo(lookupField, SP.FieldLookup);
                    fieldLookup.set_lookupList(oList.get_id());
                    fieldLookup.set_lookupField("Title");
                    fieldLookup.update();
                    clientContext.executeQueryAsync(function() {
                        alert('Field Added');
                    }, function(sender, args) {
                        alert(args.get_message() + '\n' + args.get_stackTrace());
                    });
                },
                function(sender, args) {
                    alert(args.get_message() + '\n' + args.get_stackTrace());
                }
            );
        },
        reorderFieldsInView: function(colName) {
            var ctx = SP.ClientContext.get_current();
            var list = ctx.get_web().get_lists().getByTitle(_u.config.List);
            var view = list.get_views().getByTitle(_u.config.View);
            var vFields = view.get_viewFields();
            ctx.load(view);
            ctx.load(vFields);
            ctx.executeQueryAsync(
                function(sender, args) {
                    var mvIndx = vFields.get_count() > 2 ? vFields.get_count() - 2 : 1;
                    vFields.moveFieldTo(colName, mvIndx);
                    view.update();
                    ctx.executeQueryAsync(
                        function(sender, args) {
                            console.log(view);
                            window.location.reload();
                        },
                        function(sender, args) {
                            debugger;
                            alert('Error! Column was created but was not added to the ' + _u.config.View + ' view.');
                        }
                    );
                },
                function(sender, args) {
                    debugger;
                    alert('Error! Column was created but was not added to the ' + _u.config.View + ' view.');
                }
            );
        },
        getItemById: function(listTitle, itemId, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var item = list.getItemById(id);
            ctx.load(item);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(list);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        getAllItems: function(listTitle, caml, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var camlQuery = SP.CamlQuery.createAllFoldersQuery();
            camlQuery.set_viewXml(caml);
            var items = list.getItems(camlQuery);
            ctx.load(items);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(items);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        getItems: function(listTitle, caml, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml(caml);
            var items = list.getItems(camlQuery);
            ctx.load(items);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(items);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        createItem: function(listTitle, propObj, fnSuccess, siteUrl) { //EXAMPLE: propObj={field:'value'};
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var item = list.addItem(new SP.ListItemCreationInformation());
            for (var key in propObj) {
                if (propObj.hasOwnProperty(key)) {
                    item[keys] = propObj[keys];
                }
            }
            ctx.load(item);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(item);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        createListItemfunction: function() { //with all field examples
            function getMultiTax() {
                var terms = new Array();
                terms.push("-1;#Mamo|10d05b55-6ae5-413b-9fe6-ff11b9b5767c");
                terms.push("-1;#Popo|178888b0-7942-45bb-b3f1-2f38d476e3db");
                return terms.join(";#");
            }
            var clientContext = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
            var oList = clientContext.get_web().get_lists().getByTitle('TestList');
            var itemCreateInfo = new SP.ListItemCreationInformation();
            this.oListItem = oList.addItem(itemCreateInfo);
            //Single line of text
            oListItem.set_item('Title', 'My New Item!');
            //Single Choice
            oListItem.set_item('PetkaChoiceDrop', 'Enter Choice #1');
            //Multi Choice
            var petkaChoiceMultiArray = new Array("Enter Choice #1", "Enter Choice #2");
            oListItem.set_item('PetkaChoiceMulti', petkaChoiceMultiArray);
            //Single Lookup
            var PetkaLookupSingle = new SP.FieldLookupValue();
            PetkaLookupSingle.set_lookupId(2);
            oListItem.set_item('PetkaLookup', PetkaLookupSingle);
            //Multi Lookup
            var lookupsIds = [1, 2];
            var lookups = [];
            for (var ii in lookupsIds) {
                var lookupValue = new SP.FieldLookupValue();
                lookupValue.set_lookupId(lookupsIds[ii]);
                lookups.push(lookupValue);
            }
            oListItem.set_item('PetkaLookupMulti', lookups);
            //Yes=1 / No=0
            oListItem.set_item('PetkaYesNo', 1);
            // Single Person
            var singleUser = SP.FieldUserValue.fromUser('Peter Dotsenko');
            oListItem.set_item('PetkaPersonSingle', singleUser);
            //Multi Person
            var petkaUserMultiArray = new Array("peterd@domain.com", "Peter Dotsenko", "domain\\peterd");
            var lookups = [];
            for (var ii in petkaUserMultiArray) {
                var lookupValue = SP.FieldUserValue.fromUser(petkaUserMultiArray[ii]);
                lookups.push(lookupValue);
            }
            oListItem.set_item('PetkaPersonMulti', lookups);
            //Managed Multi
            var field = oList.get_fields().getByInternalNameOrTitle("PetkaManagedMulti");
            var taxField = clientContext.castTo(field, SP.Taxonomy.TaxonomyField);
            var terms = new SP.Taxonomy.TaxonomyFieldValueCollection(clientContext, getMultiTax(), taxField);
            taxField.setFieldValueByValueCollection(oListItem, terms);
            //Managed Single
            var field = oList.get_fields().getByInternalNameOrTitle("PetkaManagedSingle");
            var taxField = clientContext.castTo(field, SP.Taxonomy.TaxonomyField);
            var taxonomySingle = new SP.Taxonomy.TaxonomyFieldValue();
            taxonomySingle.set_label("Mamo");
            taxonomySingle.set_termGuid("10d05b55-6ae5-413b-9fe6-ff11b9b5767c");
            taxonomySingle.set_wssId(-1);
            taxField.setFieldValueByValue(oListItem, taxonomySingle);
            //Hyperlink or Picture
            var hyperLink = new SP.FieldUrlValue();
            hyperLink.set_url("http://cnn.com");
            hyperLink.set_description("CNN");
            oListItem.set_item('PetkaHyperLink', hyperLink);
            //Currency
            oListItem.set_item('PetkaCurrency', '100');
            //DateTime
            oListItem.set_item('PetkaDateTime', '3/14/2014');
            //MultiLine text
            oListItem.set_item('PetkaMultiText', '<p><strong>Hello!</strong></p>');
            oListItem.update();
            clientContext.load(oListItem);
            clientContext.executeQueryAsync(
                Function.createDelegate(this, this.onQuerySucceeded),
                Function.createDelegate(this, this.onQueryFailed)
            );
            /*
                    function onQuerySucceeded() {
                            SP.UI.Notify.addNotification('Item created: ' + oListItem.get_id());
                    }
                    function onQueryFailed(sender, args) {
                            console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                    }
            */
        },
        updateItem: function(listTitle, itemId, propObj, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var itemToUpdate = list.getItemById(id);
            for (var key in propObj) {
                if (propObj.hasOwnProperty(key)) {
                    item[keys] = propObj[keys];
                }
            }
            itemToUpdate.Update();
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(list);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        deleteItem: function(listTitle, itemId, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var itemToDelete = list.getByTitle(itemId);
            itemToDelete.deleteObject();
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(list);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        createFile: function(listTitle, filePath, fileData, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var fci = new SP.FileCreationInformation();
            fci.set_url(filePath);
            fci.set_content(new SP.Base64EncodedByteArray());
            fileContent = fileData;
            for (var i = 0; i < fileContent.length; i++) {
                fci.get_content().append(fileContent.charCodeAt(i));
            }
            var newFile = list.get_rootFolder().get_files().add(fci);
            ctx.load(newFile);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(newFile);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        readFile: function(filePath, fnSuccess, siteUrl) {
            var _sp = spWeb(siteUrl);
            var ctx = _sp.ctx;
            var web = _sp.web;
            ctx.load(web);
            ctx.executeQueryAsync(
                function() {
                    jQuery.ajax({
                            url: filePath,
                            type: "GET"
                        })
                        .done(fnSuccess(data))
                        .error(
                            function(data) {
                                console.log('Error: ' + data);
                            }
                        );
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        getAllCheckoutFiles: function(listName) {
            var caml = (
                '<View>' +
                '<Query>' +
                '<Where>' +
                '<Geq>' +
                '<FieldRef Name="CheckoutUser" LookupId="TRUE" />' +
                '<Value Type="int">0</Value>' +
                '</Geq>' +
                '</Where>' +
                '</Query>' +
                '</View>'
            );
            getItems = function() {
                var ctx = SP.ClientContext.get_current();
                var web = ctx.get_web()
                var list = web.get_lists().getByTitle(listName);
                var camlQuery = new SP.CamlQuery();
                camlQuery.set_viewXml(caml);
                var items = list.getItems(camlQuery);
                ctx.load(items);
                ctx.executeQueryAsync(
                    function() {
                        console.log(items);
                    },
                    function(sender, args) {
                        console.log('Error: ' + args.get_message());
                    }
                );
            };
            getItems();
        },
        checkInFile: function(propObj, fnSuccess, siteUrl) {
            var _sp = spWeb(siteUrl);
            var ctx = _sp.ctx;
            var web = _sp.web;
            var page = web.getFileByServerRelativeUrl(window.location.pathname);
            var item = page.get_listItemAllFields();
            if (propObj) { //listItem.set_item('PublishingPageContent', '{string with curly braces}');
                for (var key in propObj) {
                    if (propObj.hasOwnProperty(key)) {
                        item.set_item([key], propObj[key]);
                    }
                }
            }
            item.update();
            page.checkIn();
            page.publish();
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(list);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        fileCheckIn: function(FileRef) {
            var ctx = SP.ClientContext.get_current();
            var web = ctx.get_web();
            var file = web.getFileByServerRelativeUrl(FileRef);
            var listItem = file.get_listItemAllFields();
            listItem.update();
            file.checkIn();
            ctx.executeQueryAsync(
                function() {
                    window.location.reload();
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        checkOutFile: function(listTitle, itemId, fnSuccess, siteUrl) {
            var ctx = spCtx(siteUrl);
            var file = spLists(ctx).getByTitle(listTitle).getItemById(itemId).get_file();
            file.checkOut();
            ctx.load(file)
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(file);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        updateFile: function(filePath, fileData, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var fci = new SP.FileCreationInformation();
            fci.set_url(filePath);
            fci.set_content(new SP.Base64EncodedByteArray());
            fci.set_overwrite(true);
            fileContent = fileData;
            for (var i = 0; i < fileContent.length; i++) {
                fci.get_content().append(fileContent.charCodeAt(i));
            }
            var existingFile = list.get_rootFolder().get_files().add(fci);
            ctx.load(existingFile);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(this);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        deleteFile: function(filePath, fnSuccess, siteUrl) {
            var _sp = spWeb(siteUrl);
            var ctx = _sp.ctx;
            var web = _sp.web;
            ctx.load(web);
            ctx.executeQueryAsync(
                function() {
                    var fileToDelete = web.getFileByServerRelativeUrl(filePath);
                    fileToDelete.deleteObject();
                    ctx.executeQueryAsync(
                        function() {
                            fnSuccess(this);
                        },
                        function(sender, args) {
                            console.log('Error: ' + args);
                        }
                    );
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        likeItem: function(listId, itemId, isLiked, fnSuccess, siteUrl) {
            scriptLoader(this.reputation.scripts, this.reputation.global);
            var ctx = spCtx(siteUrl);
            Microsoft.Office.Server.ReputationModel.Reputation.setLike(ctx, listId, itemId, isLiked, fnSuccess);
            ctx.executeQueryAsync(
                function(sender, args) {
                    fnSuccess(args);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        rateItem: function(listId, itemId, rating, fnSuccess, siteUrl) {
            scriptLoader(this.reputation.scripts, this.reputation.global);
            var ctx = spCtx(siteUrl);
            Microsoft.Office.Server.ReputationModel.Reputation.setRating(ctx, listId, itemId, rating, fnSuccess);
            ctx.executeQueryAsync(
                function(sender, args) {
                    fnSuccess(args);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        isAlreadyFollowed: function(socialActorType, fnSuccess, siteUrl) { //socialActorTypes --> 0:none, 1:users, 2:documents, 4:sites, 8:tags, 268435456:excludeContentWithoutFeeds, 15:all
            scriptLoader(this.userProfiles.scripts, this.userProfiles.global);
            var ctx = spCtx(siteUrl);
            var socialManager = new SP.Social.SocialFollowingManager(ctx);
            socialActor = new SP.Social.SocialActorInfo();
            var siteContentUrl = window.location;
            socialActor.set_contentUri(siteContentUrl);
            socialActor.set_actorType(socialActorType);
            var result = socialManager.isFollowed(socialActor);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(result);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        follow: function(socialActorType, fnSuccess, siteUrl) {
            scriptLoader(this.userProfiles.scripts, this.userProfiles.global);
            var ctx = spCtx(siteUrl);
            var socialManager = new SP.Social.SocialFollowingManager(ctx);
            var siteContentUrl = window.location;
            var siteActorInfo = new SP.Social.SocialActorInfo();
            siteActorInfo.set_contentUri(siteContentUrl);
            siteActorInfo.set_actorType(socialActorType);
            socialManager.follow(siteActorInfo);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(this);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        stopFollowing: function(socialActorType, fnSuccess, siteUrl) {
            scriptLoader(this.userProfiles.scripts, this.userProfiles.global);
            var ctx = spCtx(siteUrl);
            var socialManager = new SP.Social.SocialFollowingManager(ctx);
            var siteContentUrl = window.location;
            var siteActorInfo = new SP.Social.SocialActorInfo();
            siteActorInfo.set_contentUri(siteContentUrl);
            siteActorInfo.set_actorType(socialActorType);
            socialManager.stopFollowing(siteActorInfo);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(this);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        getFollowers: function(fnSuccess, siteUrl) {
            scriptLoader(this.userProfiles.scripts, this.userProfiles.global);
            var ctx = spCtx(siteUrl);
            var socialManager = new SP.Social.SocialFollowingManager(ctx);
            var followersArray = socialManager.getFollowers();
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(followersArray);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        getFollowed: function(fnSuccess, siteUrl) {
            scriptLoader(this.userProfiles.scripts, this.userProfiles.global);
            var ctx = spCtx(siteUrl);
            var socialManager = new SP.Social.SocialFollowingManager(ctx);
            var followedArray = socialManager.GetFollowed(4);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(followersArray);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        getFollowedCount: function(fnSuccess, siteUrl) {
            scriptLoader(this.userProfiles.scripts, this.userProfiles.global);
            var ctx = spCtx(siteUrl);
            var socialManager = new SP.Social.SocialFollowingManager(ctx);
            var count = socialManager.getFollowedCount(types);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(count);
                },
                function(sender, args) {
                    console.log('Error: ' + args.get_message());
                }
            );
        },
        getFields: function(listTitle, fieldsArray, fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            var ctx = _sp.ctx;
            var list = (_sp.lists).getByTitle(listTitle);
            var fields = list.get_fields();
            if (fieldsArray) {
                ctx.load(fields, 'Include(' + fieldsArray.join(', ') + ')');
            } else {
                ctx.load(fields);
            }
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(fields);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        checkCurrUserPerm: function(permLevel, fnSuccess, siteUrl) {
            var _sp = spWeb(siteUrl);
            var ctx = _sp.ctx;
            var web = _sp.web;
            ctx.load(web);
            ctx.load(web, 'EffectiveBasePermissions');
            ctx.executeQueryAsync(
                function() {
                    var results = web.get_effectiveBasePermissions().has(permLevel);
                    fnSuccess(results);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        getCurrentUserInfo: function() {
            var ctx = SP.ClientContext.get_current();
            var pplMngr = new SP.UserProfiles.PeopleManager(ctx);
            var userProp = pplMngr.getMyProperties();
            ctx.load(userProp);
            ctx.executeQueryAsync(
                function() {
                    console.log(userProp);
                },
                function() {
                    console.log(":(");
                }
            );
        };
        getCurrUserPerm: function(fnSuccess, siteUrl) {
            var ctx = spCtx(siteUrl);
            var user = ctx.get_web().get_currentUser();
            ctx.load(user);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(user);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        createGroupAddToRole: function(siteUrl) {
            var _ctx = new SP.ClientContext(siteUrl);
            var _web = _ctx.get_web();
            var _grpCreationInfo = new SP.GroupCreationInformation();
            _grpCreationInfo.set_title('Concrete Structure Core');
            _grpCreationInfo.set_description('Core Group Members');
            var _grp = _web.get_siteGroups().add(_grpCreationInfo);
            var _collRoleDefinitionBinding = SP.RoleDefinitionBindingCollection.newObject(_ctx);
            var _roleDefinition = _web.get_roleDefinitions().getByType(SP.RoleType.contributor);
            _collRoleDefinitionBinding.add(_roleDefinition);
            var _collRollAssignment = _web.get_roleAssignments();
            _collRollAssignment.add(_grp, _collRoleDefinitionBinding);
            _ctx.load(_grp, 'Title');
            _ctx.load(_roleDefinition, 'Name');
            _ctx.executeQueryAsync(
                function onQuerySucceeded() {
                    var roleInfo = _grp.get_title() + ' created and assigned to ' + _roleDefinition.get_name();
                    console.log(roleInfo);
                },
                function onQueryFailed(sender, args) {
                    console.log(sender, args);
                }
            );
        },
        taxCtx: function() {
            scriptLoader(this.taxonomy.scripts, this.taxonomy.global);
            var _ctx = spCtx(siteUrl);
            var _taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(_ctx);
            return {
                ctx: _ctx,
                taxSession: _taxSession
            };
        },
        createTermGroup: function(termStoreName, newGroupName, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStores = taxSession.get_termStores();
            var termStore = termStores.getByName(termStoreName);
            var newGroup = termStore.createGroup(newGroupName);
            ctx.load(newGroup);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(newGroup);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        createTermSet: function(termStoreName, termGroupGuid, newSetName, newSetGuid, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStores = taxSession.get_termStores();
            var termStore = termStores.getByName(termStoreName);
            var termGroup = termStore.getGroup(termGroupGuid);
            var newTermSet = termGroup.createTermSet(newSetName, newSetGuid, 1033);
            ctx.load(newTermSet);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(newTermSet);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        createTerm: function(termStoreName, termSetGuid, newTermName, newTermGuid, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStores = taxSession.get_termStores();
            var termStore = termStores.getByName(termStoreName);
            var termSet = termStore.getTermSet(termSetGuid);
            var newTerm = termSet.createTerm(newTermName, 1033, newTermGuid);
            ctx.load(newTerm);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(newTerm);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        createSubTerm: function(termStoreName, TermSetGuid, TermGuid, termLabel) {
            var _ctx = SP.ClientContext.get_current();
            var taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(_ctx);
            var termStores = taxSession.get_termStores();
            var termStore = termStores.getByName(termStoreName);
            var termSet = termStore.getTermSet(TermSetGuid);
            var parentTerm = termSet.getTerm(TermGuid);
            var newTerm = parentTerm.createTerm("Term Label", 1033, generateGuid.toString()); // termObj
            _ctx.load(newTerm);
            _ctx.executeQueryAsync(
                function() {
                    alert("Term Created: " + newTerm.get_name());
                },
                function(sender, args) {
                    console.log(args.get_message());
                }
            );
        },
        getAllTermStores: function(fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStores = taxSession.get_termStores();
            ctx.load(termStores);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(termStores);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        getDefaultTermStore: function(fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var defTermStores = taxSession.getDefaultSiteCollectionTermStore();
            ctx.load(defTermStores);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(defTermStores);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        getTermStore: function(termStoreName, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStore = taxSession.get_termStores().getByName(termStoreName);
            ctx.load(termStore);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(termStore);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        getTermGroups: function(termStoreName, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStore = taxSession.get_termStores().getByName(termStoreName);
            var termGroups = termStore.get_groups();
            ctx.load(termGroups);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(termGroups);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        getTermSets: function(termStoreName, termGroupGuid, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStore = taxSession.get_termStores().getByName(termStoreName);
            var termSets = termStore.getGroup(termGroupGuid).get_termSets();
            ctx.load(termSets);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(termSets);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        getChildTerms: function() {
            var context = SP.ClientContext.get_current();
            var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
            var termStore = session.getDefaultSiteCollectionTermStore();
            var parentTermId = '7c43575c-282d-41a3-b20a-f6629bdc4808'; //parent Term Id
            var parentTerm = termStore.getTerm(parentTermId);
            var terms = parentTerm.get_terms(); //load child Terms
            context.load(terms);
            context.executeQueryAsync(
                function() {
                    //print child Terms
                    for (var i = 0; i < terms.get_count(); i++) {
                        var term = terms.getItemAtIndex(i);
                        console.log(term.get_name());
                    }
                },
                function(sender, args) {
                    console.log(args.get_message());
                }
            );
        },
        getTerms: function(termStoreName, termSetGuid, fnSuccess, siteUrl) {
            var _ctx = SP.ClientContext.get_current();
            var _sp = taxCtx(siteUrl);
            var taxSession = _sp.taxSession;
            var termStores = taxSession.get_termStores();
            var termStore = termStores.getByName(termStorName);
            var termSet = termStore.getTermSet(termSetGuid);
            var terms = termSet.getAllTerms();
            ctx.load(terms);
            ctx.executeQueryAsync(
                function() {
                    var termsArr = [];
                    var termsEnum = terms.getEnumerator();
                    while (termsEnum.moveNext()) {
                        var currentTerm = termsEnum.get_current();
                        if (currentTerm.get_termsCount() > 0) {
                            function getChildren(currTerm) {
                                var terms = currTerm.get_terms();
                                ctx.load(terms);
                                ctx.executeQueryAsync(
                                    function() {
                                        var termsEnum = terms.getEnumerator();
                                        while (termsEnum.moveNext()) {
                                            var newCurrentTerm = termsEnum.get_current();
                                            if (newCurrentTerm.get_termsCount() > 0) {
                                                getChildren(newCurrentTerm);
                                            } else {
                                                termsArr.push(newCurrentTerm);
                                            }
                                        }
                                    },
                                    function(sender, args) {
                                        console.log(args);
                                    }
                                );
                            }
                            getChildren(currentTerm);
                        } else {
                            termsArr.push(currentTerm);
                        }
                    }
                    fnSuccess(termsArr);
                },
                function(sender, args) {
                    console.log(args);
                }
            );
        },
        //publishFile('/ks/trgs/_catalogs/masterpage/Display Templates/Content Web Parts/Custom/Item_custom_discussions.html',  'Master Page Gallery');
        publishFile: function(relativeFilerUrl, listName) {
            var _ctx = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
            var oWeb = _ctx.get_web();
            var oList = oWeb.get_lists().getByTitle(listName);
            var oFile = oWeb.getFileByServerRelativeUrl(relativeFileUrl);
            oFile.publish();
            _ctx.load(oFile);
            _ctx.executeQueryAsync(
                function() {
                    var majorVersion = oFile.get_majorVersion();
                    console.log("Major Version - " + majorVersion);
                },
                function(sender, args) {
                    console.log('Request failed - ' + args.get_message());
                }
            );
        },
        publishFilesInFolder: function(relativeFolderUrl, listName) {
            var _ctx = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
            var oWeb = _ctx.get_web();
            var oList = oWeb.get_lists().getByTitle(listName);
            var oFiles = oWeb.getFolderByServerRelativeUrl(relativeFolderUrl).get_files();
            _ctx.load(oFiles);
            _ctx.executeQueryAsync(
                function() {
                    var enm = oFiles.getEnumerator();
                    while (enm.moveNext()) {
                        var currFile = enm.get_current();
                        //console.log(currFile);
                        var fileName = currFile.get_name();
                        if (fileName.indexOf('.html') > 0) {
                            currFile.publish();
                            _ctx.load(currFile);
                            _ctx.executeQueryAsync(
                                function() {
                                    var majorVersion = currFile.get_majorVersion();
                                    console.log("Published - ", currFile);
                                },
                                function(sender, args) {
                                    console.log('Request failed - ' + args.get_message());
                                }
                            );
                        }
                    }
                },
                function(sender, args) {
                    console.log('Request failed - ' + args.get_message());
                }
            );
        },
        //publishFilesInFolder('/sites/trgs/_catalogs/masterpage/Display Templates/Content Web Parts/Custom', 'Master Page Gallery');
        trendingTag: function() {
            EnsureScriptFunc('SP.js', 'SP.ClientContext', function() {
                EnsureScriptFunc('sp.userprofiles.js', 'SP.UserProfiles.PeopleManager', function() {
                    try {
                        var clientContext = new SP.ClientContext.get_current();
                        var trendTags = new SP.UserProfiles.HashTagCollection(clientContext);
                        var manager = new SP.UserProfiles.PeopleManager(clientContext);
                        trendTags = new SP.UserProfiles.PeopleManager.getTrendingTags(clientContext);
                        userProperties = manager.getMyProperties();
                        clientContext.load(trendTags);
                        clientContext.load(userProperties);
                        clientContext.executeQueryAsync(
                            function() {
                                var personalUrl = userProperties.get_personalUrl();
                                onloaduserSucceeded(trendTags, personalUrl);
                            },
                            function(error) {
                                console.log(error.message);
                            }
                        );
                    } catch (e) {
                        console.log(e.message);
                    }
                });
            });
        },
        getWikiPageContent: function(webUrl, itemId, result) {
            var listTitle = "Pages";
            var url = webUrl + "/_api/web/lists/GetByTitle('" + listTitle + "')/items(" + itemId + ")/PublishingPageContent";
            $.getJSON(url, function(data) {
                result(data.value);
            });
        },
        getWebPartsFromPage: function(server2RelativeUrl) {
            var _ctx = new SP.ClientContext(_spPageContextInfo.siteAbsoluteUrl);
            var _file = _ctx.get_web().getFileByServerRelativeUrl(server2RelativeUrl);
            var _limitedWebPartManager = _file.getLimitedWebPartManager(SP.WebParts.PersonalizationScope.shared);
            var _collWebPart = _limitedWebPartManager.get_webParts();
            _ctx.load(_collWebPart, 'Include(WebPart)');
            _ctx.executeQueryAsync(
                function() {
                    if (!_collWebPart.get_count()) {
                        alert('No Web Parts on this page.');
                    } else {
                        var wpArr = [];
                        var wpEnum = _collWebPart.getEnumerator();
                        while (wpEnum.moveNext()) {
                            var _webPartDefinition = wpEnum.get_current();
                            var _webPart = _webPartDefinition.get_webPart();
                            console.log(_webPart);
                            _ctx.load(_webPart, 'Properties');
                            _ctx.executeQueryAsync(
                                function() {
                                    var properties = _webPart.get_properties();
                                    console.log(properties.get_fieldValues());
                                },
                                function(sender, args) {
                                    console.log(args.get_message());
                                }
                            );
                        }
                    }
                },
                function(sender, args) {
                    console.log('Request failed - ' + args.get_message());
                }
            );
        },
        getNavigationNode: function() {
            var _ctx = SP.ClientContext.get_current();
            var _nav = _ctx.get_web().get_navigation().getNodeById(1040).get_children();
            _ctx.load(_nav);
            _ctx.executeQueryAsync(
                function() {
                    var navEnum = _nav.getEnumerator();
                    var str = '[';
                    console.log();
                    while (navEnum.moveNext()) {
                        var nav = navEnum.get_current();
                        var strObj = '{' + 'title:"' + nav.get_title() + '", url:"' + nav.get_url() + '", isExternal:false }, ';
                        str = str + strObj;
                    };
                    str = str + ']';
                    console.log(str);
                },
                function(sender, args) {
                    console.log(args.get_message());
                }
            );
        },
        deleteNavigationNode: function() {
            var _ctx = SP.ClientContext.get_current();
            var _nav = _ctx.get_web().get_navigation().getNodeById(1040).get_children();
            _ctx.load(_nav);
            _ctx.executeQueryAsync(
                function() {
                    var navEnum = _nav.getEnumerator();
                    var str = '[';
                    while (navEnum.moveNext()) {
                        var nav = navEnum.get_current();
                        nav.deleteObject();
                    };
                    _ctx.executeQueryAsync(
                        function(sender, args) {
                            console.log(sender, args);
                        },
                        function(sender, args) {
                            console.log(sender, args);
                        }
                    );
                    str = str + ']';
                    console.log(str);
                },
                function(sender, args) {
                    console.log(args.get_message());
                }
            );
        },
        addNavigationNodes: function(navArray) {
            var clientContext = SP.ClientContext.get_current();
            if (clientContext != undefined && clientContext != null) {
                var web = clientContext.get_web();
                // Get the Quick Launch navigation node collection.
                // this.quickLaunchNodeCollection = web.get_navigation().get_quickLaunch();
                // Get the Top Navigation navigation node collection.
                // var navigationNodeCollection = web.get_navigation().get_topNavigationBar();
                var navigationNodeCollection = web.get_navigation().getNodeById(1040).get_children();
                for (var i = 0; i < navArray.length; i++) {
                    var navObject = navArray[i];
                    var navTitle = navObject.title;
                    var navUrl = navObject.url;
                    var navIsExternal = navObject.isExternal;
                    var nnci = new SP.NavigationNodeCreationInformation();
                    nnci.set_title(navTitle);
                    nnci.set_url(navUrl);
                    nnci.set_isExternal(navIsExternal);
                    nnci.set_asLastNode(true);
                    navigationNodeCollection.add(nnci);
                }
                clientContext.load(navigationNodeCollection);
                clientContext.executeQueryAsync(
                    function onQuerySucceeded() {
                        console.log(navigationNodeCollection);
                    },
                    function onQueryFailed(sender, args) {
                        console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace(), args);
                    }
                );
            }
        },
        setRating: function() {
            var itemID = 1;
            var listID = "32A0D100-61A1-41F4-BB5C-973E415ACF90";
            var RatingValue = 2;
            EnsureScriptFunc('reputation.js', 'Microsoft.Office.Server.ReputationModel.Reputation', function() {
                var ctx = SP.ClientContext.get_current();
                rating = Microsoft.Office.Server.ReputationModel.Reputation.setRating(ctx, listID, itemID, RatingValue);
                ctx.executeQueryAsync(
                    function(sender, args) {
                        alert('Rating Done Successfully');
                    }

                    function(sender, args) {
                        alert('SetRating failed:' + args.get_message());
                    }
                );
            });
        },
        enableSiteDesignerAccess: function() {
            var clientContext = new SP.ClientContext();
            oSite = clientContext.get_site();
            //The below line helps to enable the designer access
            oSite.set_allowDesigner(true);
            clientContext.load(oSite);
            clientContext.executeQueryAsync(
                Function.createDelegate(this, function() {
                    var siteInfo = '';
                    if (oSite.get_allowDesigner())
                        siteInfo = 'Designer Access: Allowed';
                    else
                        siteInfo = 'Designer Access: Not Allowed';
                    alert(siteInfo.toString());
                }),
                Function.createDelegate(this, function(sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
        },
        disableSiteDesignerAccess: function() {
            var clientContext = new SP.ClientContext();
            oSite = clientContext.get_site();
            //The below line helps to disable the designer access
            oSite.set_allowDesigner(false);
            clientContext.load(oSite);
            clientContext.executeQueryAsync(
                Function.createDelegate(this, function() {
                    var siteInfo = '';
                    if (oSite.get_allowDesigner())
                        siteInfo = 'Designer Access: Allowed';
                    else
                        siteInfo = 'Designer Access: Not Allowed';
                    alert(siteInfo.toString());
                }),
                Function.createDelegate(this, function(sender, args) {
                    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                })
            );
        },
        removeCommunityMember: function(itemId) {
            var _ctx = SP.ClientContext.get_current();
            var list = _ctx.get_web().get_lists().getByTitle('Community Members');
            var itemToDelete = list.getItemById(itemId);
            itemToDelete.deleteObject();
            ctx.executeQueryAsync(
                function() {
                    console.log(list);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        }
    };
//====================================================================================================================REST
    SkdSpJs.Rest = {
        getData: function(query, _async) {
            (_async === false && _async !== null) ? _async = false: _async = true;
            return JSON.parse(
                jQuery.ajax({
                    url: this.baseUrl + _query,
                    async: _async,
                    type: "GET",
                    headers: {
                        "ACCEPT": "application/json;odata=verbose"
                    },
                    success: function(data) {
                        return data;
                    },
                    error: function(data) {
                        console.log(data);
                    }
                }).responseText
            );
        },
        createData: function(_query, _async, _payload) {
            (_async === false && _async !== null) ? _async = false: _async = true;
            return JSON.parse(
                jQuery.ajax({
                    url: this.baseUrl + _query,
                    async: _async,
                    type: "POST",
                    contentType: "application/json;odata=verbose",
                    headers: {
                        "ACCEPT": "application/json;odata=verbose",
                        "X-RequestDigest": getFormDigest(),
                    },
                    data: JSON.stringify({
                        _payload
                    }),
                    success: function(data) {
                        return data;
                    },
                    error: function(data) {
                        console.log(data);
                    }
                }).responseText
            );
        },
        updateData: function(_query, _async, _payload, _eTag) {
            (_async === false && _async !== null) ? _async = false: _async = true;
            return JSON.parse(
                jQuery.ajax({
                    url: this.baseUrl + _query,
                    async: _async,
                    type: "POST",
                    contentType: "application/json;odata=verbose",
                    headers: {
                        "ACCEPT": "application/json;odata=verbose",
                        "X-RequestDigest": getFormDigest(),
                        "X-HTTP-Method": "MERGE",
                        "If-Match": _eTag
                    },
                    data: JSON.stringify({
                        _payload
                    }),
                    success: function(data) {
                        return data;
                    },
                    error: function(data) {
                        console.log(data);
                    }
                }).responseText
            );
        },
        deleteData: function(_query, _async) {
            (_async === false && _async !== null) ? _async = false: _async = true;
            return JSON.parse(
                jQuery.ajax({
                    url: this.baseUrl + _query,
                    async: _async,
                    type: "DELETE",
                    contentType: "application/json;odata=verbose",
                    headers: {
                        "ACCEPT": "application/json;odata=verbose",
                        "X-RequestDigest": getFormDigest(),
                        "If-Match": "*"
                    },
                    success: function(data) {
                        return data;
                    },
                    error: function(data) {
                        console.log(data);
                    }
                }).responseText
            );
        },
        getFormDigest: function() {
            return jQuery('#__REQUESTDIGEST').val();
        },
        getallFieldsinView: function() {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getbytitle('" + _u.config.List + "')/Views/getbytitle('" + _u.config.View + "')/ViewFields",
                type: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose"
                },
                success: function(data) {
                    console.log(data);
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        addField: function(fieldName) {
            var data = {
                '__metadata': {
                    'type': 'SP.FieldText' //https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.spfieldtype.aspx
                },
                'FieldTypeKind': 2, //https://msdn.microsoft.com/en-us/library/microsoft.sharepoint.client.fieldtype.aspx
                'Title': fieldName,
                'MaxLength': '22'
            }
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('Your List Name')/Fields",
                type: "POST",
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "content-Type": "application/json;odata=verbose"
                },
                data: JSON.stringify(data),
                success: function(data) {
                    console.log(data);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        },
        getNavigationNode: function() {
            $.ajax({
                url: _spPageContextInfo.webServerRelativeUrl + '_api/web/Navigation/GetNodeById(1040)/Children',
                type: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose"
                },
                success: function(data) {
                    console.log(data);
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        getWebPartProperties: function() {
            $.ajax({
                url: _spPageContextInfo.webServerRelativeUrl + "/_api/web/GetFileByServerRelativeUrl('/Knowledge Sharing/webinars/Pages/Fabric-Structures-An-Overview.aspx')/GetLimitedWebPartManager/WebParts?$select=*&$expand=Webpart,Webpart/Properties",
                type: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                success: function(data) {
                    console.log(data);
                    for (var i = 0; i < data.d.results.length; i++) {
                        if (data.d.results[i].WebPart.Properties.ContentLink && data.d.results[i].WebPart.Properties.ContentLink.indexOf('WebinarMarkup') > -1) {
                            $.ajax({
                                url: data.d.results[i].WebPart.Properties.ContentLink,
                                type: "GET"
                            }).done(handler);

                            function handler(_data) {
                                console.log(_data);
                            }
                        }
                    }
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        getClientContent: function() {
            var documentPath = "http://server/sitecollection/site/documents/folder/mydocument.docx";
            documentPath = documentPath.substring(0, documentPath.lastIndexOf('/')) + "/_api/contextinfo";
            $.ajax({
                url: docuemntPath,
                type: "POST",
                contentType: "application/x-www-url-encoded",
                dataType: "json",
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                success: function(data) {
                    if (data.d) {
                        var webUrl = data.d.GetContextWebInformation.WebFullUrl;
                        var clientContext = new SP.ClientContext(webUrl);
                    }
                },
                error: function(err) {
                    alert(JSON.stringify(err));
                }
            });
        },
        getCurrentUserName: function() {
            $.ajax({
                url: _spPageContextInfo.webServerRelativeUrl + '/_api/web/currentUser',
                type: "GET",
                headers: {
                    "ACCEPT": "application/json;odata=verbose"
                },
                success: function(data) {
                    // currUserName = data.d.Title;
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        getCurrentUserProfile: function() {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + '/_api/SP.UserProfiles.PeopleManager/GetMyProperties',
                type: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                success: function(data) {
                    pos = data.d.UserProfileProperties.results.map(function(e) {
                        return e.Key;
                    }).indexOf('EmployeeNumber');
                    var employeeNumber = data.d.UserProfileProperties.results[pos].Value;
                    if (employeeNumber == '1697' || employeeNumber == '1002' || employeeNumber == '2415' || employeeNumber == '2211' || employeeNumber == '1239' || employeeNumber == '1883' || employeeNumber == '0049') {
                        console.log(employeeNumber);
                        $('#contentRow').css('visibility', 'visible');
                    } else {
                        window.location.replace("/secure/umsite/needsassessment");
                    }
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        getUserProfileInfo: function() {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='domain\\loginname'",
                type: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose"
                },
                success: function(data) {
                    console.log(data.d);
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        createField: function(colName) {
            var _data = {
                '__metadata': {
                    'type': 'SP.Field'
                },
                'FieldTypeKind': 9,
                'Title': colName
            };
            return $.ajax({
                url: _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + _u.config.List + "')/fields",
                type: "POST",
                data: JSON.stringify(_data),
                headers: {
                    "content-type": "application/json; odata=verbose",
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "IF-MATCH": "*"
                }
            });
        },
        addFieldToView: function(colName) {
            return $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getbytitle('" + _u.config.List + "')/Views/getbytitle('" + _u.config.View + "')/ViewFields/AddViewField",
                type: "POST",
                data: JSON.stringify({
                    'strField': colName
                }),
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                    "IF-MATCH": "*"
                }
            });
        },
        isUserMemberOfGroup: function() {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/sitegroups/getByName('" + groupName + "')/Users?$filter=Id eq " + _spPageContextInfo.userId,
                method: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                success: function(data) {
                    if (data.d.results[0] != undefined) {
                        // Exist in group
                    } else {
                        // Does not exist
                    }
                }
            });
        },
        getAllGroupsForUser: function(userId) {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/GetUserById(" + userId + ")?$select=*,groups&$expand=groups",
                type: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose"
                },
                success: function(data) {
                    console.log(data);
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        getAllUserInformationListFoelds: function() {
            $.ajax({ //_spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getbytitle('WPRP Vision Projects List')/items?$select=*&$filter=substringof('"+pNum+"', "+column+")&$orderby=Project desc"
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getbytitle('User Information List')/Fields",
                type: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose"
                },
                success: function(data) {
                    for (var i = 0; i < data.d.results.length; i++) {
                        console.log(data.d.results[i].Title);
                        console.log(data.d.results[i].StaticName);
                        console.log("                    =============================");
                    }
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        filterBySubstring: function() {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getbytitle('User Information List')/items?$select=*&$filter=substringof('" + pNum + "', " + column + ")&$orderby=Project desc",
                type: "GET",
                headers: {
                    "Accept": "application/json;odata=verbose"
                },
                success: function(data) {
                    for (var i = 0; i < data.d.results.length; i++) {
                        console.log(data.d.results[i].Title);
                        console.log(data.d.results[i].StaticName);
                        console.log("                    =============================");
                    }
                },
                error: function(data) {
                    console.log(data);
                }
            });
        }
    };
//====================================================================================================================JQUERY CHECK
    SkdSpJs.wait_For_jQuery_to_Load = function(scriptUrl) {
        var scriptUrl = scriptUrl || window.location.protocol + "//code.jquery.com/jquery-1.11.2.min.js";
        var hasDollarAlias = false;
        if (typeof jQuery === 'undefined') {
            if (typeof $ == 'function') {
                hasDollarAlias = true;
            }
            var script = document.createElement('script');
            script.src = scriptUrl;
            var head = document.getElementsByTagName('head')[0];
            var scriptAdded = false;
            script.onload = script.onreadystatechange = function() {
                if (!scriptAdded && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                    scriptAdded = true;
                    ensureCallback();
                    script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
                };
            };
            head.appendChild(script);

            function ensureCallback() {
                if (typeof jQuery == 'undefined') {
                    if (SP.UI.Status != undefined) {
                        var statusId = SP.UI.Status.addStatus("Adding jQuery script failed", "An error occurred while adding jQuery script reference", true);
                        SP.UI.Status.setStatusPriColor(statusId, "red");
                    } else {
                        alert('An error occurred while adding jQuery script reference');
                    }
                } else {
                    if (hasDollarAlias) {
                        jQuery.noConflict();
                    }
                    SP.SOD.executeFunc('core.js', false, function() {
                        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
                            SP.SOD.executeFunc('sp.core.js', false, function() {
                                jQuery(document).ready(function() {
                                    SkdSpJs.jsom = new Skd_Sp_Libs_Jsom_NS();
                                    SkdSpJs.rest = new Skd_Sp_Libs_Rest_NS();
                                    SkdSpJs.utils = new Skd_Sp_Libs_JsUtilis_NS();
                                })
                            })
                        })
                    });
                }
            }
        }
    };
    window.onload = SkdSpJs.wait_For_jQuery_to_Load(scriptUrl);
//====================================================================================================================
