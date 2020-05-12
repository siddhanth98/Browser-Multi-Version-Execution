var socket;

window.onload = async function() {
    /*fetch("http://localhost:3000/sendDomChanges")
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            if (Object.keys(res).length > 0)
                reTriggerChanges(res);
        })
        .catch(err => err);*/

    // Create a socket connection with the server
    socket = io("http://localhost:3000/");
    socket.emit('helloFromDom2', 'dom2.1');
    socket.on('helloFromDom2', function(msg) {
        console.log(msg);
    });

    // Get DOM changes from socket endpoint
    socket.on('replayDomChange', function(jsonString) {
        console.log("Received changes");
        console.log(jsonString);
        reTriggerChanges(jsonString);
    });
};

function reTriggerChanges(changes) {
    // Retrigger changes on DOM elements
    console.log("From re-trigger changes");
    console.log(changes);
    let indexedModifiedElements = JSON.parse(changes);
    let keys = Object.keys(indexedModifiedElements);
    let elementToWatch = prompt("Which element to watch?");

    for (let i = 0; i < keys.length; i++) {
        let oldJson = indexedModifiedElements[keys[i]];

        if(oldJson["name"] === elementToWatch) {
            console.log("Found " + elementToWatch);
            let targetElement = document.getElementById(oldJson["id"]);
            let eventToTrigger = oldJson["eventType"];
            let elementToTrigger = document.getElementById(oldJson["eventTriggerID"]);

            let oldPrevMd5 = oldJson["oldMd5"];
            let newPrevMd5 = oldJson["newMd5"];

            // let oldCurrentMd5 = calcMD5(xml.serializeToString(targetElement)); calcMD5() is not there in this file
            if (/*oldPrevMd5 !== oldCurrentMd5*/false) {
                console.log(targetElement.nodeName.toLowerCase() + " old md5 value is not the same");
            } else {
                if (eventToTrigger === "change" && (elementToTrigger.getAttribute("type") === "radio"
                    || elementToTrigger.getAttribute("type") === "checkbox")) {
                    // If it is a radiobutton or a checkbox then explicitly change the "checked" attribute to true then
                    // trigger the event
                    $("#" + oldJson["eventTriggerID"]).attr("checked", true);
                }

                else if(elementToTrigger.getAttribute("type") === "text") {
                    elementToTrigger.value = oldJson["value"];
                    if(oldJson["handler"] !== undefined)
                        eval("(" + JSON.parse(oldJson["handler"]) + ")()");
                }
                console.log("Triggering " + eventToTrigger);
                $(elementToTrigger).trigger(eventToTrigger);
                // let newCurrentMd5 = calcMD5(xml.serializeToString(targetElement));

                /*if (newPrevMd5 !== newCurrentMd5)
                    console.log("Md5 of target element after event trigger has changed - " + newPrevMd5 + " " + newCurrentMd5);
                else
                    console.log("Md5 of target element after event trigger is the same");*/
            }
        }
    }
    return;
}

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


var slidUp = false;
var xml = new XMLSerializer();