// On Installed 
chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.set({
        "_gen_extension": {
            "status": "ping",
            "leaves": [],
            "tabs": [],
            "tabs_amount": 3,
            "folder_url": "https://www.familysearch.org/search/film/107061034?cat=3736298",
            "folder_tab_id": null,
            "words": [
                "motta", "mota", "francisco",
                "ceara", "acre", "grangeiro",
                "granjeiro", "sinforoso",
                "sinfuroso", "sinfuroso",
                "pires"
            ],
            "matches": []
        }
    })
    console.log("Installed", details)
    chrome.storage.local.get('_gen_extension').then(items => {
        console.log(items)
    })
})

// On Message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // Scan ID
    if (message.action == 'scan') {
        chrome.storage.local.get('_gen_extension').then(items => {
            items._gen_extension.server_url = message.server_url
            chrome.storage.local.set(items).then(() => {
                chrome.tabs.create({
                    'url': `https://www.familysearch.org/tree/person/details/${message.id}`,
                })
            })
        })
    }

    // Scan leaves
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
                    if (items._gen_extension.leaves.length > 0) {
                        chrome.storage.local.set(items).then(async () => {
                            for (let i = 0; i < items._gen_extension.tabs_amount; i++) {
                                await chrome.tabs.create({
                                    'active': false,
                                    'url': `https://www.familysearch.org/tree/person/details/${items._gen_extension.leaves.pop()}`,
                                }).then(tab => {
                                    items._gen_extension.tabs.push(tab.id)
                                    chrome.storage.local.set(items).then(() => {
                                        console.info('Extension', items)
                                        sendResponse({ 'success': true })
                                    })
                                })
                            }
                        })
                    } else {
                        chrome.runtime.sendMessage({ 'action': 'stop_scan' })
                    }
                })
            })
            .catch(error => {
                console.error('Error:', error.message)
                sendResponse({ 'success': false })
            })
    }

    if (message.action == 'save') {
        chrome.storage.local.get('_gen_extension').then(async items => {
            console.info('Message:', message)
            fetch(items._gen_extension.server_url + '/node', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message.data)
            })
                .then(response => {
                    chrome.tabs.remove(message.tab_id)
                    if (items._gen_extension.status == 'scanning') {
                        let indexTab = items._gen_extension.tabs.indexOf(message.tab_id)
                        items._gen_extension.tabs.splice(indexTab, 1)
                        if (items._gen_extension.leaves.length > 0) {
                            let id = items._gen_extension.leaves.pop()
                            chrome.storage.local.set(items).then(() => {
                                chrome.tabs.create({
                                    'active': false,
                                    'url': `https://www.familysearch.org/tree/person/details/${id}`,
                                }).then(tab => {
                                    items._gen_extension.tabs.push(tab.id)
                                    chrome.storage.local.set(items).then(() => {
                                        console.info('Remaining leaves:', items._gen_extension.leaves.length)
                                        // sendResponse({ 'success': true })
                                    })
                                })
                            })
                        } else {
                            chrome.runtime.sendMessage({ 'action': 'stop_scan' })
                        }
                    }
                })
                .catch(error => {
                    console.error('Save failed:', error.message)
                });
        })
    }

    if (message.action == 'stop_scan') {
        chrome.storage.local.get('_gen_extension').then(items => {
            chrome.tabs.remove(items._gen_extension.tabs)
            items._gen_extension.status = 'ping'
            items._gen_extension.leaves = []
            items._gen_extension.tabs = []
            chrome.storage.local.set(items)
        })
    }

    // Scan leaves
    if (message.action == 'scan_folder') {
        chrome.storage.local.get('_gen_extension').then(async items => {
            await chrome.tabs.create({
                'active': false,
                'url': items._gen_extension.folder_url,
            }).then(tab => {
                items._gen_extension.status = 'scanning_images'
                items._gen_extension.server_url = message.server_url
                items._gen_extension.folder_tab_id = tab.id
                chrome.storage.local.set(items).then(() => {
                    sendResponse({ 'success': true })
                })
            })
        })
    }

    if (message.action == 'open_image') {
        chrome.storage.local.get('_gen_extension').then(async items => {
            await chrome.tabs.create({
                'active': false,
                'url': `https://sg30p0.familysearch.org/service/records/storage/deepzoomcloud/dz/v1/${message.id}/$dist`,
            })
        })
    }

    if (message.action == 'scan_image') {
        chrome.storage.local.get('_gen_extension').then(items => {
            fetch(items._gen_extension.server_url + '/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'base64': message.base64,
                    'words': items._gen_extension.words
                })
            })
                .then(response => {
                    if (response.status == 200) {
                        chrome.tabs.remove(message.tab_id)
                        return response.json()
                    }
                })
                .then(json => {
                    console.info('Json', json)
                    if (json.score > 0) {
                        items._gen_extension.matches.push({
                            'score': json.score,
                            'url': `https://www.familysearch.org/ark:/61903/${message.id}`
                        })
                        chrome.storage.local.set(items)
                    }
                })
                .catch(error => {
                    console.error('Scan failed:', error.message)
                });
        })
    }

    if (message.action == 'stop_scan_image') {
        chrome.storage.local.get('_gen_extension').then(items => {
            chrome.tabs.remove(items._gen_extension.folder_tab_id)
            items._gen_extension.status = 'ping'
            items._gen_extension.folder_tab_id = null
            chrome.storage.local.set(items).then(() => {
                sendResponse({ 'success': true })
            })
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

    if (message.action == 'change_tabs_amount') {
        chrome.storage.local.get('_gen_extension').then(items => {
            items._gen_extension.tabs_amount = parseInt(message.amount)
            chrome.storage.local.set(items)
        })
    }

    return true
})

chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.url.includes('https://www.familysearch.org/tree/person/details/')) {
        console.info('Details:', details)
        chrome.storage.local.get('_gen_extension').then(items => {
            chrome.scripting.executeScript({
                target: { tabId: details.tabId },
                function: contentScript,
                args: [details.tabId, items._gen_extension.status == 'scanning' ? true : false]
            })
        })
    }

    if (details.url.includes('https://www.familysearch.org/search/film/')) {
        chrome.storage.local.get('_gen_extension').then(items => {
            if (items._gen_extension.status == 'scanning_images') {
                console.info('1 Details:', details)
                chrome.scripting.executeScript({
                    target: { tabId: details.tabId },
                    function: contentScriptScanImage
                })
            }
        })
    }

    if (details.url.includes('https://sg30p0.familysearch.org/service/records/storage/deepzoomcloud/dz/v1/')) {
        chrome.storage.local.get('_gen_extension').then(items => {
            if (items._gen_extension.status == 'scanning_images') {
                console.info('2 Details:', details)
                chrome.scripting.executeScript({
                    target: { tabId: details.tabId },
                    function: readImage,
                    args: [details.tabId]
                })
            }
        })
    }
})

