import assignID from "/assignID.js";
import {createTree} from "/createTree.js";
import calcMD5 from "/MD5.js";
import {modifiedElements, detectDomChange} from "/detectStoreDomChanges.js";

let slidUp = false;
let xml = new XMLSerializer();
let nodes = [];
let domTreeInitial = xml.serializeToString(document.querySelector("html")); // using just "document" gives
// different md5's for different browsers
let eventHandlers = {};
let socket;

function CreateObject(nodeName, cls, id, eventType, eventTriggerID, oldMd5Val, newMd5Val) {
    // Change Object (Will be stored as the json object to be sent to the server)
    this.name = nodeName.toLowerCase();
    this.class = cls;
    this.id = id;
    this.eventType = eventType;
    this.eventTriggerID = eventTriggerID;
    this.oldMd5 = oldMd5Val;
    this.newMd5 = newMd5Val;
}

function Node(element) {
    // DOM Tree Node
    this.name = element.nodeName.toLowerCase();
    this.classList = element.classList;

    this.id = element.id;
    this.children = element.children;
    this.value = element.value;
    this.md5 = calcMD5(xml.serializeToString(element));
    nodes.push(this);
}

assignID(document.querySelector("html"));
console.log("Assigned module id");
// storeEvents(document.querySelector("html"));

window.onload = function() {
    socket = io("http://localhost:3000/");
    socket.emit('helloFromDom1', 'dom1');
    console.log('Sent hellooo.. message to server socket');
    socket.on('helloFromDom1', function(msg){
        console.log(msg);
    });
}

setTimeout(function() {
    createTree(document.querySelector("html"));
}, 0);


function sendChangesToServer(modifiedElements) {
    let jsonString = "";
    let elementIndex = 0;
    let indexedModifiedElements = {};

    for (let i = 0; i < modifiedElements.length; i++) {
        indexedModifiedElements[elementIndex++] = modifiedElements[i];
    }

    jsonString = JSON.stringify(indexedModifiedElements);
    socket.emit('DomChange', jsonString);
}

$("input").on("change", function() {
    if($(this).attr("type") === "text") {
        let value = this.value;
        let md5Val = calcMD5(xml.serializeToString(this));
        let modifiedElement = new CreateObject("input", this.classList, $(this).attr("id"),
            "change", $(this).attr("id"), md5Val, md5Val);
        modifiedElement["value"] = value;
        modifiedElement["handler"] = eventHandlers[$(this).attr("id")];
        modifiedElements.push(modifiedElement);
    }

    else {
        let md5Val = calcMD5(xml.serializeToString(this));
        let modifiedElement = new CreateObject("input", this.classList, $(this).attr("id"),
            "change", $(this).attr("id"), md5Val, md5Val);
        modifiedElement["handler"] = eventHandlers[$(this).attr("id")];
        modifiedElements.push(modifiedElement);
    }
    sendChangesToServer(modifiedElements);
});

function placeHandler(element, event) {

    $(element).on(event, function (e) {
        let triggerElement = $(element);
        let originalEventHandler;

        setTimeout(function () {
            originalEventHandler = e.handleObj.handler; // Capture the original event handler and store

            let currentDOM = xml.serializeToString(document.querySelector("html"));

            let oldDomMD5 = calcMD5(domTreeInitial);
            let currentDomMD5 = calcMD5(currentDOM);
            if (oldDomMD5 !== currentDomMD5) {

                // DOM Tree has changed, detect the element which has changed and store its details

                let oldNodes = nodes; // Save old/previous DOM node details
                nodes = [];
                createTree(document.querySelector("html"));

                // For input text boxes/areas, store values to be reinserted in the text boxes/areasetc
                detectDomChange(oldNodes, triggerElement, event);
                sendChangesToServer(modifiedElements);
                domTreeInitial = currentDOM;
            }
        }, 0);
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
HTMLButtonElement.prototype.addEventListener = function(event, handler) {
    this.realAddEventListener(event, handler);
    if (!handler.toString().includes("void")) {
        eventHandlers[this.getAttribute("id")] = handler;
        placeHandler(this, event);
    }
};

HTMLInputElement.prototype.realAddEventListener = HTMLInputElement.prototype.addEventListener;
HTMLInputElement.prototype.addEventListener = function(event, handler) {
    this.realAddEventListener(event, handler);
    if (!handler.toString().includes("void")) {
        eventHandlers[this.getAttribute("id")] = handler;
        placeHandler(this, event);
    }
};

HTMLDocument.prototype.realAddEventListener = HTMLDocument.prototype.addEventListener;
HTMLDocument.prototype.addEventListener = function(event, handler) {
    this.realAddEventListener(event, handler);
    if (!handler.toString().includes("void")) {
        eventHandlers[this.getAttribute("id")] = handler;
        placeHandler(this, event);
    }
};
/************************************************************ ********************************************************/


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

/*document.querySelector("#input-1").addEventListener("change", function() {
    $("#divOriginal p").css("display", "none");
});*/

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

export {CreateObject, Node, nodes, eventHandlers};