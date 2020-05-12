import {Node} from "/genAnalyserModule.js";

function createTree(element) {
    if(element.children.length === 0)
        new Node(element);

    else {
        for (let i = 0; i < element.children.length; i++)
            createTree(element.children[i]);
        new Node(element);
    }
}

export {createTree};