var request = window.indexedDB.open("testDB1", 3);
var db, objStore;

var nodeData  = [
    {
        id : "1",
        nodeName : "p",
        classes : "pClass"
    },

    {
        id : "2",
        nodeName : "p",
        classes : "pClass"
    }
];

request.onerror = function(event) {
    console.log("Error in opening the database");
};

request.onsuccess = function(event) {
    console.log("Success");
    db = event.target.result; // Save db object in case of success
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    objStore = db.createObjectStore("testStore", {keyPath : "id"});

    objStore.createIndex("nodeName", "nodeName", { unique : false });
    objStore.createIndex("classes", "classes", { unique : false} );

    objStore.transaction.oncomplete = function(event) {
        var nodeStore = db.transaction("testStore", "readwrite").objectStore("testStore");
        nodeData.forEach(function(node) {
           nodeStore.add(node);
        });
    }
};

function readData(storeName) {
    objStore = db.transaction(["testStore"], "readwrite").objectStore("testStore");
    var request = objStore.get("1");
    request.onsuccess = function(event) {
        console.log(request.result.id + " " + request.result.nodeName + " " + request.result.classes);
    }
}

readData("testStore");
