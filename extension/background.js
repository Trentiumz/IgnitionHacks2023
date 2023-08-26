let url = window.location.href;
let id = url.substring(
  url.lastIndexOf("-") == -1
    ? url.lastIndexOf("/") + 1
    : url.lastIndexOf("-") + 1,
  url.indexOf("?") == -1 ? url.length : url.indexOf("?")
);

const render = () => {
  var topbar = document.getElementsByClassName("notion-topbar-action-buttons").item(0);
  var lightMode = document.getElementsByClassName("notion-cursor-listener").item(0).style.backgroundColor === "white";
  var button = document.createElement("button");
  button.className = "gnostic-button";
  button.innerHTML = `<img src="${chrome.runtime.getURL(lightMode ? "logo_black.png" : "logo.png")}" width="120" height="30">`;
  button.style.position = "relative";
  button.style.backgroundColor = "transparent";
  button.style.border = "none";
  button.style.marginRight = "10px";
  button.style.marginTop = "4px";
  topbar.prepend(button);
  button.addEventListener("click", async function () {
    button.innerHTML = `<img src="${chrome.runtime.getURL(lightMode ? "loading_black.gif" : "loading.gif")}" width="120" height="80">`;
    button.style.marginTop = "4px";
    console.log(id);
    await fetch(`http://localhost:3000/generatequiz/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        "link": url,
      }
    }).then((response) => {
        console.log(response);
        button.innerHTML = `<img src="${chrome.runtime.getURL(lightMode ? "logo_black.png" : "logo.png")}" width="120" height="30">`;
        button.style.marginTop = "4px";
        let popup = document.createElement("div");
        popup.innerHTML = response.status === 200 ? "Successfully generated quiz!" : "Failed to generate quiz.";
        popup.style.position = "absolute";
        popup.style.top = window.innerHeight-100+"px";
        popup.style.left = window.innerWidth/2-50+"px";
        popup.style.width = "220px";
        popup.style.height = "65px";
        popup.style.backgroundColor = "#5891ed";
        popup.style.padding = "10px";
        popup.style.borderRadius = "10px";
        popup.style.color = "white";
        popup.style.fontFamily = "Helvetica";
        popup.style.fontSize = "16px";
        popup.style.fontWeight = "bold";
        popup.style.boxShadow = "0px 5px 10px rgba(0,0,0,0.5)";
        popup.style.textAlign = "center";
        let contain = document.getElementsByClassName("notion-overlay-container").item(0);
        contain.appendChild(popup);
        setTimeout(function() {
            popup.remove();
        }, 3000);
    }).catch((error) => {
        console.log(error);
        button.innerHTML = `<img src="${chrome.runtime.getURL(lightMode ? "logo_black.png" : "logo.png")}" width="120" height="30">`;
        button.style.marginTop = "4px";
        let popup = document.createElement("div");
        popup.innerHTML = "Failed to generate quiz.";
        popup.style.position = "absolute";
        popup.style.top = window.innerHeight-100+"px";
        popup.style.left = window.innerWidth/2-50+"px";
        popup.style.width = "220px";
        popup.style.height = "65px";
        popup.style.backgroundColor = "#5891ed";
        popup.style.padding = "10px";
        popup.style.borderRadius = "10px";
        popup.style.color = "white";
        popup.style.fontFamily = "Helvetica";
        popup.style.fontSize = "16px";
        popup.style.fontWeight = "bold";
        popup.style.boxShadow = "0px 5px 10px rgba(0,0,0,0.5)";
        popup.style.textAlign = "center";
        let contain = document.getElementsByClassName("notion-overlay-container").item(0);
        contain.appendChild(popup);
        setTimeout(function() {
            popup.remove();
        }, 3000);
    });
  });
};

const wait = () => {
  if (document.getElementsByClassName("notion-topbar-action-buttons").item(0)) {
    render();
  } else {
    setTimeout(wait, 200);
  }
};

wait();