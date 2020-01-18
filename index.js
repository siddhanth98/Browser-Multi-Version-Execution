
var slidUp = false;
var xml = new XMLSerializer();

$("#divOriginal button").on("click", function() {
    if(!slidUp) {
        $("#divOriginal p").slideUp();
        $(this).text("Slide Down");
        slidUp = true;
    }

    else {
        $("#divOriginal p").slideDown();
        $(this).text("Slide Up");
        $("#divOriginal p").text("Modified Text. Better Take Care");
        slidUp = false;
    }
});