async function contentScript(tabId, scanningLeaves) {

    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function scan(scanningLeaves = false) {
        const XP_UNKNOW = '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div/div/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[2]/div/div[3]/button';

        const XP_ID = [
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div[2]/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[2]/div/div[4]/button',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div/div/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[2]/div/div[4]/button'
        ];
        const XP_GENDER = [
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[3]/div[1]/div/div[1]/div/div/div/div/div/div/div/div[3]/div[2]/div/div/div/h3/button/div/div/div/div/div/div/div[1]/span',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[1]/div/div/div/div/div/div/div/div[3]/div[2]/div/div/div/h3/button/div/div/div/div/div/div/div[1]/span'
        ];
        const XP_NAME = [
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div[2]/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[1]/div/div/div[1]/span',
            '/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div/div/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[1]/div/div/div[1]/span'
        ];
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

        if (getXPathNode(XP_UNKNOW)) {
            rootNode.id = getXPathNode(XP_UNKNOW).textContent;
            rootNode.ignore = true;
            nodes.push(rootNode)
            return chrome.runtime.sendMessage({ 'action': 'save', 'data': nodes, 'tab_id': tabId })
        }

        XP_GENDER.forEach(xp => {

            let gender = getXPathNode(xp);

            if (gender === null) {
                return;
            }

            rootNode.gender = gender.textContent[0];
        })

        XP_ID.forEach(xp => {

            let id = getXPathNode(xp);

            if (id === null) {
                return;
            }

            rootNode.id = id.textContent;
        })

        XP_NAME.forEach(xp => {

            let name = getXPathNode(xp);

            if (name === null) {
                return;
            }

            rootNode.name = name.textContent;
        })

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

    await sleep(10000).then(() => {
        window.scrollTo(0, document.body.scrollHeight)
        scan(scanningLeaves)
    })
}

async function contentScriptScanImage() {

    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async function scan() {

        const XP_VIEW_ONE_IMG = [
            '/html/body/div[2]/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div[2]/div/div/div[1]/div[2]/div/button[1]',
            '/html/body/div[2]/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div[3]/div/div/div[1]/div[2]/div/button[1]'
        ];

        const XP_NEXT_BTN = [
            '/html/body/div[2]/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div[2]/div/div/div[3]/div/span[2]/button',
            '/html/body/div[2]/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div[3]/div/div/div[3]/div/span[2]/button'
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

        XP_VIEW_ONE_IMG.forEach(xp => {

            let btn = getXPathNode(xp);

            if (btn === null) {
                return;
            }

            btn.click()
        })

        await sleep(2000).then(() => { })

        XP_NEXT_BTN.forEach(async xp => {


            let btn = getXPathNode(xp);

            if (btn === null) {
                return;
            }

            while (btn.getAttribute('aria-disabled') == 'false') {
                let id = window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split('?')[0]
                chrome.runtime.sendMessage({ 'action': 'open_image', 'id': id })
                await sleep(3000).then(() => { })
                btn.click()
            }

            chrome.runtime.sendMessage({ 'action': 'stop_scan_image' })
        })
    }

    await sleep(3000).then(() => {
        window.scrollTo(0, 0)
        scan()
    })
}

async function readImage(tabId) {

    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    await sleep(2000).then(async () => {
        const image = document.querySelector('img');

        // Get the remote image as a Blob with the fetch API
        await fetch(image.src)
            .then((res) => res.blob())
            .then((blob) => {
                // Read the Blob as DataURL using the FileReader API
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1]
                    let id = window.location.href
                    id = id.replace(
                        'https://sg30p0.familysearch.org/service/records/storage/deepzoomcloud/dz/v1/', '')
                    id = id.replace('/$dist', '')
                    let message = { 'action': 'scan_image', 'base64': base64, 'id': id, 'tab_id': tabId }
                    chrome.runtime.sendMessage(message)
                };
                reader.readAsDataURL(blob);
            })
    })
}
