
var slidUp = false;
var xml = new XMLSerializer();
var paraInitial = xml.serializeToString(document.querySelector("#divOriginal p"));

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

        var paraNew = xml.serializeToString(document.querySelector("#divOriginal p"));
        if(paraInitial !== paraNew) {
            setTimeout(function() {
                alert("Something changed");
            }, 500);
        }
    }
});


$("input").on("change", function() {
    alert("You changed some input text boxes");
});