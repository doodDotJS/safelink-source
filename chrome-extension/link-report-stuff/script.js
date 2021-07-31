const headingColors = {
    SAFE: "#b9f85b",
    UNSAFE: "#FE4A49",
    USER_SET: "#FED766",
};
const linkStatusDescs = {
    SAFE: "This link seems to be safe to click. Check the redirect history in case though.",
    UNSAFE: "Be careful, this link seems dangerous. Check the redirects to check if it's a false positive.",
    USER_SET: "You have set this link to be filtered and be flagged as unsafe. Check the redirects in case of a false positive.",
};

const titleATag = document.querySelector(".heading a");
const mainHeader = document.querySelector("main .header");
const linkStatus = document.querySelector("#link-status");
const linkStatusDesc = document.querySelector("#link-status-desc");
const amountOfRedirects = document.querySelector("#amount-of-redirects");
const redirectPathContainer = document.querySelector(".redirect-path");

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.purpose == "generate-link-report") {
        titleATag.innerText = message.data.url;
        titleATag.href = message.data.url;
        if (message.data.filterStatus.isFiltered === true) {
            if (message.data.filterStatus.userSet == true) {
                mainHeader.style.backgroundColor = headingColors.USER_SET;
                linkStatus.innerText = "User filtered";
                linkStatusDesc.innerText = linkStatusDescs.USER_SET;
            } else {
                mainHeader.style.backgroundColor = headingColors.UNSAFE;
                linkStatus.innerText = "Unsafe";
                linkStatusDesc.innerText = linkStatusDescs.UNSAFE;
            }
        } else {
            mainHeader.style.backgroundColor = headingColors.SAFE;
            linkStatus.innerText = "Safe";
            linkStatusDesc.innerText = linkStatusDescs.SAFE;
        }

        amountOfRedirects.innerText =
            "Amount of redirects: " + message.data.amountOfRedirects;

        if (message.data.amountOfRedirects == 0)
            return (redirectPathContainer.innerText =
                "No redirects! It may go directly to the URL, but be careful of grabify domains.");

        message.data.redirects.forEach((obj) => {
            const li = document.createElement("li");
            li.innerText = obj.url;
            redirectPathContainer.appendChild(li);
            if (!obj.end) {
                const arrowLI = document.createElement("li");
                arrowLI.innerText = "🠓";
                arrowLI.classList.add("arrow");
                redirectPathContainer.appendChild(arrowLI);
            }
            if (obj.start && obj.end) {
                return (redirectPathContainer.innerText =
                    "This link has redirects but it goes to the same link.");
            }
        });
    }
    if (message.purpose == "link-report-err") {
        document.write(`An error occurred. Make sure the daemon is running.`);
    }
});