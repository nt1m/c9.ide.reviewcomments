define(function(require, exports, module) {
    main.consumes = ["Plugin", "panels", "ui", "Panel", "tabManager", "settings"];
    main.provides = ["c9.ide.reviewcomments"];
    return main;

    function main(options, imports, register) {
        var Panel = imports.Panel;
        var ui = imports.ui;
        var tabManager = imports.tabManager;
        var settings = imports.settings;
        console.log(imports)

        /***** Initialization *****/

        var plugin = new Panel("Reviews", main.consumes, {
            index: 300,
            caption: "Reviews",
            where: "right",
        });

        function jumpToLine(tab, line, column) {
            tab.editor.ace.gotoline(tab, line, column, settings.getBool("editors/code/@animatedscroll"));
        }
        plugin.on("draw", function(e){
            ui.insertCss(require("text!./panel.css"), options.staticPrefix, plugin);

            // Load iframe from nt1m.github.io
            let iframe = document.createElement("iframe");
            iframe.src = "https://nt1m.github.io/review-comments-viewer/";

            iframe.onload = function() {
                iframe.contentWindow.postMessage({ origin: window.location.origin }, "https://nt1m.github.io");
                window.addEventListener("message", function(e) {
                    if (e.data.file) {
                        tabManager.open({ path: e.data.file, active: true }, function(err, tab) {
                            if (err || !tab.editor || !tab.editor.ace) {
                                tab.editor.on("documentLoad", function(e) {
                                    jumpToLine(tab, e.data.lineNumber, 0);
                                });
                                return;
                            }
                            jumpToLine(tab, e.data.lineNumber, 0);
                        });
                    }
                });
            };
            e.html.appendChild(iframe);
        });

        // This is only here to make the example run
        // for when you are executing this in the console.
        plugin.load();


        /***** Register and define API *****/

        plugin.freezePublicAPI({

        });

        register(null, {
            "c9.ide.reviewcomments": plugin
        });
    }
});
