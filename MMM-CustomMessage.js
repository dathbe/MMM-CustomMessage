/* MagicMirror²
 * Module: MMM-CustomMessage
 *
 * By jpcaldwell30
 * MIT Licensed.
 */
// Declare variables for custom header and module body
let customHeader;
let moduleBody;

// Register the module with the MagicMirror framework
Module.register("MMM-CustomMessage", {

    // Define default module configuration
    defaults: {
        initialHeaderText: {
            value: "" // Initial header text value
        },
        initialText: {
            value: "" // Initial text value
        },
        fontSize: {
            value: "" // Font size value
        },
        headerFontSize: {
            value: "" // Header font size value
        },
        enableHistory: {
            value: "false" // Enable history value
        },
        resetMessage: {
            enabled: "false", // Reset message enabled value
            time: "00:00" // Reset message time in 24 hour format
        },
	uniqueID: ""
    },

    // Function called when the module starts
    start () {
        Log.log(`[${this.name}] Initial Start`); // Log initial start message
        this.sendResetConfig(); // Send reset configuration
    },

    // Function to send reset configuration
    sendResetConfig () {
        const resetConfig = this.config.resetMessage; // Get reset message from config
        Log.log(`${this.name}Sending reset message enabled with config: ${JSON.stringify(resetConfig)}`); // Log reset message configuration
        this.sendSocketNotification("RESET_MESSAGE_CONFIG", resetConfig); // Send socket notification with reset message configuration
    },

    // Function to get custom styles from config.js file
    getStyles () {
        return ["modules/MMM-CustomMessage/css/MMM-CustomMessage.css"];
    },

    // Override DOM generator function.
    getDom () {
        const wrapper = document.createElement("div"); // Create a new div element

        /* Define helper functions to get text, header text, font size, and header font size from config */
        const getText = () => {
            const txt = this.config.initialText.value;
            return txt;
        };

        const getHeaderText = () => {
            const txt = this.config.initialHeaderText.value;
            return txt;
        };

        const getFontSize = () => {
            const fontSize = this.config.fontSize.value; // raw font size value no units
            return fontSize;
        };

        const getHeaderFontSize = () => {
            const fontSize = this.config.headerFontSize.value; // raw font size value no units
            return fontSize;
        };

        /* Get initial header text and initial text */
        initialHeaderText = getHeaderText();
        initialText = getText();

        /* Create custom header div */
        customHeader = document.createElement("div");
        customHeader.classList.add("module-content", "customHeader");
        customHeader.innerHTML = initialHeaderText;
        customHeader.style.fontSize = getHeaderFontSize;

        /* Create module body div */
        moduleBody = document.createElement("div");
        moduleBody.classList.add("module-content", "customBody");
        moduleBody.innerHTML = initialText;
        if (!initialText) {
            moduleBody.style.height = 0;
        } else {
            moduleBody.style.removeProperty("height");
        }
        moduleBody.style.fontSize = getFontSize();
        moduleBody.contentEditable = "true";

        /* If history is enabled, read content from local file */
        if (this.config.enableHistory.value == "true") {
            this.readFileContent(function (response) {
                Log.log(`${this.name} read from file: ${response}`);
                if (response != "") {
                    const jsonResponse = JSON.parse(response);
                    if (jsonResponse.message) {
                        moduleBody.innerHTML = jsonResponse.message;
                        moduleBody.style.removeProperty("height");
                    }
                    if (jsonResponse.messageHeader) {
                        customHeader.innerHTML = jsonResponse.messageHeader;
                    }
                    if (payload.message == "/clear" || payload.message == "\\clear") { // if you forget which type of slash to use for the command...
                        // Clear the inner HTML of the module body and custom header
                        moduleBody.innerHTML = "";
                        moduleBody.style.height = 0;
                        customHeader.innerHTML = "";
                    }
                }
            });
	    }

        /* Append custom header and module body to wrapper */
        wrapper.appendChild(customHeader);
        wrapper.appendChild(moduleBody);
        return wrapper; // Return the wrapper element
    },

    /* Function to read content from local file */
    async readFileContent (callback) {
        const path = this.file("message-history.json");
        try {
            const response = await fetch(path);
            if (response.ok) {
                const text = await response.text();
                callback(text);
            } else {
                Log.error(`HTTP error: ${response.status}`);
            }
        } catch (error) {
            Log.error(`Fetch error: ${error.message}`);
        }
    },

    // Function to handle socket notifications
    socketNotificationReceived (notification, payload) {
        // Log the received message
        Log.log(`${this.name} received a new message: ${JSON.stringify(payload)}`);

        // If the notification is to reset now
        if (notification == "RESET_NOW") {
            // Clear the inner HTML of the module body and custom header
            moduleBody.innerHTML = "";
	    moduleBody.style.height = 0;
            customHeader.innerHTML = "";
        }

        // If a new message is received
        if (notification == "NEW_MESSAGE_RECEIVED") {
            if (true) { //(payload.uniqueID || this.config.uniqueID == "") {
		    // If there's a message in the payload
	            if (payload.message || payload.message == "") {
	                // Log the application of the message
	                Log.log(`${this.name} applying message: ${payload.message}`);
	                // Set the inner HTML of the module body to the message
	                moduleBody.innerHTML = payload.message;
	                if (!payload.message) {
	                    moduleBody.style.height = 0;
	                } else {
	                    moduleBody.style.removeProperty("height");
	                }
	            }
	            // If there's a header message in the payload
	            if (payload.messageHeader) {
	                // Set the inner HTML of the custom header to the header message
	                customHeader.innerHTML = payload.messageHeader;
	                // Log the application of the header message
	                Log.log(`${this.name} applying message: ${payload.messageHeader}`);
	            }
	            if (payload.message == "/clear" || payload.message == "\\clear") { // if you forget which type of slash to use for the command...
	                // Clear the inner HTML of the module body and custom header
	                moduleBody.innerHTML = "";
	                moduleBody.style.height = 0;
	                customHeader.innerHTML = "";
	            }
		    if (payload.message == "\\clear") {
	                moduleBody.innerHTML = "";
	                moduleBody.style.height = 0;
	                customHeader.innerHTML = "";
	            }
	    }
        }
    }
});
