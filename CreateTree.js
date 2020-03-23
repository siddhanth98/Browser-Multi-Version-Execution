import { calcMD5 } from "./MD5.js";

var xml = new XMLSerializer();
var nodes = [];

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

export { createTree };
export { nodes };