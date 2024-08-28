const btnRunScan = document.getElementById('btnRunScan');
const btnScanLeaves = document.getElementById('btnScanLeaves');

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

const setUpStorage = () => {
    if (chrome.storage) {
        chrome.storage.local.get('__gen_extension', function (items) {
            if (Object.keys(items).length === 0) {
                chrome.storage.local.set({
                    __gen_extension: {
                        leaves: [],
                        settings: {}
                    }
                }).catch(error => {
                    throw new error;
                })
            }
        });
    } else {
        throw new Error("chrome.storage API is not available.");
    }
}

function scan(serverApiUrl, scanningLeaves = false) {
    const XP_ID = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div[2]/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[2]/div/div[4]/button';
    const XP_GENDER = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[1]/div/div/div/div/div/div/div/div[3]/div[2]/div/div/div/h3/button/div/div/div/div/div/div/div[1]/span';
    const XP_NAME = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div[2]/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[1]/div/div/div[1]/span';
    const XP_M_CHILDREN_ROOT = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]';
    const XP_F_CHILDREN_ROOT = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]';

    const getXPathNode = (xpath, ctxNode = null) => {
        return document.evaluate(
            xpath,
            ctxNode ?? document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
    }

    // set true: Show All Family Members
    try {
        if (getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[1]/div/div').getAttribute("aria-checked") == 'false') {
            getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[1]/div/input').click();
        }
    } catch {
        console.log('set true: Show All Family Members FAIL!');
    }

    const nodes = [];
    const rootNode = {};

    let gender = getXPathNode(XP_GENDER);

    if (gender !== null) {
        rootNode.gender = gender.textContent[0];
    }

    let id = getXPathNode(XP_ID);

    if (id !== null) {
        rootNode.id = id.textContent;
    }

    let name = getXPathNode(XP_NAME);

    if (name !== null) {
        rootNode.name = name.textContent;
    }

    let years = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span');

    if (years !== null) {
        rootNode.years = years.textContent;
    }

    // let years = null;

    // if (rootNode.gender == 'F') {
    //     years = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span');
    // } else {
    //     years = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[1]/div/div/ul/div[1]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span');
    // }

    // if (years !== null) {
    //     rootNode.years = years.textContent;
    // }

    // let father_id = null;

    // if (rootNode.gender == 'F') {
    //     father_id = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[3]/div/div[2]/div/div/div/div[1]/div/div/ul/div[1]/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[4]/button');
    // } else {
    //     father_id = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[3]/div/div[2]/div/div/div/div[1]/div/div/ul/div[1]/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[4]/button');
    // }

    // rootNode.father_id = father_id !== null ? father_id.textContent : null;

    // let mother_id = null;

    // if (rootNode.gender == 'F') {
    //     mother_id = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[3]/div/div[2]/div/div/div/div[1]/div/div/ul/div[3]/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[4]/button');
    // } else {
    //     mother_id = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[3]/div/div[2]/div/div/div/div[1]/div/div/ul/div[3]/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[4]/button');
    // }

    // rootNode.mother_id = mother_id !== null ? mother_id.textContent : null;

    rootNode.is_root = scanningLeaves ? false : window.confirm(`Press OK if "${rootNode.name}" is a root node.`);

    nodes.push(rootNode);

    let childrenRoot = getXPathNode(rootNode.gender == 'F' ? XP_F_CHILDREN_ROOT : XP_M_CHILDREN_ROOT);

    if (childrenRoot !== null) {

        if (childrenRoot.childNodes !== null) {

            childrenRoot.childNodes.forEach(spouses => {

                let children = getXPathNode('div/div/div[2]/div[2]/div/div/div/ul', spouses);

                if (children.childNodes !== null) {

                    children.childNodes.forEach(child => {
                        let node = {};

                        if (rootNode.gender == 'M') {
                            node.father_id = rootNode.id;
                        } else {
                            node.mother_id = rootNode.id;
                        }

                        let id = getXPathNode('div/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[4]/button', child);

                        if (id !== null) {
                            node.id = id.textContent;
                        }

                        let name = getXPathNode('div/div/div[2]/div/div/div[1]/div/div/div[2]/div/a/div/div/div[1]/span', child);

                        if (name !== null) {
                            node.name = name.textContent;
                        }

                        let years = getXPathNode('div/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span', child);

                        if (years !== null) {
                            node.years = years.textContent;
                        }

                        let gender = getXPathNode('div/div/div[1]/div', child);

                        if (gender !== null) {
                            if (window.getComputedStyle(gender, null).getPropertyValue('background-color') == 'rgb(214, 64, 110)') {
                                node.gender = 'F';
                            } else if (window.getComputedStyle(gender, null).getPropertyValue('background-color') == 'rgb(57, 174, 203)') {
                                node.gender = 'M';
                            }
                        }

                        node.is_root = false;

                        nodes.push(node);
                    })
                }
            });
        }
    }

    // console.log(nodes);
    // return;

    // POST request options
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nodes)
    };

    // Make the POST request
    fetch(serverApiUrl + '/node', requestOptions)
        .then(response => {
            if (response.status != 201) {
                if (!scanningLeaves) {
                    alert('Failed to save data.')
                }
            } else {
                if (!scanningLeaves) {
                    alert('Data saved successfully!')
                }
            }
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            if (!scanningLeaves) {
                alert('There was a problem with the fetch operation: ' + error.message);
            }
        });
};

