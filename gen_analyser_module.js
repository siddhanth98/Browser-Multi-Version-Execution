import { createTree } from "./CreateTree.js";
import { nodes } from "./CreateTree.js";
import { calcMD5 } from "./MD5.js";
import { detectDomChange } from "./detectDomChange.js";
import { modifiedElements } from "./detectDomChange.js"

var slidUp = false;
var xml = new XMLSerializer();
var domTreeInitial = xml.serializeToString(document.querySelector("html")); // using just "document" gives
// different md5's for different browsers
var index = 1;
var eventHandlers = {};


$("body").append("<input type = \"file\" id = \"file-input\">");
assignID(document.querySelector("html"));

setTimeout(function() {
    createTree(document.querySelector("html"));
}, 0);

function assignID(element) {
    if(element.children.length === 0 && (element.getAttribute("id") === null ||
        element.getAttribute("id").length === 0)) {
        element.setAttribute("id", index++);
    }
    else {
        if(element.getAttribute("id") === null || element.getAttribute("id").length === 0)
            element.setAttribute("id", index++);

        for(let i = 0 ; i < element.children.length; i++)
            assignID(element.children[i]);
    }
}


function dumpChangesInLocalStorage(modifiedElements) {
    for (let i = 0; i < modifiedElements.length; i++) {
        localStorage.setItem(modifiedElements[i].name, JSON.stringify(modifiedElements[i]));
    }
}

function dumpChangesToDisk(modifiedElements) {
    let jsonString = "";
    let elementIndex = 0;
    let indexedModifiedElements = {};

    for(let i = 0; i < modifiedElements.length; i++)
        indexedModifiedElements[elementIndex++] = modifiedElements[i];

    jsonString = JSON.stringify(indexedModifiedElements);

    var blob = new Blob([jsonString], {type:"text/plain; charset=utf-8"});
    saveAs(blob, "changes.txt");
}


document.querySelector("#file-input").addEventListener("change", function(e) {
    // Replays the events associated to a specific element in sequence
    let file = e.target.files[0];

    if(!file)
        return;

    let reader = new FileReader();
    reader.onload = function(e) {
        let contents = e.target.result.toString();
        let indexedModifiedElements = JSON.parse(contents);
        let keys = Object.keys(indexedModifiedElements);
        let elementToWatch = prompt("Which element to watch?");

        for (let i = 0; i < keys.length; i++) {
            let oldJson = indexedModifiedElements[keys[i]];

            if(oldJson["name"] === elementToWatch) {
                let targetElement = document.getElementById(oldJson["id"]);
                let eventToTrigger = oldJson["eventType"];
                let elementToTrigger = document.getElementById(oldJson["eventTriggerID"]);

                let oldPrevMd5 = oldJson["oldMd5"];
                let newPrevMd5 = oldJson["newMd5"];

                let oldCurrentMd5 = calcMD5(xml.serializeToString(targetElement));
                if (/*oldPrevMd5 !== oldCurrentMd5*/false) {
                    console.log(targetElement.nodeName.toLowerCase() + " old md5 value is not the same");
                } else {
                    if (eventToTrigger === "change" && (elementToTrigger.getAttribute("type") === "radio"
                        || elementToTrigger.getAttribute("type") === "checkbox")) {
                        // If it is a radiobutton or a checkbox then explicitly change the "checked" attribute to true then
                        // trigger the event
                        $("#" + oldJson["eventTriggerID"]).attr("checked", true);
                    }

                    $(elementToTrigger).trigger(eventToTrigger);
                    let newCurrentMd5 = calcMD5(xml.serializeToString(targetElement));

                    if (newPrevMd5 !== newCurrentMd5)
                        console.log("Md5 of target element after event trigger has changed - " + newPrevMd5 + " " + newCurrentMd5);
                    else
                        console.log("Md5 of target element after event trigger is the same");
                }
            }
        }
    };
    reader.readAsText(file);
});


function placeHandler(element, event) {
    $(element).on(event, function(e) {
        let triggerElement = $(element);
        let originalEventHandler;

        setTimeout(function () {
            originalEventHandler = e.handleObj.handler; // Capture the original event handler and store
            eventHandlers[triggerElement.attr("id")] = originalEventHandler;

            let currentDOM = xml.serializeToString(document.querySelector("html"));

            let oldDomMD5 = calcMD5(domTreeInitial);
            let currentDomMD5 = calcMD5(currentDOM);

            if (oldDomMD5 !== currentDomMD5) {

                // DOM Tree has changed, detect the element which has changed and store its details

                let oldNodes = nodes; // Save old/previous DOM node details
                createTree(document.querySelector("html"));

                // For input text boxes/areas, store values to be reinserted in the text boxes/areas
                detectDomChange(oldNodes, triggerElement, event);
                dumpChangesToDisk(modifiedElements);
                dumpChangesInLocalStorage(modifiedElements);
                domTreeInitial = currentDOM;
            }
        }, 50);
    });
}


