var slidUp = false;
var xml = new XMLSerializer();
var domTreeInitial = xml.serializeToString(document.querySelector("html")); // using just "document" gives
                                                                                    // different md5's for different browsers
var modifiedElements = [];
var index = 1;
var nodes = [];

$("body").append("<button id = 'triggerButton'> Trigger </button>");
$("body").append("<input type = \"file\" id = \"file-input\">");
assignID(document.querySelector("html"));

setTimeout(function() {
    createTree(document.querySelector("html"));
}, 0);

function assignID(element) {
    if(element.children.length === 0 && (element.getAttribute("id") === null ||
        element.getAttribute("id").length === 0))
        element.setAttribute("id", index++);

    else {
        if(element.getAttribute("id") === null || element.getAttribute("id").length === 0)
            element.setAttribute("id", index++);

        for(let i = 0 ; i < element.children.length; i++)
            assignID(element.children[i]);
    }
}

function calcMD5(string) {
    function rotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function addUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function f(x,y,z) { return (x & y) | ((~x) & z); }
    function g(x,y,z) { return (x & z) | (y & (~z)); }
    function h(x,y,z) { return (x ^ y ^ z); }
    function i(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    }

    function wordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    }

    function utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    string = utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=addUnsigned(a,AA);
        b=addUnsigned(b,BB);
        c=addUnsigned(c,CC);
        d=addUnsigned(d,DD);
    }
    var temp = wordToHex(a)+wordToHex(b)+wordToHex(c)+wordToHex(d);
    return temp.toLowerCase();
}

function CreateObject(nodeName, cls, id, eventType, eventTriggerID, oldMd5Val, newMd5Val) {
    this.name = nodeName.toLowerCase();
    this.class = cls;
    this.id = id;
    this.eventType = eventType;
    this.eventTriggerID = eventTriggerID;
    this.oldMd5 = oldMd5Val;
    this.newMd5 = newMd5Val;
}

function Node(element) {
    this.name = element.nodeName.toLowerCase();
    this.classList = element.classList;

    // Set an id for the element and store it for uniquely getting the md5 value later
    /*if(element.id === undefined || element.id.length === 0)
        element.setAttribute("id", (index++));*/
    this.id = element.id;
    this.children = element.children;
    if(element.nodeName.toLowerCase() === "input" || element.nodeName.toLowerCase() === "textarea")
        this.value = element.value;
    this.md5 = calcMD5(xml.serializeToString(element));
    nodes.push(this);

}

/* Create a tree resembling the DOM Tree, calculate and store the md5 of each dom node in the tree to detect changes later */
function createTree(element) {
    if(element.children.length === 0)
        new Node(element);

    else {
        for (let i = 0; i < element.children.length; i++)
            createTree(element.children[i]);
        new Node(element);
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

function detectDomChange(oldNodes, eventTrigger, eventType) {
    let modifiedElement;
    let found = false;
    for(let i = 0; i < nodes.length; i++) {
        for(let j = 0; j < oldNodes.length; j++) {

            if(oldNodes[j].id === nodes[i].id && oldNodes[j].md5 !== nodes[i].md5) {
                found = true; // Found the modified node/element

                if(eventType === "click") {
                    modifiedElement = new CreateObject(oldNodes[j].name, oldNodes[j].classList, oldNodes[j].id,
                        eventType, eventTrigger.attr("id"), oldNodes[j].md5, nodes[i].md5);
                    modifiedElements.push(modifiedElement);
                }

                else if(eventType === "change") {
                    modifiedElement = new CreateObject(oldNodes[j].name, oldNodes[j].classList, oldNodes[j].id,
                        eventType, eventTrigger.attr("id"), oldNodes[j].md5, nodes[i].md5);
                    modifiedElement["oldVal"] = oldNodes[j].value;
                    modifiedElement["newVal"] = nodes[i].value;
                    modifiedElements.push(modifiedElement);
                }

                break;
            }
            else if(oldNodes[j].id === nodes[i].id)
                // Node has been found but the md5 value did not change
                found = true;
        }

        if(!found) {
            // Save details of new element added in the JS object
            modifiedElement = new CreateObject(nodes[i].name, nodes[i].classList, nodes[i].id,
                eventType, eventTrigger.attr("id"), nodes[i].md5, nodes[i].md5);
            modifiedElements.push(modifiedElement);
        }
        found = false;
    }
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
                if (oldPrevMd5 !== oldCurrentMd5) {
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

$("button").on("click", function() {
    let buttonClicked = $(this);

    setTimeout(function() {
        let currentDOM = xml.serializeToString(document.querySelector("html"));

        if(calcMD5(domTreeInitial) !== calcMD5(currentDOM)) {

            // DOM Tree has changed, detect the element which has changed
            let oldNodes = nodes; // Save old/previous DOM node details
            nodes = [];
            createTree(document.querySelector("html"));

            detectDomChange(oldNodes, buttonClicked, "click");
            dumpChangesToDisk(modifiedElements);
            domTreeInitial = currentDOM;
        }
    }, 1000);
});

$("input").on("change", function() {
    let inputElement = $(this);

    setTimeout(function() {
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

            /*if(inputElement.attr("type") === "radio")
                inputElement.attr("checked", false);*/

            detectDomChange(oldNodes, inputElement, "change");
            dumpChangesToDisk(modifiedElements);
            domTreeInitial = currentDOM;
        }
    }, 1000);
});

/* ************************** For testing purposes only (hardcoded element id's for simple page) ************************** */
$("#modifier-button-1").on("click", function() {
    if(!slidUp) {
        /* Expected Change */
        // $("#divOriginal p").slideUp();
        $("#divOriginal p").text($("#divOriginal p").text().toString().toUpperCase());
        $(this).text("Slide Down");
        slidUp = true;
    }

    else {
        /* Expected Change */
        // $("#divOriginal p").slideDown();
        $("#divOriginal p").text($("#divOriginal p").text().toString().toLowerCase());
        $(this).text("Slide Up");
        slidUp = false;
    }
});

$("#modifier-button-2").on("click", function() {
    $("#divOriginal p").css("color", "white");
    $("#divOriginal p").css("backgroundColor", "blue");
});

$("#input-1").on("change", function() {
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