btnRunScan.addEventListener('click', async function () {
    const [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scan,
        args: [document.getElementById('serverApiUrl').value]
    });
});

btnScanLeaves.addEventListener('click', async function () {

    if (!window.confirm(`Press OK to continue...`)) {
        return;
    }

    fetch(document.getElementById('serverApiUrl').value + '/leaves')
        .then(response => {
            if (response.status != 200) {
                throw new Error(`Something went wrong (Status: ${response.status})`);
            }
            return response.json();
        })

        .then(json => {
            if (chrome.storage) {
                chrome.storage.local.get('__gen_extension', function (items) {
                    if (Object.keys(items).length === 0) {
                        throw new Error('Storage not seted!')
                    }
                    items.__gen_extension.leaves = [];
                    items.__gen_extension.leaves.push(...json);
                    chrome.storage.local.set(items)
                        .then(() => {
                            console.log('Items stored!');
                        })
                        .catch(error => {
                            throw new error;
                        })
                });
            } else {
                alert("chrome.storage API is not available.");
            }
        })
        .catch(error => {
            alert('Error: ' + error.message)
        })

    chrome.storage.local.get('__gen_extension', async function (items) {
        while (items.__gen_extension.leaves.length > 0) {
            const [tab] = await chrome.tabs.query({
                active: true, currentWindow: true
            });
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: id => { window.location.href = 'https://www.familysearch.org/tree/person/details/' + id },
                args: [items.__gen_extension.leaves.shift()]
            });
            console.log('Loading page...');
            await sleep(5000);
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: scan,
                args: [document.getElementById('serverApiUrl').value, true]
            });
            console.log('Length: ', items.__gen_extension.leaves.length);
        };
        chrome.storage.local.set(items);
        alert('Finish!');
    });
});

const checkFunc = () => {
    console.log('Check', document.getElementById('serverApiUrl').value, '...')
    fetch(document.getElementById('serverApiUrl').value)
        .then((response) => {
            if (response.status != 200) {
                document.getElementById('serverOnline').setAttribute('style', 'display: none;');
                document.getElementById('serverOffline').removeAttribute('style');
                document.querySelectorAll('.actionBtn').forEach(el => {
                    el.setAttribute('disabled', true)
                });
            } else {
                document.getElementById('serverOnline').removeAttribute('style');
                document.getElementById('serverOffline').setAttribute('style', 'display: none;');
                document.querySelectorAll('.actionBtn').forEach(el => {
                    el.removeAttribute('disabled')
                });
            }
        })
        .catch(() => {
            document.getElementById('serverOnline').setAttribute('style', 'display: none;');
            document.getElementById('serverOffline').removeAttribute('style');
            document.querySelectorAll('.actionBtn').forEach(el => {
                el.setAttribute('disabled', true)
            });
        });
}

setUpStorage()
checkFunc()
let check = setInterval(checkFunc, 3000);
