const requestsContainer = document.getElementById('requests-container');
const requestList = document.getElementById('request-list');
const addRequestButton = document.getElementById('add-request');
const saveSessionButton = document.getElementById('save-session');
const loadSessionSelect = document.getElementById('load-session');
const loadSessionButton = document.getElementById('load-session-btn');
const deleteSessionButton = document.getElementById('delete-session-btn');
const sessionNameInput = document.getElementById('session-name');
const toggleSidebarButton = document.getElementById('toggle-sidebar');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');

toggleSidebarButton.addEventListener('click', function () {
    sidebar.classList.toggle('hidden');
    mainContent.classList.toggle('sidebar-open');
});

document.addEventListener('DOMContentLoaded', function () {

    sidebar.addEventListener('mouseleave', function () {
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('sidebar-open');
    });
});

function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

function createRequestElement(data = {}) {
    const requestId = data.id || generateRandomId();
    const requestElement = document.createElement('div');
    requestElement.className = 'request-card bg-white p-4 rounded-lg shadow-md';
    requestElement.id = `request-${requestId}`;
    requestElement.innerHTML = `
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0 lg:space-x-4 mb-4">
                    <input type="text" placeholder="Request Name" class="request-name text-base font-semibold border-b pb-1 w-full lg:w-1/2" style="border-color: var(--color-primary); color: var(--color-primary);" value="${data.name || ''}">
                    <button class="delete-request w-full lg:w-auto px-3 py-1 rounded transition-colors" style="background-color: var(--color-primary); color: var(--color-button-text);">Delete Request</button>
                </div>
                <div class="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4 mb-4">
                    <select class="method-select w-full lg:w-1/4 border rounded px-3 py-2 focus:outline-none focus:ring-2" style="border-color: var(--color-primary); --tw-ring-color: var(--color-primary);">
                        ${['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => 
                            `<option ${data.method === method ? 'selected' : ''} value="${method}">${method}</option>`
                        ).join('')}
                    </select>
                    <input type="text" placeholder="Enter URL" class="url-input w-full lg:w-3/4 border rounded px-3 py-2 focus:outline-none focus:ring-2" style="border-color: var(--color-primary); --tw-ring-color: var(--color-primary);" value="${data.url || ''}">
                </div>
                <div class="mb-4">
                    <h3 class="font-semibold mb-2">Headers:</h3>
                    <div class="headers-container space-y-2">
                        ${(data.headers || []).map(header => `
                            <div class="header-row flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
                                <input type="text" placeholder="Header Name" class="header-name w-full lg:w-1/2 border rounded px-3 py-2 focus:outline-none focus:ring-2" style="border-color: var(--color-primary); --tw-ring-color: var(--color-primary);" value="${header.name || ''}">
                                <input type="text" placeholder="Header Value" class="header-value w-full lg:w-1/2 border rounded px-3 py-2 focus:outline-none focus:ring-2" style="border-color: var(--color-primary); --tw-ring-color: var(--color-primary);" value="${header.value || ''}">
                                <button class="remove-header w-full lg:w-auto px-2 py-1 rounded transition-colors" style="background-color: var(--color-primary); color: var(--color-button-text);">Remove</button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add-header w-full lg:w-auto mt-2 px-3 py-1 rounded transition-colors" style="background-color: var(--color-primary); color: var(--color-button-text);">Add Header</button>
                </div>
                <div class="mb-4">
                    <textarea placeholder="Request Body (JSON)" class="body-input w-full h-32 border rounded px-3 py-2 focus:outline-none focus:ring-2" style="border-color: var(--color-primary); --tw-ring-color: var(--color-primary);">${data.body || ''}</textarea>
                </div>
                <div class="flex items-center mb-4">
                    <input type="checkbox" id="cors-proxy-${requestId}" class="cors-proxy-toggle mr-2" ${data.useCorsProxy ? 'checked' : ''}>
                    <label for="cors-proxy-${requestId}">Use CORS Proxy</label>
                </div>
                <button class="execute-request w-full lg:w-auto px-4 py-2 rounded transition-colors" style="background-color: var(--color-primary); color: var(--color-button-text);">Execute</button>
                <div class="response-container mt-4 hidden">
                    <h3 class="font-semibold mb-2">Response:</h3>
                    <pre class="response-content bg-gray-100 p-4 rounded overflow-x-auto max-h-64"></pre>
                </div>
            `;

    const deleteButton = requestElement.querySelector('.delete-request');
    deleteButton.addEventListener('click', () => {
        requestElement.remove();
        updateSidebar();
    });

    const executeButton = requestElement.querySelector('.execute-request');
    executeButton.addEventListener('click', (e) => {
        executeRequest(requestElement, e.target)
    });

    const addHeaderButton = requestElement.querySelector('.add-header');
    addHeaderButton.addEventListener('click', () => addHeaderRow(requestElement));

    const headersContainer = requestElement.querySelector('.headers-container');
    headersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-header')) {
            e.target.closest('.header-row').remove();
        }
    });

    const methodSelect = requestElement.querySelector('.method-select');
    methodSelect.addEventListener('change', () => {
        updateRequestColor(requestElement);
        updateSidebar()
    });

    const nameInput = requestElement.querySelector('.request-name');
    nameInput.addEventListener('input', updateSidebar);

    updateRequestColor(requestElement);
    updateSidebar();

    return requestElement;
}

function updateRequestColor(requestElement) {
    const method = requestElement.querySelector('.method-select').value;
    const color = `var(--color-${method.toLowerCase()})`;
    requestElement.style.setProperty('--request-color', color);
    requestElement.querySelectorAll('input, select, textarea').forEach(el => {
        el.style.borderColor = color;
        el.style.setProperty('--tw-ring-color', color);
    });
    requestElement.querySelectorAll('button').forEach(el => {
        el.style.backgroundColor = color;
    });
}

function addHeaderRow(requestElement) {
    const headersContainer = requestElement.querySelector('.headers-container');
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 mt-2';
    headerRow.innerHTML = `
                <input type="text" placeholder="Header Name" class="header-name w-full lg:w-1/2 border rounded px-3 py-2 focus:outline-none focus:ring-2" style="border-color: var(--request-color); --tw-ring-color: var(--request-color);">
                <input type="text" placeholder="Header Value" class="header-value w-full lg:w-1/2 border rounded px-3 py-2 focus:outline-none focus:ring-2" style="border-color: var(--request-color); --tw-ring-color: var(--request-color);">
                <button class="remove-header w-full lg:w-auto px-2 py-1 rounded transition-colors" style="background-color: var(--request-color); color: var(--color-button-text);">Remove</button>
            `;
    headersContainer.appendChild(headerRow);
    updateRequestColor(requestElement);
}

function executeRequest(requestElement, executionButton) {
    const method = requestElement.querySelector('.method-select').value;
    const url = requestElement.querySelector('.url-input').value;
    const body = requestElement.querySelector('.body-input').value;
    const responseContainer = requestElement.querySelector('.response-container');
    const responseContent = requestElement.querySelector('.response-content');
    // console.log(executionButton)
    const headers = Array.from(requestElement.querySelectorAll('.header-row')).reduce((acc, row) => {
        const name = row.querySelector('.header-name').value;
        const value = row.querySelector('.header-value').value;
        if (name && value) acc[name] = value;
        return acc;
    }, {});
    executionButton.innerText == "Executing..."
    if(url.includes("localhost") || url.includes("172.0.0")){
        alert("Localhost Request not Supported")
        return
    }
    if (url.length < 4) {
        responseContent.textContent = "Error: Specify a request url";
        executionButton.innerText == "Execute"
        return
    }
    const useCorsProxy = requestElement.querySelector('.cors-proxy-toggle').checked;

    responseContainer.classList.add('hidden');

    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const finalUrl = useCorsProxy ? corsProxyUrl + url : url;

    fetch(finalUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: method !== 'GET' ? body : undefined,
        })
        .then(response => response.text())
        .then(data => {
            responseContainer.classList.remove('hidden');
            if (data.includes("/corsdemo")) {
                responseContent.textContent = "Enable cors support for browser at: https://cors-anywhere.herokuapp.com/corsdemo"
                setTimeout(() => {
                    responseContent.textContent = "Redirecting in 5s...";
                }, 2000)
                setTimeout(() => {
                    responseContent.textContent = "Enable pop up for quickServe";
                }, 4500)
                setTimeout(() => {
                    window.open("https://cors-anywhere.herokuapp.com/corsdemo", "_blank")
                }, 7000)
                setTimeout(() => {
                    responseContent.textContent = "If not automatically redirected visit: https://cors-anywhere.herokuapp.com/corsdemo"
                }, 9000)
                executionButton.innerText == "Execute"
                return
            }
            responseContent.textContent = data;
            executionButton.innerText == "Execute"
        })
        .catch(error => {
            executionButton.innerText == "Execute"
            console.log(error)
            responseContent.textContent = `${error}`;
            responseContainer.classList.remove('hidden');
        });
}

function updateSidebar() {
    requestList.innerHTML = '';
    requestsContainer.querySelectorAll('.request-card').forEach(requestElement => {
        const requestId = requestElement.id;
        const requestMethod = requestElement.querySelector('.method-select').value
        const requestName = `${requestMethod}: ${requestElement.querySelector('.request-name').value || 'Unnamed Request'}`;
        const listItem = document.createElement('li');
        listItem.innerHTML = `<a href="#${requestId}" class="block p-2 hover:bg-gray-100 rounded" style="color:var(--color-${requestMethod.toLowerCase()})">${requestName}</a>`;
        requestList.appendChild(listItem);
    });
}

function saveSession() {
    const sessionName = sessionNameInput.value.trim();
    if (!sessionName) {
        alert('Please enter a session name');
        return;
    }

    const requests = Array.from(requestsContainer.children).map(requestElement => ({
        id: requestElement.id.replace('request-', ''),
        name: requestElement.querySelector('.request-name').value,
        method: requestElement.querySelector('.method-select').value,
        url: requestElement.querySelector('.url-input').value,
        body: requestElement.querySelector('.body-input').value,
        headers: Array.from(requestElement.querySelectorAll('.header-row')).map(row => ({
            name: row.querySelector('.header-name').value,
            value: row.querySelector('.header-value').value
        })),
        useCorsProxy: requestElement.querySelector('.cors-proxy-toggle').checked
    }));

    const sessions = JSON.parse(localStorage.getItem('quickServe_sessions') || '[]');
    const sessionIndex = sessions.findIndex(s => s.name === sessionName);

    if (sessionIndex !== -1) {
        sessions[sessionIndex] = {
            name: sessionName,
            requests
        };
    } else {
        if (sessions.length >= 5) {
            sessions.shift();
        }
        sessions.push({
            name: sessionName,
            requests
        });
    }

    localStorage.setItem('quickServe_sessions', JSON.stringify(sessions));
    updateSessionList();
}

function loadSession() {
    const sessionName = loadSessionSelect.value;
    if (!sessionName) return;

    const sessions = JSON.parse(localStorage.getItem('quickServe_sessions') || '[]');
    const session = sessions.find(s => s.name === sessionName);

    if (session) {
        requestsContainer.innerHTML = '';
        session.requests.forEach(requestData => {
            const requestElement = createRequestElement(requestData);
            requestsContainer.appendChild(requestElement);
        });
        updateSidebar();
    }
}

function deleteSession() {
    const sessionName = loadSessionSelect.value;
    if (!sessionName) {
        alert('Please select a session to delete');
        return;
    }

    const sessions = JSON.parse(localStorage.getItem('quickServe_sessions') || '[]');
    const updatedSessions = sessions.filter(s => s.name !== sessionName);
    localStorage.setItem('quickServe_sessions', JSON.stringify(updatedSessions));
    updateSessionList();
}

function updateSessionList() {
    const sessions = JSON.parse(localStorage.getItem('quickServe_sessions') || '[]');
    loadSessionSelect.innerHTML = '<option value="">Select a session</option>';
    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.name;
        option.textContent = session.name;
        loadSessionSelect.appendChild(option);
    });
}

addRequestButton.addEventListener('click', () => {
    const newRequest = createRequestElement();
    requestsContainer.appendChild(newRequest);
    updateSidebar();
});

saveSessionButton.addEventListener('click', saveSession);
loadSessionButton.addEventListener('click', loadSession);
deleteSessionButton.addEventListener('click', deleteSession);

// Initialize
updateSessionList();