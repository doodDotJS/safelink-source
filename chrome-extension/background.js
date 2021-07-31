chrome.runtime.onInstalled.addListener(async() => {
    getGrabifyLinks().then((grabifyDomains) => {
        chrome.storage.sync.set({
            UserAgent: "SafeLink Redirect Checker 1.0",
            GrabifyDomains: grabifyDomains,
            FilteredDomains: [],
        });
    });
    chrome.contextMenus.create({
        id: "SafeLink-GetRedirectsOfLink",
        contexts: ["link"],
        title: "Get redirects of link",
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == "SafeLink-GetRedirectsOfLink") {
        chrome.storage.sync.get("UserAgent", (result) => {
            const userAgent = result["UserAgent"];

            fetch("http://localhost:5000/geturlredirects", {
                    method: "POST",
                    headers: {
                        "User-Agent": userAgent,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        urls: [info.linkUrl],
                    }),
                })
                .then((r) => r.json())
                .then((result) => {
                    chrome.tabs.create({
                        url: "link-report-stuff/index.html",
                    });
                    const dataToSend = result[info.linkUrl];
                    checkLinkIfFiltered(info.linkUrl, result[info.linkUrl]).then(
                        (filterCheck) => {
                            dataToSend["filterStatus"] = {
                                isFiltered: filterCheck[0],
                                userSet: filterCheck[1],
                            };
                            dataToSend["url"] = info.linkUrl;
                            setTimeout(() => {
                                chrome.runtime.sendMessage({ purpose: "generate-link-report", data: dataToSend },
                                    () => console.log("hi")
                                );
                            }, 500);
                        }
                    );
                })
                .catch((err) => {
                    chrome.tabs.create({
                        url: "link-report-stuff/index.html",
                    });
                    setTimeout(() => {
                        chrome.runtime.sendMessage({ purpose: "link-report-err", err: err },
                            () => {
                                console.log("rip error when sending the http req");
                            }
                        );
                    }, 500);
                });
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message == "is-working") {
        chrome.storage.sync.get("UserAgent", (result) => {
            const userAgent = result["UserAgent"];

            fetch("http://localhost:5000", {
                    headers: {
                        "User-Agent": userAgent,
                    },
                })
                .then((r) => r.text())
                .then((result) => {
                    if (result !== "READY")
                        return sendResponse([
                            false,
                            "Daemon is not ready. Make sure it is running.",
                        ]);
                    sendResponse([true]);
                })
                .catch((err) => sendResponse([false, err.message]));
        });
    }
    return true;
});

function getGrabifyLinks() {
    return new Promise((resolve, reject) => {
        fetch(
                "https://gist.githubusercontent.com/M-rcus/9af3207273bf5d30b28c2e3892f1a412/raw/e9e2867b1a5a93725c2112d9386ceeefe9ba6c1c/Grabify_Domains.txt"
            )
            .then((r) => r.text())
            .then((result) => {
                resolve(result.split("\n"));
            })
            .catch((err) => reject(err));
    });
}

function checkLinkIfFiltered(url, redirectData) {
    url = url.toLowerCase();
    return new Promise((resolve, reject) => {
        let toReturn = [false, false];
        chrome.storage.sync.get(["GrabifyDomains", "FilteredDomains"], (data) => {
            data["GrabifyDomains"].forEach((obj) => {
                obj = obj.toLowerCase();
                if (url.includes(obj)) {
                    toReturn = [true, false]; // [isFiltered, userSet]
                } else {
                    redirectData.redirects.forEach((obj) => {
                        obj.url.toLowerCase();
                        if (url.includes(obj)) toReturn = [true, false]; // [isFiltered, userSet]
                    });
                }
            });
            if (toReturn[0] === false) {
                data["FilteredDomains"].forEach((obj) => {
                    obj = obj.toLowerCase();
                    if (url.includes(obj)) toReturn = [true, true]; //isFiltered, GrabifyLink
                });
            }
            resolve(toReturn);
        });
    });
}