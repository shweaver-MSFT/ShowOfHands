(function() {
    "use strict";

    let ConnectView = function () {

        let initialize = function (view, data) {
            
            if (data === undefined || data.code === undefined) {
                
                // We need a code, push the user to the error view
                window.PollParty.App.navigate(window.PollParty.Views.ErrorView, {
                    message: "We need a code",
                    showCommand: true,
                    commandText: "Enter Code",
                    commandCallback: function() {
                        window.PollParty.App.navigate(window.PollParty.Views.CodeView);
                    }
                });
                return;
            }

            let code = data.code;

            // TODO: Add api call here to get the active session for this code
            let session = null;

            // If no session, nav to error view
            if (session === null) {
                window.PollParty.App.navigate(window.PollParty.Views.ErrorView, {
                    message: "No valid session for the code provided.",
                    showCommand: true,
                    commandText: "Enter Code",
                    commandCallback: function() {
                        window.PollParty.App.navigate(window.PollParty.Views.CodeView);
                    }
                });
                return;
            }

            // If valid session, nav to response view
            let statusText = view.querySelector(".status-text");
            statusText.innerText = "Connected";

            window.PollParty.App.navigate(window.PollParty.Views.ResponseView, {
                session: session
            });
        };

        this.initialize = initialize;
        this.templateSelector = ".connect.view";
    };

    window.PollParty.Views.ConnectView = ConnectView;

})();