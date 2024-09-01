chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        "_gen_extension": {
            "status": "ping",
            "leaves": [],
            "tabs": []
        }
    })
    console.log("Installed", details)
    chrome.storage.local.get('_gen_extension').then(items => {
        console.log(items)
    })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action == 'scan_leaves') {
        fetch(message.server_url + '/leaves')
            .then(response => {
                if (response.status == 200) {
                    return response.json()
                }
                console.error('Error.', serverUrl + '/leaves', 'return http status code:', response.status)
            })
            .then(json => {
                chrome.storage.local.get('_gen_extension').then(items => {
                    items._gen_extension.leaves.push(...json)
                    items._gen_extension.status = 'scanning'
                    items._gen_extension.server_url = message.server_url

                    chrome.tabs.create({
                        'active': false,
                        'url': 'https://www.familysearch.org/pt/',
                    }).then(tab => {
                        items._gen_extension.tabs.push(tab.id)
                    })
                    chrome.tabs.create({
                        'active': false,
                        'url': 'https://www.familysearch.org/pt/',
                    }).then(tab => {
                        items._gen_extension.tabs.push(tab.id)
                    })
                    chrome.tabs.create({
                        'active': false,
                        'url': 'https://www.familysearch.org/pt/',
                    }).then(tab => {
                        items._gen_extension.tabs.push(tab.id)
                    })

                    chrome.storage.local.set(items).then(() => {
                        console.info('Extension', items)
                        items._gen_extension.tabs.forEach(tabId => {
                            chrome.tabs.update(tabId, {
                                'url': `https://www.familysearch.org/tree/person/details/${items._gen_extension.leaves.pop()}`
                            }).then(tab => {
                                chrome.scripting.executeScript({
                                    target: { tabId: tab.id },
                                    function: contentScript,
                                    args: [tab.id]
                                })
                            })
                        })
                    })
                })
            })
            .catch(error => {
                console.error('Error:', error.message)
            })
    }

    if (message.action == 'save') {
        chrome.storage.local.get('_gen_extension').then(async items => {

            console.log('storage:', items)

            if (items._gen_extension.status == 'scanning') {
                fetch(items._gen_extension.server_url + '/node', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message.data)
                })
                    .then(response => {
                        let index = items._gen_extension.leaves.indexOf(message.data[0].id)
                        // let index_tab = items._gen_extension.tabs.indexOf(message.tab_id)

                        // remve leave
                        items._gen_extension.leaves.splice(index, 1)

                        if (items._gen_extension.leaves.length > 0) {

                            // close tab
                            chrome.tabs.remove(message.tab_id).then(() => {

                                // remove tab id from storage
                                // items._gen_extension.leaves.splice(index_tab, 1)

                                // create new tab
                                chrome.tabs.create({
                                    'active': false,
                                    'url': 'https://www.familysearch.org/pt/',
                                }).then(tab => {

                                    // store new tab id
                                    items._gen_extension.tabs.push(tab.id)

                                    // save storage
                                    chrome.storage.local.set(items).then(() => {

                                        // redirect
                                        chrome.tabs.update(tab.id, {
                                            'url': `https://www.familysearch.org/tree/person/details/${items._gen_extension.leaves.pop()}`
                                        }).then(tab => {

                                            // inject func
                                            chrome.scripting.executeScript({
                                                target: { tabId: tab.id },
                                                function: contentScript,
                                                args: [tab.id]
                                            })
                                        })
                                    })
                                })
                            })
                        } else {
                            items._gen_extension.status = ''
                            chrome.tabs.remove(items._gen_extension.tabs).then(() => {
                                items._gen_extension.tabs = []
                                chrome.storage.local.set(items)
                            })
                        }
                    })
                    .catch(error => {
                        console.error('Save failed:', error.message)
                    });
            }
        })
    }

    if (message.action == 'stop_scan') {
        chrome.storage.local.get('_gen_extension').then(items => {
            items._gen_extension = {
                "status": "ping",
                "leaves": [],
                "tabs": []
            }
            chrome.storage.local.set(items)
        })
    }

    if (message.action == 'ping') {
        chrome.storage.local.get('_gen_extension').then(items => {
            if (items._gen_extension.status == 'ping') {
                fetch(message.server_url)
                    .then(response => {
                        if (response.status == 200) {
                            if (items._gen_extension.server_url == '') {
                                items._gen_extension.server_url = message.server_url
                                chrome.storage.local.set(items)
                            }
                        }
                        sendResponse({
                            'response': (response.status == 200) ? 'server_on' : 'server_off'
                        })
                    })
                    .catch(error => {
                        sendResponse({
                            'response': 'server_off',
                            'message': error.message
                        })
                    })
            }
        })
    }

    return true
})

function contentScript(tabId) {

    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function scan(scanningLeaves) {
        const XP_ID = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div[2]/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[2]/div/div[4]/button';
        const XP_GENDER = [
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[1]/div/div/div/div/div/div/div/div[3]/div[2]/div/div/div/h3/button/div/div/div/div/div/div/div[1]/span',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[1]/div/div/div/div/div/div/div/div[3]/div[2]/div/div/div/h3/button/div/div/div/div/div/div/div[1]/span'
        ];
        const XP_NAME = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div[2]/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[1]/div/div/div[1]/span';
        const XP_CHILDREN_ROOT = [
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]'
        ];
        const XP_YEARS = [
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div/div[1]/div/div/ul/div[1]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span'
        ];

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
        // try {
        //     if (getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[1]/div/div').getAttribute("aria-checked") == 'false') {
        //         getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[1]/div/input').click();
        //     }
        // } catch {
        //     console.log('set true: Show All Family Members FAIL!');
        // }

        const nodes = [];
        const rootNode = {};

        XP_GENDER.forEach(xp => {

            let gender = getXPathNode(xp);

            if (gender === null) {
                return;
            }

            rootNode.gender = gender.textContent[0];
        })

        let id = getXPathNode(XP_ID);

        if (id !== null) {
            rootNode.id = id.textContent;
        }

        let name = getXPathNode(XP_NAME);

        if (name !== null) {
            rootNode.name = name.textContent;
        }

        // let years = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span');

        // if (years !== null) {
        //     rootNode.years = years.textContent;
        // }

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

        XP_YEARS.forEach(xp => {

            let years = getXPathNode(xp);

            if (years === null) {
                return;
            }

            if (years !== null) {
                rootNode.years = years.textContent;
            }
        });

        let children = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div/div[2]/div[2]/div/div/div/ul');

        if (children !== null && children.childNodes !== null) {

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
        } else {

            XP_CHILDREN_ROOT.forEach(xp => {

                let childrenRoot = getXPathNode(xp);

                if (childrenRoot === null) {
                    return;
                }

                if (childrenRoot.childNodes !== null) {

                    childrenRoot.childNodes.forEach(spouses => {

                        let children = getXPathNode('div/div/div[2]/div[2]/div/div/div/ul', spouses);

                        if (children !== null) {

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
                        }
                    });
                }
            })
        }

        chrome.runtime.sendMessage({ 'action': 'save', 'data': nodes, 'tab_id': tabId })
    }

    window.addEventListener('load', function () {
        chrome.storage.local.get('_gen_extension').then(async items => {
            if (items._gen_extension.status == 'scanning') {
                await sleep(6000).then(() => {
                    scan(true)
                })
            }
        })
    })
}
