
var slidUp = false;
var xml = new XMLSerializer();
var paraInitial = document.querySelector("#divOriginal p").innerHTML;

/* Slide Up Change */
$("#divOriginal button").on("click", function() {
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
            var paraNew = document.querySelector("#divOriginal p").innerHTML;
            if(paraInitial !== paraNew) {
                console.log("Changed");
                setTimeout(function() {
                    $("body").append("<script type=\"text/javascript\">\n" +
                        "            var blob = new Blob([\"File Changed \"], {type: \"text/plain;charset=utf-8\"});\n" +
                        "            saveAs(blob, \"fileChange.txt\");\n" +
                        "    </script>");
                }, 500);
            }
        }, 0);

    }
});


$("input").on("change", function() {
    alert("You changed some input text boxes");
});