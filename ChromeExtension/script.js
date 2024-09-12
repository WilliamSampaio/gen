const btnRunScan = document.getElementById('btnRunScan')
const btnScanLeaves = document.getElementById('btnScanLeaves')
const btnStopScan = document.getElementById('btnStopScan')
const serverApiUrl = document.getElementById('serverApiUrl')
const tabsAmount = document.getElementById('tabsAmount')
const folderUrl = document.getElementById('folderUrl')
const wordsList = document.getElementById('wordsList')
const btnScanFolder = document.getElementById('btnScanFolder')
const btnStopScanFolder = document.getElementById('btnStopScanFolder')
const btnDownloadMatches = document.getElementById('btnDownloadMatches')

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

btnStopScanFolder.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        'action': 'stop_scan_image'
    }).then(response => {
        // if (response.success) {}
    })
})

btnDownloadMatches.addEventListener('click', () => {
    chrome.storage.local.get('_gen_extension').then(items => {
        let catalogo = items._gen_extension.folder_url.split('?cat=')[1]
        let pasta = items._gen_extension.folder_url.split('?cat=')[0].split('/').reverse()[0]
        let html = `<html><a href='${items._gen_extension.folder_url}' target='_blank'>Catalogo: ${catalogo} Pasta: ${pasta}</a><br><ol>`
        items._gen_extension.matches.forEach(match => {
            html += `<li>(${items._gen_extension.words.join(',')}) | SCORE: ${match.score}% | <a href='${match.url}' target='_blank'>${match.url}</a></li>`
        })
        html += '</ol></html>'
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: `${catalogo}_${pasta}.html`
        })
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
