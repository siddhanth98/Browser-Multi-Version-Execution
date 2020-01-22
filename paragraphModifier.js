$("#divOriginal button").on("click", function() {
    if($("#divOriginal p").css("display") === "none") {
        // Modify the paragraph text
        setTimeout(function () {
            var paraText = $("#divOriginal p").text();
            paraText = paraText.toUpperCase();
            $("#divOriginal p").text(paraText);
        }, 0);
    }
});
