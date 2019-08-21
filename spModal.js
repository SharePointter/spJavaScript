  SkdSpJs.skdModalDlg = function() {
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
            if (result === 1 && returnedValue && returnedValue.newFileUrl && returnedValue.newFileUrl.indexOf('/Documents/') > -1) {
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
    }();
