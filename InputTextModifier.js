document.querySelector("#divOriginal button").addEventListener("click", function() {
    setTimeout(function() {
        var inp = document.querySelector("input");
        inp.value = "Malicious Text";
    }, 3000);
});