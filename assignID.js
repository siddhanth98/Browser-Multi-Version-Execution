let index = 1;

function assignID(element) {
    if(element.children.length === 0 && (element.getAttribute("id") === null ||
        element.getAttribute("id").length === 0)) {
        // No default ID exists for the DOM element,
        element.setAttribute("id", index++);
    }
    else {
        if(element.getAttribute("id") === null || element.getAttribute("id").length === 0)
            element.setAttribute("id", index++);

        for(let i = 0 ; i < element.children.length; i++)
            assignID(element.children[i]);
    }
}

export default assignID;