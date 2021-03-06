(function () {
    "use strict";

    let PollPartyApp = function () {

        let currentView = null;

        function initialize() {

            // Show the loading view while we init
            navigate(window.PollParty.Views.LoadingView);

            try {
                navigate(window.PollParty.Views.CodeView);
            }
            catch (e) {

                // We've failed to load a view. Show an error message.
                navigate(window.PollParty.Views.ErrorView, {
                    exception: e,
                    message: "We have encountered an error loading the app. Please try again.",
                    commandText: "Refresh",
                    commandCallback: initialize
                });
            }
        };
        
        /*
            Navigate the content-root to the specified view.
                viewType: A type from window.PollParty.Views for display.
                data (optional): An object to initialize the view with.
        */
        function navigate(viewType, data) {

            setImmediate(function() {
                
                if (currentView && currentView.unload) {
                    currentView.unload();
                }

                currentView = new viewType();

                let template = document.querySelector(`#templates ${currentView.templateSelector}`).cloneNode(true);
                currentView.initialize(template, data);

                let contentRoot = document.querySelector("#content-root");
                while (contentRoot.firstChild)
                {
                    contentRoot.removeChild(contentRoot.firstChild);
                }
                contentRoot.appendChild(template);
            });
        };

        this.initialize = initialize;
        this.navigate = navigate;
    };

    // Create default namespace
    window.PollParty = {
        App: new PollPartyApp(),
        Views: {}
    };

    // The initialize function must be run each time a new page is loaded.
    window.addEventListener('DOMContentLoaded', window.PollParty.App.initialize);

})();