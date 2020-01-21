
var slidUp = false;
var xml = new XMLSerializer();
var paraInitial = document.querySelector("#divOriginal p");
var paraInitialContent = paraInitial.innerText;
var inputTextInitial = document.querySelector("#inp1");
var inputTextInitialContent = inputTextInitial.textContent;
var modifiedElements = [];

function CreateObject(nodeName, cls, id, oldContent, newContent, eventType, eventTrigger) {
    this.name = nodeName.toLowerCase();
    this.class = cls;
    this.id = id;
    this.oldContent = oldContent;
    this.newContent = newContent;
    this.eventType = eventType;
    this.eventTrigger = eventTrigger;
}

function alertMessage(eventType, eventTrigger, oldContent, newContent) {
    alert(eventType + " on " + eventTrigger + " changed \n\n" +
        (oldContent === "" ? "\"\"" : oldContent) + " \n to \n" + (newContent === "" ? "\"\"" : newContent));
}

/* Button Click Event */
$("#divOriginal button").on("click", function() {
    var thisButton = $(this);
    console.log(thisButton);

    if(!slidUp) {
        /* Expected Change */
        $("#divOriginal p").slideUp();
        $(this).text("Slide Down");
        slidUp = true;
    }

    else {
        /* Expected Change */
        $("#divOriginal p").slideDown();
        $(this).text("Slide Up");

        slidUp = false;

        setTimeout(function() {
            var paraNew = document.querySelector("#divOriginal p");
            var paraNewContent = paraNew.innerText;

            if(paraInitialContent !== paraNewContent) {
                var paragraphObject = new CreateObject(paraNew.nodeName, paraNew.classList, paraNew.id, paraInitialContent, paraNewContent,
                    "click", thisButton.text());
                modifiedElements.push(paragraphObject);
                paraInitialContent = paraNewContent;
                /*alert(paragraphObject.eventType + " on " + paragraphObject.eventTrigger + " changed \n\n" +
                    paragraphObject.oldContent + " \n to \n" + paragraphObject.newContent);*/
                alertMessage(paragraphObject.eventType, paragraphObject.eventTrigger, paragraphObject.oldContent, paragraphObject.newContent);

                /* Store changes detected in an element in a json file with element details like class names, id, old content, modified
                * content, events triggering the changes and so on. */

                /* Save changes in a text file */
                /*setTimeout(function() {
                    $("body").append("<script type=\"text/javascript\">\n" +
                        "            var blob = new Blob([\"File Changed \"], {type: \"text/plain;charset=utf-8\"});\n" +
                        "            saveAs(blob, \"fileChange.txt\");\n" +
                        "    </script>");
                }, 500);*/
            }
        }, 1000);

    }
});

/* Input Text Box Event */
$("input").on("change", function() {
    var inputTextNew = $(this), inputTextNewContent = inputTextNew.val();

    if(inputTextInitialContent !== inputTextNewContent) {
        var inputTextObject = new CreateObject(inputTextNew.prop("tagName"), inputTextNew.classList, inputTextNew.id, inputTextInitialContent,
            inputTextNewContent, "change", inputTextNew.prop("tagName"));

        inputTextInitialContent = inputTextNewContent;
        modifiedElements.push(inputTextObject);
        alertMessage(inputTextObject.eventType, inputTextObject.eventTrigger, inputTextObject.oldContent, inputTextObject.newContent);
    }
});