
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.FileSaver = mod.exports;
    }
})(this, function () {
    "use strict";

    /*
    * FileSaver.js
    * A saveAs() FileSaver implementation.
    *
    * By Eli Grey, http://eligrey.com
    *
    * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
    * source  : http://purl.eligrey.com/github/FileSaver.js
    */
    // The one and only way of getting global scope in all environments
    // https://stackoverflow.com/q/3277182/1008999
    var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;

    function bom(blob, opts) {
        if (typeof opts === 'undefined') opts = {
            autoBom: false
        };else if (typeof opts !== 'object') {
            console.warn('Deprecated: Expected third argument to be a object');
            opts = {
                autoBom: !opts
            };
        } // prepend BOM for UTF-8 XML and text/* types (including HTML)
        // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF

        if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
            return new Blob([String.fromCharCode(0xFEFF), blob], {
                type: blob.type
            });
        }

        return blob;
    }

    function download(url, name, opts) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';

        xhr.onload = function () {
            saveAs(xhr.response, name, opts);
        };

        xhr.onerror = function () {
            console.error('could not download file');
        };

        xhr.send();
    }

    function corsEnabled(url) {
        var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker

        xhr.open('HEAD', url, false);

        try {
            xhr.send();
        } catch (e) {}

        return xhr.status >= 200 && xhr.status <= 299;
    } // `a.click()` doesn't work for all browsers (#465)


    function click(node) {
        try {
            node.dispatchEvent(new MouseEvent('click'));
        } catch (e) {
            var evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
            node.dispatchEvent(evt);
        }
    }

    var saveAs = _global.saveAs || ( // probably in some web worker
        typeof window !== 'object' || window !== _global ? function saveAs() {}
            /* noop */
            // Use download attribute first if possible (#193 Lumia mobile)
            : 'download' in HTMLAnchorElement.prototype ? function saveAs(blob, name, opts) {
                var URL = _global.URL || _global.webkitURL;
                var a = document.createElement('a');
                name = name || blob.name || 'download';
                a.download = name;
                a.rel = 'noopener'; // tabnabbing
                // TODO: detect chrome extensions & packaged apps
                // a.target = '_blank'

                if (typeof blob === 'string') {
                    // Support regular links
                    a.href = blob;

                    if (a.origin !== location.origin) {
                        corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
                    } else {
                        click(a);
                    }
                } else {
                    // Support blobs
                    a.href = URL.createObjectURL(blob);
                    setTimeout(function () {
                        URL.revokeObjectURL(a.href);
                    }, 4E4); // 40s

                    setTimeout(function () {
                        click(a);
                    }, 0);
                }
            } // Use msSaveOrOpenBlob as a second approach
            : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
                    name = name || blob.name || 'download';

                    if (typeof blob === 'string') {
                        if (corsEnabled(blob)) {
                            download(blob, name, opts);
                        } else {
                            var a = document.createElement('a');
                            a.href = blob;
                            a.target = '_blank';
                            setTimeout(function () {
                                click(a);
                            });
                        }
                    } else {
                        navigator.msSaveOrOpenBlob(bom(blob, opts), name);
                    }
                } // Fallback to using FileReader and a popup
                : function saveAs(blob, name, opts, popup) {
                    // Open a popup immediately do go around popup blocker
                    // Mostly only available on user interaction and the fileReader is async so...
                    popup = popup || open('', '_blank');

                    if (popup) {
                        popup.document.title = popup.document.body.innerText = 'downloading...';
                    }

                    if (typeof blob === 'string') return download(blob, name, opts);
                    var force = blob.type === 'application/octet-stream';

                    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;

                    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

                    if ((isChromeIOS || force && isSafari) && typeof FileReader === 'object') {
                        // Safari doesn't allow downloading of blob URLs
                        var reader = new FileReader();

                        reader.onloadend = function () {
                            var url = reader.result;
                            url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            if (popup) popup.location.href = url;else location = url;
                            popup = null; // reverse-tabnabbing #460
                        };

                        reader.readAsDataURL(blob);
                    } else {
                        var URL = _global.URL || _global.webkitURL;
                        var url = URL.createObjectURL(blob);
                        if (popup) popup.location = url;else location.href = url;
                        popup = null; // reverse-tabnabbing #460

                        setTimeout(function () {
                            URL.revokeObjectURL(url);
                        }, 4E4); // 40s
                    }
                });
    _global.saveAs = saveAs.saveAs = saveAs;

    if (typeof module !== 'undefined') {
        module.exports = saveAs;
    }
});


