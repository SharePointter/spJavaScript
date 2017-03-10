//====================================================================================================================UTILITIES
var Skd_Sp_Libs_JsUtilis_NS = function() {};
Skd_Sp_Libs_JsUtilis_NS.prototype = (function() {
    var getScriptIfNotCached = function(_script, callback) {
            var url = _spPageContextInfo.webServerRelativeUrl + "_layouts/15/" + _script;
            jQuery.ajax({
                dataType: "script",
                cache: true,
                url: url,
                success: function() {
                    callback();
                },
                error: function() {
                    console.log(_script + ': was cached');
                }
            });
        },
        domObserver = function(target, _attributes, _subtree, _childList, _attributeFilter, _attributeOldValue, _characterDataOldValue, fnCallback) { //TARGET MUST BE A NODE ELEMENT
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
        extend = function(obj1, obj2) {
            obj1.prototype.extend = function(obj2) {
                for (var i in obj2) {
                    if (obj2.hasOwnProperty(i)) {
                        this[i] = obj2[i];
                    }
                }
            };
        },
        centerVert = function(jQuerycontainer, jQueryelToCenter, defaultMargin) {
            var diff = ((jQuerycontainer.height() - jQueryelToCenter.height()) / 2);
            if (diff > 0) {
                jQueryelToCenter.css('margin-top', diff);
                jQueryelToCenter.css('margin-bottom', diff);
            } else {
                jQueryelToCenter.css('margin-top', defaultMargin);
                jQueryelToCenter.css('margin-bottom', defaultMargin);
            }
        },
        centerHorz = function(jQuerycontainer, jQueryelToCenter, defaultMargin) {
            var diff = ((jQuerycontainer.heightwidth() - jQueryelToCenter.width()) / 2);
            if (diff > 0) {
                jQueryelToCenter.css('margin-left', diff);
                jQueryelToCenter.css('margin-right', diff);
            } else {
                jQueryelToCenter.css('margin-left', defaultMargin);
                jQueryelToCenter.css('margin-right', defaultMargin);
            }
        },
        ifElemIsRendered = function(jQueryelem, fnTrue, fnFalse) {
            (jQueryelem.length) ? (fnTrue) : (requestAnimationFrame(fnFalse));
        },
        autoScroll = function(jQuerycontainer, jQueryelem, adjustInt) {
            jQuerycontainer.animate({
                scrollTop: (jQueryelem.offset().top - adjustInt) - jQuerycontainer.offset().top + jQuerycontainer.scrollTop()
            });
        },
        addCssToHead = function(cssStr) { // cssStr = "header { float: left; opacity: 0.8; }"
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(''));
            document.head.appendChild(style);
        },
        cacheDom = function(CacheStore, selector) {
            var CacheStore = window[CacheStore] || {};
            if (CacheStore[selector] !== undefined) {
                return CacheStore[selector];
            } else {
                utils.ifElemIsRendered(jQuery(selector), function() { console.log(jQuery(selector)) }, utils.cacheDom(CacheStore, selector, force));
                CacheStore[selector] = jQuery(selector);
                return CacheStore[selector];
            }
        },
        getStrDiffByInt = function(a, b) {
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
        timeDateFormat = function(date_tz) {
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            f_z = function(v) {
                if (parseInt(v) < 10) return "0" + v;
                return v;
            };
            var d = new Date(date_tz);
            d = f_z(monthNames[d.getMonth()]) + ' ' + f_z(d.getDate()) + ', ' + d.getFullYear();
            return d;
        },
        getFileNAppend = function(jQueryelem, Url) {
            jQuery.ajax({
                url: Url,
                type: "GET"
            }).done(handler);

            function handler(data) {
                jQueryelem.append(data);
            }
        },
        validateInput = function(jQueryinputElem) {
            if (jQuery.trim(jQueryinputElem.val()) == '') {
                alert("Please provide a proper response.");
                return false;
            } else {
                return true;
            }
        },
        skdSort = function(a, b, prop) {
            if (a.get_item(prop) > b.get_item(prop))
                return -1;
            if (a.get_item(prop) < b.get_item(prop))
                return 1;
            return 0;
        },
        matchesSelector = function(el, selector) {
            var p = Element.prototype;
            var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
            };
            return f.call(el, selector);
        },
        getUrlParams = function() {
            var GET = {};
            var query = window.location.search.substring(1).split("&");
            for (var i = 0, max = query.length; i < max; i++) {
                if (query[i] === "")
                    continue;
                var param = query[i].split("=");
                GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
            }
            return GET;
        },
        isWikiPage = function() {
            var tf;
            SP.SOD.executeFunc('SP.Ribbon.js', 'SP.ClientContext', function() {
                if (document.getElementById("Ribbon.WikiPageTab-title") != null) {
                    tf = true;
                } else {
                    tf = false;
                }
            });
            return tf
        },
        getPageMode = function() {
            var modeV;
            if (isWikiPage) {
                var wikiInEditMode = document.forms[MSOWebPartPageFormName]._wikiPageMode.value;
                if (wikiInEditMode == "Edit") {
                    modeV = 'Edit';
                } else {
                    modeV = 'Wiki Diplay';
                }
            } else {
                var inDesignMode = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;
                if (inDesignMode == "1") {
                    modeV = 'Design';
                } else {
                    modeV = 'WebPart Display';
                }
            }
            return modeV
        },
        addResource = function(tag, _type, Url, Type) {
            var elem = document.createElement(tag);
            elem[_type] = Url;
            elem.type = Type;
            document.getElementsByTagName("head")[0].appendChild(elem);
        },
        getSpVersion = function() {
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
        checkGlobalVars = function(myVar) {
            var varArr = [];
            for (var oneVar in window) {
                if (myVar) {
                    if (oneVar === myVar) return true;
                }
                varArr.push(oneVar);
            }
            return varArr
        },
        getFxnTimeToExec = function(fnToEvaluate) {
            var performance = window.performance;
            var t0 = performance.now();
            fnToEvaluate();
            var t1 = performance.now();
            console.log("Call to doWork took " + (t1 - t0) + " milliseconds.");
            return (t1 - t0);
        },
        poll = function(fn, timeout, interval) {
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
        },
        debounce = function(func, wait, immediate) {
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
        throttle = function(callback, limit) {
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
        fireOnce = function(fn, context) {
            var result;

            return function() {
                if (fn) {
                    result = fn.apply(context || this, arguments);
                    fn = null;
                }
                return result;
            };
        },
        isNative = function(value) {
            var toString = Object.prototype.toString;
            var fnToString = Function.prototype.toString;
            var reHostCtor = /^\[object .+?Constructor\]$/;
            var reNative = RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&').replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

            function isNative(value) {
                var type = typeof value;
                return type == 'function' ? reNative.test(fnToString.call(value)) : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
            }
        },
        logObjInfo = function(obj) {
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
        logAllFxn = function() {
            var call = Function.prototype.call;
            Function.prototype.call = function() {
                console.log(this, arguments);
                return call.apply(this, arguments);
            };
        },
        traceFxn = function(func, methodName) {
            String.prototype.times = function(count) {
                return count < 1 ? '' : new Array(count + 1).join(this);
            }
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
        traceAll = function(root, recurse) { //AVOID THIS ON window. RESULTS IN OVERSIZE STACK
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
                            tracing.push({ obj: root, methodName: key });
                        }
                    }
                    recurse && this.traceAll(thisObj, true);
                }
            }
        },
        untraceAll = function() {
            for (var i = 0; i < this.tracing.length; ++i) {
                var thisTracing = this.tracing[i];
                thisTracing.obj[thisTracing.methodName] =
                    thisTracing.obj[thisTracing.methodName].traceOff;
            }
            console.log("tracing disabled");
            tracer.tracing = [];
        };
    return {
        getScriptIfNotCached: getScriptIfNotCached,
        extend: extend,
        centerVert: centerVert,
        getScriptIfNotCached: getScriptIfNotCached,
        centerHorz: centerHorz,
        ifElemIsRendered: ifElemIsRendered,
        autoScroll: autoScroll,
        cacheDom: cacheDom,
        getStrDiffByInt: getStrDiffByInt,
        timeDateFormat: timeDateFormat,
        getFileNAppend: getFileNAppend,
        validateInput: validateInput,
        matchesSelector: matchesSelector,
        skdSort: skdSort,
        getUrlParams: getUrlParams,
        isWikiPage: isWikiPage,
        getPageMode: getPageMode,
        addResource: addResource,
        getSpVersion: getSpVersion,
        checkGlobalVars: checkGlobalVars,
        getFxnTimeToExec: getFxnTimeToExec,
        logObjInfo: logObjInfo,
        poll: poll,
        fireOnce: fireOnce,
        debounce: debounce,
        throttle: throttle,
        isNative: isNative,
        logAllFxn: logAllFxn,
        traceFxn: traceFxn,
        traceAll: traceAll
    }
}());
//====================================================================================================================JSOM
var Skd_Sp_Libs_Jsom_NS = function() {
    this.layoutsUrl = _spPageContextInfo.webAbsoluteUrl + "/_layouts/15/";
    this.cores = {
        global: 'SP.ClientContext',
        scripts: ['SP.Ribbon.js', 'SP.Runtime.js', 'SP.js']
    };
    this.crossDomain = {
        global: "SP.RequestExecutor",
        scripts: ["sp.requestexecutor.js"]
    };
    this.taxonomy = {
        global: "SP.Taxonomy",
        scripts: ["sp.taxonomy.js"]
    };
    this.userProfiles = {
        global: "SP.Social",
        scripts: ["sp.userprofiles.js"]
    };
    this.reputation = {
        global: "Microsoft.Office.Server.ReputationModel.Reputation",
        scripts: ["reputation.js"]
    }
};
Skd_Sp_Libs_Jsom_NS.prototype = (function() {
    var scriptLoader = function(_script, _global) {
            SP.SOD.executeFunc(_script, _global, function() {
                console.log(_script, _global, " loaded");
            });
        },
        spCtx = function(siteUrl) {
            if (siteUrl) {
                ctx = (siteUrl != _spPageContextInfo.webAbsoluteUrl ? new SP.ClientContext(siteUrl) : SP.ClientContext.get_current());
            } else {
                ctx = SP.ClientContext.get_current();
            }
            return ctx;
        },
        spWeb = function(siteUrl) {
            var _ctx = spCtx(siteUrl);
            var _web = _ctx.get_web();
            return {
                ctx: _ctx,
                web: _web
            };
        },
        spLists = function(siteUrl) {
            var _web = spWeb(siteUrl);
            var _lists = (_web.web).get_lists();
            return {
                ctx: _web.ctx,
                web: _web.web,
                lists: _lists
            };
        },
        getAllWebs = function(propArr, fnSuccess, siteUrl) { //AVOID FOR LARGE SC
            var ctx = spCtx(siteUrl);
            var rootWeb = ctx.get_site().get_rootWeb();
            var result = [];
            var level = 0;
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
        getAllLists = function(fnSuccess, siteUrl) {
            var _sp = spLists(siteUrl);
            (_sp.ctx).load(_sp.lists);
            (_sp.ctx).executeQueryAsync(
                function() {
                    fnSuccess(_sp.lists);
                },
                function(sender, args) {
                    console.log('Error: ' + args);
                }
            );
        },
        getListByName = function(listTitle, fnSuccess, siteUrl) {
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
        getListById = function(listId, fnSuccess, siteUrl) {
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
        createList = function(listTitle, templateType, propObj, fnSuccess, siteUrl) { //SETABLE PROPERTRIES: customSchemaXml, dataSourceProperties, description, quickLaunchOption, documentTemplateType, templateFeatureId, typeId, url
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
        getItemById = function(listTitle, itemId, fnSuccess, siteUrl) {
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
        getAllItems = function(listTitle, caml, fnSuccess, siteUrl) {
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
        getItems = function(listTitle, caml, fnSuccess, siteUrl) {
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
        createItem = function(listTitle, propObj, fnSuccess, siteUrl) { //EXAMPLE: propObj={field:'value'};
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
        updateItem = function(listTitle, itemId, propObj, fnSuccess, siteUrl) {
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
        deleteItem = function(listTitle, itemId, fnSuccess, siteUrl) {
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
        createFile = function(listTitle, filePath, fileData, fnSuccess, siteUrl) {
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
        readFile = function(filePath, fnSuccess, siteUrl) {
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
        checkInFile = function(propObj, fnSuccess, siteUrl) {
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
        checkOutFile = function(listTitle, itemId, fnSuccess, siteUrl) {
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
        updateFile = function(filePath, fileData, fnSuccess, siteUrl) {
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
        deleteFile = function(filePath, fnSuccess, siteUrl) {
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
        likeItem = function(listId, itemId, isLiked, fnSuccess, siteUrl) {
            scriptLoader(this.reputation.scripts, this.reputation.global);
            var ctx = spCtx(siteUrl);
            Microsoft.Office.Server.ReputationModel.Reputation.setLike(ctx, listId, itemId, isLiked, fnSuccess);
            ctx.executeQueryAsync(
                function(sender, args) {
                    fnSuccess(args);
                },
                function(sender, args) { console.log(args); }
            );
        },
        rateItem = function(listId, itemId, rating, fnSuccess, siteUrl) {
            scriptLoader(this.reputation.scripts, this.reputation.global);
            var ctx = spCtx(siteUrl);
            Microsoft.Office.Server.ReputationModel.Reputation.setRating(ctx, listId, itemId, rating, fnSuccess);
            ctx.executeQueryAsync(
                function(sender, args) {
                    fnSuccess(args);
                },
                function(sender, args) { console.log(args); }
            );
        },
        isAlreadyFollowed = function(socialActorType, fnSuccess, siteUrl) { //socialActorTypes --> 0:none, 1:users, 2:documents, 4:sites, 8:tags, 268435456:excludeContentWithoutFeeds, 15:all
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
        follow = function(socialActorType, fnSuccess, siteUrl) {
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
        stopFollowing = function(socialActorType, fnSuccess, siteUrl) {
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
        getFollowers = function(fnSuccess, siteUrl) {
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
        getFollowed = function(fnSuccess, siteUrl) {
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
        getFollowedCount = function(fnSuccess, siteUrl) {
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
        getFields = function(listTitle, fieldsArray, fnSuccess, siteUrl) {
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
                function(sender, args) { console.log(args); }
            );
        },
        checkCurrUserPerm = function(permLevel, fnSuccess, siteUrl) {
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
                function(sender, args) { console.log(args); }
            );
        },
        getCurrUserPerm = function(fnSuccess, siteUrl) {
            var ctx = spCtx(siteUrl);
            var user = ctx.get_web().get_currentUser();
            ctx.load(user);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(user);
                },
                function(sender, args) { console.log(args); }
            );
        },
        taxCtx = function() {
            scriptLoader(this.taxonomy.scripts, this.taxonomy.global);
            var _ctx = spCtx(siteUrl);
            var _taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(_ctx);
            return {
                ctx: _ctx,
                taxSession: _taxSession
            };
        },
        createTermGroup = function(termStoreName, newGroupName, fnSuccess, siteUrl) {
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
                function(sender, args) { console.log(args); }
            );
        },
        createTermSet = function(termStoreName, termGroupGuid, newSetName, newSetGuid, fnSuccess, siteUrl) {
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
                function(sender, args) { console.log(args); }
            );
        },
        createTerm = function(termStoreName, termSetGuid, newTermName, newTermGuid, fnSuccess, siteUrl) {
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
                function(sender, args) { console.log(args); }
            );
        },
        getAllTermStores = function(fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStores = taxSession.get_termStores();
            ctx.load(termStores);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(termStores);
                },
                function(sender, args) { console.log(args); }
            );
        },
        getDefaultTermStore = function(fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var defTermStores = taxSession.getDefaultSiteCollectionTermStore();
            ctx.load(defTermStores);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(defTermStores);
                },
                function(sender, args) { console.log(args); }
            );
        },
        getTermStore = function(termStoreName, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
            var taxSession = _sp.taxSession;
            var termStore = taxSession.get_termStores().getByName(termStoreName);
            ctx.load(termStore);
            ctx.executeQueryAsync(
                function() {
                    fnSuccess(termStore);
                },
                function(sender, args) { console.log(args); }
            );
        },
        getTermGroups = function(termStoreName, fnSuccess, siteUrl) {
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
                function(sender, args) { console.log(args); }
            );
        },
        getTermSets = function(termStoreName, termGroupGuid, fnSuccess, siteUrl) {
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
                function(sender, args) { console.log(args); }
            );
        },
        getTerms = function(termStoreName, termSetGuid, fnSuccess, siteUrl) {
            var _sp = taxCtx(siteUrl);
            var ctx = _sp.ctx;
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
                                    function(sender, args) { console.log(args); }
                                );
                            }
                            getChildren(currentTerm);
                        } else {
                            termsArr.push(currentTerm);
                        }
                    }
                    fnSuccess(termsArr);
                },
                function(sender, args) { console.log(args); }
            );
        };
    return {
        spCtx: spCtx,
        spWeb: spWeb,
        spLists: spLists,
        getAllWebs: getAllWebs,
        getAllLists: getAllLists,
        getListByName: getListByName,
        getListById: getListById,
        getAllItems: getAllItems,
        getItems: getItems,
        createItem: createItem,
        updateItem: updateItem,
        deleteItem: deleteItem,
        createFile: createFile,
        readFile: readFile,
        checkInFile: checkInFile,
        checkOutFile: checkOutFile,
        updateFile: updateFile,
        deleteFile: deleteFile,
        likeItem: likeItem,
        rateItem: rateItem,
        isAlreadyFollowed: isAlreadyFollowed,
        follow: follow,
        stopFollowing: stopFollowing,
        getFollowers: getFollowers,
        getFollowed: getFollowed,
        getFollowedCount: getFollowedCount,
        getFields: getFields,
        checkCurrUserPerm: checkCurrUserPerm,
        getCurrUserPerm: getCurrUserPerm,
        createTermGroup: createTermGroup,
        createTermSet: createTermSet,
        createTerm: createTerm,
        getAllTermStores: getAllTermStores,
        getDefaultTermStore: getDefaultTermStore,
        getTermStore: getTermStore,
        getTermGroups: getTermGroups,
        getTermSets: getTermSets,
        getTerms: getTerms
    }
}());
//====================================================================================================================REST
var Skd_Sp_Libs_Rest_NS = function() {
    this.baseUrl = _spPageContextInfo.webAbsoluteUrl + "/_api";
    this.serverRelUrl = _spPageContextInfo.webServerRelativeUrl;
};
Skd_Sp_Libs_Rest_NS.prototype = (function() {
    var getData = function(query, _async) {
            (_async === false && _async !== null) ? _async = false: _async = true;
            return JSON.parse(
                jQuery.ajax({
                    url: this.baseUrl + _query,
                    async: _async,
                    type: "GET",
                    headers: { "ACCEPT": "application/json;odata=verbose" },
                    success: function(data) {
                        return data;
                    },
                    error: function(data) {
                        console.log(data);
                    }
                }).responseText
            );
        },
        createData = function(_query, _async, _payload) {
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
                    data: JSON.stringify({ _payload }),
                    success: function(data) {
                        return data;
                    },
                    error: function(data) {
                        console.log(data);
                    }
                }).responseText
            );
        },
        updateData = function(_query, _async, _payload, _eTag) {
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
                    data: JSON.stringify({ _payload }),
                    success: function(data) {
                        return data;
                    },
                    error: function(data) {
                        console.log(data);
                    }
                }).responseText
            );
        },
        deleteData = function(_query, _async) {
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
        getFormDigest = function() {
            return jQuery('#__REQUESTDIGEST').val();
        };
    return {
        getData: getData,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,
        getFormDigest: getFormDigest
    }
}());

