document.querySelector("#divOriginal button").addEventListener("click", function() {
    setTimeout(function() {
        var h1 = document.createElement("h1");
        h1.innerHTML = "Malicious Element";
        document.querySelector("body").append(h1);
    }, 1500);
});