// To be run first, gets the settings and applies them to the html.

const userAgents = {
    default: "SafeLink Redirect Checker 1.0",
    browser: window.navigator.userAgent,
};

document.querySelector("#user-agent-dropdown > option:nth-child(2)").innerText =
    window.navigator.userAgent;

const filteredDomainsList = document.querySelector(".filtered-domains-list");

let domains;

chrome.storage.sync.get(["UserAgent", "FilteredDomains"], (data) => {
    // Handle domains already filtered
    domains = data["FilteredDomains"];
    data["FilteredDomains"].forEach((obj) => {
        const li = document.createElement("li");
        li.innerText = obj;
        li.dataset.url = obj;
        filteredDomainsList.appendChild(li);
    });
});

var addedFilteredDomains = [];

const userAgentDropdown = document.querySelector("#user-agent-dropdown");

const addFilteredDomainButton = document.querySelector(
    ".filtered-domains-container .list-buttons #add-button"
);
const removeFilteredDomainButton = document.querySelector(
    ".filtered-domains-container .list-buttons #remove-button"
);

const saveButton = document.querySelector("#save-button");

addFilteredDomainButton.onclick = function() {
    const domain = prompt(
        `Enter the domain you want to add. Unless you want to target a specific sub-domain, do not put the "http(s)://www." part. \nFor example: "google.com"`
    );
    if (domain == null) return;
    domains.push(domain.toLowerCase());
    const li = document.createElement("li");
    li.innerText = domain;
    li.dataset.url = domain.toLowerCase();
    filteredDomainsList.appendChild(li);
};

removeFilteredDomainButton.onclick = function() {
    const domain = prompt("Enter the domain you want to remove.");
    if (domain == null) return;
    domains = domains.filter((obj) => obj !== domain.toLowerCase());

    const li = document.querySelector(`li[data-url="${domain.toLowerCase()}"]`);
    if (li != null) li.remove();
};

saveButton.onclick = function() {
    chrome.storage.sync.get("FilteredDomains", (data) => {
        chrome.storage.sync.set({
            FilteredDomains: domains,
            UserAgent: userAgents[userAgentDropdown.value],
        });
        alert("Success!");
    });
};