/************************************** Get Jquery Event Handlers ***************************************************/
function getEvents(element) {
    if(element.children.length === 0) {
        let events = [];
        $.each($._data(element, "events"), function(i, event) {
            events.push(event);
        });
        if(events.length > 0) {
            events.forEach(event => {
                placeHandler(element, event[0]["type"]);
            });
        }
    }
    else {
        for (let i = 0; i < element.children.length; i++)
            getEvents(element.children[i]);
    }
}

$(function getEventsWrapper() {
    let bodyElement = document.querySelector("body");
    getEvents(bodyElement);
});

/***************************************************************** ***************************************************/




/********************************************** Get default javascript event handlers ********************************/
HTMLButtonElement.prototype.realAddEventListener = HTMLButtonElement.prototype.addEventListener;
HTMLButtonElement.prototype.addEventListener = function(event, handler, c) {
    this.realAddEventListener(event, handler);
    if (!handler.toString().includes("void"))
        placeHandler(this, event);
};

HTMLInputElement.prototype.realAddEventListener = HTMLInputElement.prototype.addEventListener;
HTMLInputElement.prototype.addEventListener = function(event, handler) {
    this.realAddEventListener(event, handler);
    if (!handler.toString().includes("void"))
        placeHandler(this, event);
};

/************************************************************ ********************************************************/


/*$("input").on("change", function(event) {
    let inputElement = $(this);
    let originalEventHandler;
    setTimeout(function() {
        originalEventHandler = event.handleObj.handler;
        console.log(originalEventHandler());
        // Convert following lines into a function
        let currentDOM = xml.serializeToString(document.querySelector("html"));

        if(calcMD5(domTreeInitial) !== calcMD5(currentDOM)) {
            let oldNodes = nodes;
            nodes = [];

            // If input is a radio button then change "checked" to true, store change
            // to preserve md5 value of the body

            if(inputElement.attr("type") === "radio" || inputElement.attr("type") === "checkbox")
                inputElement.attr("checked", true);

            createTree(document.querySelector("html"));

            /!*if(inputElement.attr("type") === "radio")
                inputElement.attr("checked", false);*!/

            detectDomChange(oldNodes, inputElement, "change");
            dumpChangesToDisk(modifiedElements);
            domTreeInitial = currentDOM;
        }
    }, 1000);
});*/

/* ************************** For testing purposes only (hardcoded element id's for simple page) ************************** */
document.querySelector("#modifier-button-1").addEventListener("click", function() {
    if (!slidUp) {
        /* Expected Change */
        // $("#divOriginal p").slideUp();
        $("#divOriginal p").text($("#divOriginal p").text().toString().toUpperCase());
        $(this).text("Slide Down");
        slidUp = true;
    } else {
        /* Expected Change */
        // $("#divOriginal p").slideDown();
        $("#divOriginal p").text($("#divOriginal p").text().toString().toLowerCase());
        $(this).text("Slide Up");
        slidUp = false;
    }
});

document.querySelector("#modifier-button-1").addEventListener("click", function() {
    console.log("2nd handler");
});

$("#modifier-button-2").on("click", function() {
    $("#divOriginal p").css("color", "white");
    $("#divOriginal p").css("backgroundColor", "blue");
});

document.querySelector("#input-1").addEventListener("change", function() {
    $("#divOriginal p").css("display", "none");
});

$("input[type = 'radio']").on("change", function() {
    let radioVal = $("input[type = 'radio']:checked").val();
    if(radioVal === "blue") {
        $("body").removeClass("bgRed");
        $("body").removeClass("bgGreen");
        $("body").addClass("bgBlue");
    }

    else if(radioVal === "red") {
        $("body").removeClass("bgBlue");
        $("body").removeClass("bgGreen");
        $("body").addClass("bgRed");
    }

    else if(radioVal === "green") {
        $("body").removeClass("bgBlue");
        $("body").removeClass("bgRed");
        $("body").addClass("bgGreen");
    }
});

$("input[type = 'checkbox']").on("change", function() {
    let checkVal = $("input[type = 'checkbox']:checked").map(function() {
        return $(this).val();
    }).get();

    $("#newHeader").html(checkVal.join());
});