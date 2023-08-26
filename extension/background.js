let url = window.location.href;
let id = url.substring(url.lastIndexOf('-') == -1 ? url.lastIndexOf('/') + 1 : url.lastIndexOf('-') + 1, id.indexOf('?') == -1 ? url.length : url.indexOf('?'));

if(document.querySelector("div[id='notion-app']")) {
    var button = document.createElement("button");
    button.innerHTML = "Gnostic";
    document.getElementById("notion-topbar-action-buttons").appendChild(button);
}

button.addEventListener ("click", async function() {
    await fetch('https://ignitionhacks2023.danielye6.repl.co/generatequiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "id": id
        })
    });
});