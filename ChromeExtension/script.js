const btnRunScan = document.getElementById('btnRunScan')
const btnScanLeaves = document.getElementById('btnScanLeaves')
const btnStopScan = document.getElementById('btnStopScan')
const serverApiUrl = document.getElementById('serverApiUrl')
const tabsAmount = document.getElementById('tabsAmount')
const folderUrl = document.getElementById('folderUrl')
const wordsList = document.getElementById('wordsList')
const btnScanFolder = document.getElementById('btnScanFolder')

chrome.storage.local.get('_gen_extension').then(items => {
    tabsAmount.value = items._gen_extension.tabs_amount

    folderUrl.value = items._gen_extension.folder_url
    wordsList.value = items._gen_extension.words.join(',')

    document.getElementById('matchesTbody').innerText = ''

    items._gen_extension.matches.sort((a, b) => b.score - a.score).forEach(item => {
        document.getElementById('matchesTbody').innerHTML += `<tr>
            <td>${item.score}</td>
            <td><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.url}</a></td>
        </tr>`
    })

    if (items._gen_extension.status == 'scanning') {
        btnScanLeaves.setAttribute('style', 'display: none;')
        btnStopScan.innerHTML = `Stop Scan (<b>Remaining: ${items._gen_extension.leaves.length}</b>)`
        btnStopScan.removeAttribute('style')
        serverApiUrl.setAttribute('disabled', 'true')
        tabsAmount.setAttribute('disabled', 'true')
    } else {
        btnScanLeaves.removeAttribute('style')
        btnStopScan.setAttribute('style', 'display: none;')
        serverApiUrl.removeAttribute('disabled')
        tabsAmount.removeAttribute('disabled')
    }
})

btnRunScan.addEventListener('click', async function () {
    let id = prompt("FamilySearch ID:");
    if (id == null || id == "") {
        alert('ID is required')
    } else {
        chrome.runtime.sendMessage({
            'action': 'scan',
            'server_url': serverApiUrl.value,
            'id': id
        })
    }
});

btnScanLeaves.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        'action': 'scan_leaves',
        'server_url': serverApiUrl.value
    }).then(response => {
        if (response.success) {
            btnScanLeaves.setAttribute('style', 'display: none;')
            btnStopScan.removeAttribute('style')
            serverApiUrl.setAttribute('disabled', 'true')
            tabsAmount.setAttribute('disabled', 'true')
        }
    })
})

btnStopScan.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        'action': 'stop_scan'
    }).then(response => {
        if (response.success) {
            btnStopScan.setAttribute('style', 'display: none;')
            btnScanLeaves.removeAttribute('style')
            serverApiUrl.removeAttribute('disabled')
            tabsAmount.removeAttribute('disabled')
        }
    })
})

folderUrl.addEventListener('change', () => {
    chrome.storage.local.get('_gen_extension').then(items => {
        items._gen_extension.folder_url = folderUrl.value
        chrome.storage.local.set(items)
    })
})

wordsList.addEventListener('change', () => {
    chrome.storage.local.get('_gen_extension').then(items => {
        items._gen_extension.words = wordsList.value.split(',')
        chrome.storage.local.set(items)
    })
})

btnScanFolder.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        'action': 'scan_folder',
        'server_url': serverApiUrl.value
    }).then(response => {
        if (response.success) {
            folderUrl.setAttribute('disabled', true)
            wordsList.setAttribute('disabled', true)
        }
    })
})

tabsAmount.addEventListener('change', () => {
    chrome.runtime.sendMessage({
        'action': 'change_tabs_amount',
        'amount': tabsAmount.value
    })
})

const ping = () => {
    chrome.storage.local.get('_gen_extension').then(items => {
        if (items._gen_extension.status == 'ping') {
            console.log('Check', serverApiUrl.value, '...')
            chrome.runtime.sendMessage({
                'action': 'ping',
                'server_url': serverApiUrl.value
            }).then((response) => {
                if (response.response == 'server_on') {
                    document.getElementById('serverOnline').removeAttribute('style');
                    document.getElementById('serverOffline').setAttribute('style', 'display: none;');
                    document.querySelectorAll('.actionBtn').forEach(el => {
                        el.removeAttribute('disabled')
                    });
                    document.getElementById('msg').textContent = ''
                }
                if (response.response == 'server_off') {
                    document.getElementById('serverOnline').setAttribute('style', 'display: none;');
                    document.getElementById('serverOffline').removeAttribute('style');
                    document.querySelectorAll('.actionBtn').forEach(el => {
                        el.setAttribute('disabled', true)
                    })
                    if (response.hasOwnProperty('message')) {
                        document.getElementById('msg').innerHTML = `
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <b>Server Error!</b> ${response.message}
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>`
                    }
                }
            })
        }
    })
}

ping()
let check = setInterval(ping, 3000);


// btnScanLeaves.addEventListener('click', async function () {

//     if (!window.confirm(`Press OK to continue...`)) {
//         return;
//     }

//     fetch(document.getElementById('serverApiUrl').value + '/leaves')
//         .then(response => {
//             if (response.status != 200) {
//                 throw new Error(`Something went wrong (Status: ${response.status})`);
//             }
//             return response.json();
//         })

//         .then(json => {
//             if (chrome.storage) {
//                 chrome.storage.local.get('__gen_extension', function (items) {
//                     if (Object.keys(items).length === 0) {
//                         throw new Error('Storage not seted!')
//                     }
//                     items.__gen_extension.leaves = [];
//                     items.__gen_extension.leaves.push(...json);
//                     chrome.storage.local.set(items)
//                         .then(() => {
//                             console.log('Items stored!');
//                         })
//                         .catch(error => {
//                             throw new error;
//                         })
//                 });
//             } else {
//                 alert("chrome.storage API is not available.");
//             }
//         })
//         .catch(error => {
//             alert('Error: ' + error.message)
//         })

//     chrome.storage.local.get('__gen_extension', async function (items) {
//         while (items.__gen_extension.leaves.length > 0) {
//             const [tab] = await chrome.tabs.query({
//                 active: true, currentWindow: true
//             });
//             await chrome.scripting.executeScript({
//                 target: { tabId: tab.id },
//                 function: id => { window.location.href = 'https://www.familysearch.org/tree/person/details/' + id },
//                 args: [items.__gen_extension.leaves.shift()]
//             });
//             console.log('Loading page...');
//             await sleep(5000);
//             await chrome.scripting.executeScript({
//                 target: { tabId: tab.id },
//                 function: scan,
//                 args: [document.getElementById('serverApiUrl').value, true]
//             });
//             console.log('Length: ', items.__gen_extension.leaves.length);
//         };
//         chrome.storage.local.set(items);
//         alert('Finish!');
//     });
// });