import {CreateObject, nodes, eventHandlers} from "/genAnalyserModule.js";

let modifiedElements = []

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

export {modifiedElements, detectDomChange};