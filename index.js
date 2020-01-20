
var slidUp = false;
var xml = new XMLSerializer();
var paraInitial = document.querySelector("#divOriginal p");
var paraInitialContent = paraInitial.innerText;

/* Slide Up Change */
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
                var paragraphObject = {
                    class : paraNew.classList,
                    id : paraNew.id,
                    oldContent : paraInitialContent,
                    newContent : paraNewContent,
                    eventType : "click",
                    eventTrigger : thisButton.text()
                };

                alert(paragraphObject.eventType + " on " + paragraphObject.eventTrigger + " changed \n\n" +
                    paragraphObject.oldContent + " \n to \n" + paragraphObject.newContent);

                /* Store changes detected in an element in a json file with element details like class names, id, old content, modified
                * content, events triggering the changes and so on. */


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


$("input").on("change", function() {
    alert("You changed some input text boxes");
});