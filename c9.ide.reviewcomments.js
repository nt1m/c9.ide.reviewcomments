define(function(require, exports, module) {
    main.consumes = ["Plugin", "panels", "ui", "Panel", "tabManager", "settings"];
    main.provides = ["c9.ide.reviewcomments"];
    return main;

    function main(options, imports, register) {
        var Panel = imports.Panel;
        var panels = imports.panels;
        var ui = imports.ui;
        var tabManager = imports.tabManager;
        var settings = imports.settings;

        /***** Initialization *****/

        var plugin = new Panel("reviews", main.consumes, {
            index: 300,
            caption: "Reviews",
            where: "right",
        });

        plugin.on("draw", function(e){
            ui.insertCss(require("text!./panel.css"), options.staticPrefix, plugin);

            // Load iframe from nt1m.github.io
            let iframe = document.createElement("iframe");
            iframe.src = "https://nt1m.github.io/review-comments-viewer/";

            iframe.onload = function() {
                iframe.contentWindow.postMessage({ origin: window.location.origin }, "https://nt1m.github.io");
                window.addEventListener("message", function(e) {
                    if (e.data.file) {
                        tabManager.open({
                            path: "/" + e.data.file,
                            active: true,
                            focus: true,
                            document: {
                                ace: {
                                    jump: {
                                        row: e.data.lineNumber - 1,
                                        column: 0,
                                    }
                                }
                            }
                        }, function(err) {
                            // TODO: ugly
                            !err && setTimeout(() =>
                                tabManager.open({
                                    path: "/" + e.data.file,
                                    document: {
                                        ace: {
                                            jump: {
                                                row: e.data.lineNumber - 1,
                                                column: 0,
                                            }
                                        }
                                    }
                                })
                            , 800);
                        });
                    }
                });
            };
            e.html.appendChild(iframe);
        });

        /* Don't show reviews panel by default */
        if (panels.activePanels.includes("reviews")) {
            plugin.deactivate("reviews");
        }
        

        /***** Register and define API *****/

        plugin.freezePublicAPI({

        });

        register(null, {
            "c9.ide.reviewcomments": plugin
        });
    }
});
