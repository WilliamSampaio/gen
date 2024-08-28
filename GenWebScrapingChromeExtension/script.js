
const btnRunScan = document.getElementById('btnRunScan');
const btnScanLeaves = document.getElementById('btnScanLeaves');


const scan = (serverApiUrl) => {
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
    if (getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[1]/div/div').getAttribute("aria-checked") == 'false') {
        getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[1]/div/input').click();
    }

    const nodes = [];
    const rootNode = {};

    let id = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/h1/div[2]/div/div/div/div[1]/div[2]/div/div/div[2]/div/span[2]/div/div[4]/button');

    if (id !== null) {
        rootNode.id = id.textContent;
    }

    let name = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[1]/div/div/div/div/div/div/div/div[3]/div[1]/div/div/div/h3/button/div/div/div/div/div/div/div[3]/span/span');

    if (name !== null) {
        rootNode.name = name.textContent;
    }

    let gender = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[1]/div/div/div/div/div/div/div/div[3]/div[2]/div/div/div/h3/button/div/div/div/div/div/div/div[1]/span');

    if (gender !== null) {
        rootNode.gender = gender.textContent[0];
    }

    let years = null;

    if (rootNode.gender == 'F') {
        years = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div/div[1]/div/div/ul/div[3]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span');
    } else {
        years = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[1]/div/div/ul/div[1]/div/div/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span');
    }

    if (years !== null) {
        rootNode.years = years.textContent;
    }

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

    rootNode.is_root = window.confirm(`Press OK if "${rootNode.name}" is a root node.`);

    nodes.push(rootNode);

    let children = null;

    if (rootNode.gender == 'F') {
        children = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[2]/div[1]/div/div[2]/div/div/div/div[2]/div[2]/div/div/div/ul');
    } else {
        children = getXPathNode('/html/body/div/div/div/div/div/div/div[2]/div/div[1]/div/div/div/main/div/div/div/div/div/div[6]/div/div/div/div[2]/div[1]/div/div[3]/div/div/div/div/div/div/div/div[4]/div[1]/div/div[2]/div[1]/div/div/div[2]/div[2]/div/div/div/ul');
    }

    children.childNodes.forEach(item => {
        let node = {};

        if (rootNode.gender == 'M') {
            node.father_id = rootNode.id;
        } else {
            node.mother_id = rootNode.id;
        }

        let id = getXPathNode('div/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[4]/button', item);

        if (id !== null) {
            node.id = id.textContent;
        }

        let name = getXPathNode('div/div/div[2]/div/div/div[1]/div/div/div[2]/div/a/div/div/div[1]/span', item);

        if (name !== null) {
            node.name = name.textContent;
        }

        let years = getXPathNode('div/div/div[2]/div/div/div[1]/div/div/div[2]/div/span/div/div[2]/span', item);

        if (years !== null) {
            node.years = years.textContent;
        }

        let gender = getXPathNode('div/div/div[1]/div', item);

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
                alert('Failed to save data.')
            } else {
                alert('Data saved successfully!')
            }
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            alert('There was a problem with the fetch operation: ' + error.message);
        });
};

if (chrome.storage) {
    // console.log(chrome.storage.local.get('gen_settings', (res) => {
    //     if(res.gen_settings === undefined){

    //     }
    // }));
} else {
    console.error("chrome.storage API is not available.");
    document.getElementById('msg').innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        chrome.storage API is not available.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
}

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
    const [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scan,
        args: [document.getElementById('serverApiUrl').value]
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

checkFunc()
let check = setInterval(checkFunc, 3000);
