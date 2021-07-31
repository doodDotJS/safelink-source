const settingsButton = document.querySelector(".settings-button");

chrome.runtime.sendMessage("is-working", (response) => {
    const statusLabel = document.querySelector("label.status");
    if (response[0] == false) {
        statusLabel.innerText = `Status: Error "${response[1]}"`;
    }
});

settingsButton.onclick = function() {
    chrome.tabs.create({
        url: "settings-stuff/index.html",
    });
};