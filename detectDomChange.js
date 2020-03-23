import {nodes} from "./CreateTree.js";
var modifiedElements = [];

function CreateObject(nodeName, cls, id, eventType, eventTriggerID, oldMd5Val, newMd5Val) {
    this.name = nodeName.toLowerCase();
    this.class = cls;
    this.id = id;
    this.eventType = eventType;
    this.eventTriggerID = eventTriggerID;
    this.oldMd5 = oldMd5Val;
    this.newMd5 = newMd5Val;
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

export { modifiedElements };
export { detectDomChange };
