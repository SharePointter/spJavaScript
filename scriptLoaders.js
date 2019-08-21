//LONG EXECUTION TIME
var SkdSpJsScriptLoader = window.SkdSpJsScriptLoader || {};
SkdSpJsScriptLoader = {
    scripts: [
        ['sp.userprofiles.js', '<web>/_layouts/15/sp.userprofiles.js', SP.UserProfiles],
        ['sp.taxonomy.js', '<web>/_layouts/15/sp.taxonomy.js', SP.Taxonomy]
    ],
    initState: true,
    preinit: function() {
        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
            SP.SOD.registerSod('sp.userprofiles.js', '<web>/_layouts/15/sp.userprofiles.js');
            SP.SOD.executeFunc('sp.userprofiles.js', 'SP.UserProfiles.PeopleManager', function() {
                SkdSpJsScriptLoader.init(SP.UserProfiles, 0);
            });
            SP.SOD.registerSod('sp.taxonomy.js', '<web>/_layouts/15/sp.taxonomy.js');
            SP.SOD.executeFunc('sp.taxonomy.js', 'SP.Taxonomy.TaxonomySession', function() {
                SkdSpJsScriptLoader.init(SP.Taxonomy, 0, SkdSpJsScriptLoader.checkjQ);
            });
        });
    },
    init: function(ns, ctr, fxn) {
        if (ns) {
            if (fxn) {
                fxn();
            } else {
                return;
            }
        } else {
            ctr < 6 ? setTimeout(function() {
                SkdSpJsScriptLoader.init(ns, ctr++, fxn);
            }, 200) : console.log('NS loading failed...');
        }
    },
    checkjQ: function() {
        window.jQuery ? (SkdSpJsScriptLoader.initState = false, SkdSpJsScriptLoader.start()) : setTimeout(SkdNeedAssessment.jQueryChecker, 200);
    },
    start: function() {
        if (!SkdSpJsScriptLoader.initState) {
            $(document).ready(function() {
                TRGCommunityJs = new TRGCommunityJs();
                TRGCommunityJs.init();
            });
        }
    }
};
//LOADS SPECIFIC SCRIPT
SkdSpJsScriptLoader.init = function(callback) {
    var taxonomySodLoaded = false;
    if (typeof(_v_dictSod) !== 'undefined' && _v_dictSod['sp.taxonomy.js'] == null) {
        RegisterSod('sp.taxonomy.js', '/_layouts/15/sp.taxonomy.js');
        RegisterSodDep('sp.taxonomy.js', 'sp.js');
    } else {
        taxonomySodLoaded = _v_dictSod['sp.taxonomy.js'].state === Sods.loaded;
    }
    taxonomySodLoaded ? callback(ctx) : EnsureScriptFunc('sp.taxonomy.js', false, callback);
};
//LOADS MULTIPLE SCRIPTS
SkdSpJs.SkdSpJsScriptLoader = function() {
    var _scripts = [
        'sp.userprofiles.js',
        'sp.taxonomy.js'
    ];
    for (var i = 0; i < _scripts.length; i++) {
        var _sodLoaded = false;
        if (typeof(_v_dictSod) !== 'undefined' && _v_dictSod[_scripts[i]] == null) {
            RegisterSod(_scripts[i], '/_layouts/15/' + _scripts[i]);
            RegisterSodDep(_scripts[i], 'sp.js');
        } else {
            _sodLoaded = _v_dictSod[_scripts[i]].state === Sods.loaded;
        }
        if (_sodLoaded) {
            console.log(_scripts[i] + ' ... loaded');
        } else {
            EnsureScriptFunc(_scripts[i], false, function() {
                console.log(_scripts[i]);
            });
        }
    }
    SkdSpJs.TRGCommunityJs = new SkdSpJs.TRGCommunityJs();
    SkdSpJs.TRGCommunityJs.init();
};