var slidUp = false;
var xml = new XMLSerializer();
var domTreeInitial = xml.serializeToString(document.querySelector("html")); // using just "document" gives
                                                                                    // different md5's for different browsers
var modifiedElements = [];
var index = 1;
var nodes = [];
var eventHandlers = {};
var socket;

$("body").append("<button id = 'triggerButton'> Trigger </button>");
$("body").append("<input type = \"file\" id = \"file-input\">");
assignID(document.querySelector("html"));
// storeEvents(document.querySelector("html"));

window.onload = function() {
    socket = io("http://localhost:3000/");
    socket.emit('helloFromDom1', 'dom1');
    console.log('Sent hello message to server socket');
    socket.on('helloFromDom1', function(msg){
        console.log(msg);
    });
}

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

function Node(element) {
    this.name = element.nodeName.toLowerCase();
    this.classList = element.classList;

    // Set an id for the element and store it for uniquely getting the md5 value later
    /*if(element.id === undefined || element.id.length === 0)
        element.setAttribute("id", (index++));*/
    this.id = element.id;
    this.children = element.children;
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

let divs = document.getElementsByTagName("div");

for (let i = 0; i < divs.length; i++)
    placeHandler(divs[i], "click");

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


function dumpChangesToDisk(modifiedElements) {

    let jsonString = "";
    let elementIndex = 0;
    let indexedModifiedElements = {};

    for (let i = 0; i < modifiedElements.length; i++) {
        indexedModifiedElements[elementIndex++] = modifiedElements[i];
    }

    jsonString = JSON.stringify(indexedModifiedElements);
    // console.log(jsonString);

    // let storeChanges = prompt("Store this change?");

    /*fetch("http://localhost:3000/getDomChanges", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({input: jsonString})
    })
        .then((res) => {
            console.log("Sent the changes");
            return res.text();
        })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.error(err);
        });*/

    // Send json to socket endpoint
    socket.emit('DomChange', jsonString);

    /*fetch("http://localhost:3000/", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Accept": "application/json, text/plain, *!/!*",
            "Content-Type": "application/json, text/plain",
            "Access-Control-Allow-Origin": "*"
        },
        body: jsonString
    })
        .then((response) => {
            console.log(response.text());
            return response.text();
        })
        .then((response) => {
            console.log(response);
        })
    .catch((err) => {
        console.error(err);
    });*/

    /*var blob = new Blob([jsonString], {type: "text/plain; charset=utf-8"});
    saveAs(blob, "changes.txt");*/
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

                    if(eventTrigger.attr("type") === "text") {
                        if(eventHandlers[eventTrigger.attr("id")] !== undefined)
                            modifiedElement["handler"] = JSON.stringify((eventHandlers[eventTrigger.attr("id")]).toString());
                        modifiedElement["value"] = eventTrigger.val();
                    }

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

$("#triggerButton").on("click", function() {
    fetch("http://localhost:3000/sendDomChanges")
        .then((res) => res.json())
        .then((res) => {
            if (Object.keys(res).length > 0)
                reTriggerChanges(res);
        })
});

function reTriggerChanges(changes) {
    let indexedModifiedElements = changes;
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

                $(elementToTrigger).trigger(eventToTrigger);
                // let newCurrentMd5 = calcMD5(xml.serializeToString(targetElement));

                /*if (newPrevMd5 !== newCurrentMd5)
                    console.log("Md5 of target element after event trigger has changed - " + newPrevMd5 + " " + newCurrentMd5);
                else
                    console.log("Md5 of target element after event trigger is the same");*/
            }
        }
    }
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
    dumpChangesToDisk(modifiedElements);
});


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

                    else if(elementToTrigger.getAttribute("type") === "text") {
                         elementToTrigger.value = oldJson["value"];
                         if(oldJson["handler"] !== undefined)
                            eval("(" + JSON.parse(oldJson["handler"]) + ")()");
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
                dumpChangesToDisk(modifiedElements);
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