//--------------------------------------------------------------------------------------------------------------------INIT
var SkdSpJs = SkdSpJs || {};
/*
======================================================================================================================JQUERY CHECK
    SkdSpJs.wait_For_jQuery_to_Load = function(scriptUrl) {
        var scriptUrl = scriptUrl || "http://code.jquery.com/jquery-1.11.2.min.js";
        var hasDollarAlias = false;
        if (typeof jQuery === 'undefined') {
            if (typeof $ == 'function') {hasDollarAlias = true;}
            var script = document.createElement('script');
            script.src = scriptUrl;
            var head = document.getElementsByTagName('head')[0];
            var scriptAdded = false;
            script.onload = script.onreadystatechange = function () {
                if (!scriptAdded && (!this.readyState ||  this.readyState == 'loaded' || this.readyState == 'complete')) {
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
                    }
                    else {
                        alert('An error occurred while adding jQuery script reference');
                    }
                }else {
                    if (hasDollarAlias) {
                        jQuery.noConflict();
                    }
                    SP.SOD.executeFunc('core.js', false, function(){
                        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function(){
                            SP.SOD.executeFunc('sp.core.js', false, function(){
                                jQuery(document).ready(function(){
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
*/
//====================================================================================================================
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

var target = document.getElementById('Groups');
debugger
console.log(target);
