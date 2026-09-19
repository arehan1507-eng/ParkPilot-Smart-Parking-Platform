const tools = [
  { icon: "⚠", name: "Scam & incident help", prompt: "I may have encountered a scam or cyber incident", intro: "Act quickly: stop contact, avoid sending more money or codes, preserve screenshots and receipts, then use an official reporting channel.", links: [["Scam advice & alerts", "ScamShield", "https://www.scamshield.gov.sg/"], ["Cyber security alerts", "CSA Singapore", "https://www.csa.gov.sg/alerts-advisories"], ["Police newsroom", "Singapore Police Force", "https://www.police.gov.sg/media-room/news"]] },
  { icon: "◉", name: "Threat & link check", prompt: "Check a suspicious link, domain, or IP", intro: "Do not open a suspicious link. Check it with these defensive resources first; only investigate systems you own or are authorized to assess.", links: [["URL reputation scan", "VirusTotal", "https://www.virustotal.com/gui/home/url"], ["Domain registration", "SGNIC WHOIS", "https://www.sgnic.sg/domain-search"], ["IP & network context", "IPinfo", "https://ipinfo.io/"], ["Threat intelligence search", "Shodan", "https://www.shodan.io/"]] },
  { icon: "◌", name: "Phone & scam calls", prompt: "Check a suspicious phone number", intro: "Do not share OTPs, passwords, or banking details. Caller-ID tools can help identify patterns, but are not conclusive proof.", links: [["Caller identification", "Truecaller", "https://www.truecaller.com/"], ["Scam call lookup", "Whoscall", "https://whoscall.com/en/"], ["Scam reporting & advice", "ScamShield", "https://www.scamshield.gov.sg/"]] },
  { icon: "⌁", name: "Account security", prompt: "Secure an online account", intro: "Change the password from a trusted device, enable multi-factor authentication, end unknown sessions, and review recovery details.", links: [["Password & MFA guidance", "CSA Singapore", "https://www.csa.gov.sg/learn-cybersecurity/for-individuals"], ["Check exposed email", "Have I Been Pwned", "https://haveibeenpwned.com/"], ["Account security advice", "CISA", "https://www.cisa.gov/secure-our-world"]] },
  { icon: "◈", name: "Image verification", prompt: "Verify an image or screenshot", intro: "Use reverse-image tools to find prior public appearances. Compare date, location, source, and visible details before trusting the image.", links: [["Reverse image search", "Google Images", "https://images.google.com/"], ["Visual search", "Bing Visual Search", "https://www.bing.com/visualsearch"], ["Image verification toolkit", "InVID", "https://www.invid-project.eu/tools-and-services/invid-verification-plugin/"]] },
  { icon: "⌘", name: "Cyber news & alerts", prompt: "Find current cyber news and alerts", intro: "Use authoritative advisories for actionable information, then corroborate news reports with the original source.", links: [["Official cyber alerts", "CSA Singapore", "https://www.csa.gov.sg/alerts-advisories"], ["Cyber security advisories", "CISA", "https://www.cisa.gov/news-events/cybersecurity-advisories"], ["Singapore cyber news", "The Straits Times", "https://www.straitstimes.com/singapore/courts-crime"]] },
  { icon: "⌕", name: "Public OSINT", prompt: "Start an ethical public-information search", intro: "Use public records responsibly. Do not target private individuals, bypass access controls, or collect sensitive personal data.", links: [["Company information", "ACRA BizFile", "https://www.bizfile.gov.sg/"], ["Singapore government directory", "SGDI", "https://www.sgdi.gov.sg/"], ["Open data portal", "data.gov.sg", "https://data.gov.sg/"], ["OSINT toolkit", "Intel Techniques", "https://inteltechniques.com/tools/"]] }
];

const nav = document.querySelector('#toolNav');
const messages = document.querySelector('#messages');
const suggestions = document.querySelector('#suggestions');
const form = document.querySelector('#composer');
const input = document.querySelector('#messageInput');

function navItem(tool, index) {
  const button = document.createElement('button');
  button.className = `tool-item ${index === 0 ? 'active' : ''}`;
  button.innerHTML = `<span class="num">${String(index + 1).padStart(2,'0')}</span><span class="icon">${tool.icon}</span><span>${tool.name}</span>`;
  button.addEventListener('click', () => selectTool(tool, button));
  nav.append(button);
}
tools.forEach(navItem);

function addMessage(content, user = false) {
  const item = document.createElement('div');
  item.className = `message ${user ? 'user' : 'bot'}`;
  item.innerHTML = `<div class="avatar">${user ? 'YOU' : 'SL'}</div><div class="bubble">${content}</div>`;
  messages.append(item);
  messages.scrollTop = messages.scrollHeight;
}

function showSuggestions(items = ['Research a company', 'Check a website', 'Explore public records']) {
  suggestions.innerHTML = '';
  items.forEach(text => {
    const chip = document.createElement('button');
    chip.className = 'suggestion'; chip.type = 'button'; chip.textContent = text;
    chip.addEventListener('click', () => handleMessage(text));
    suggestions.append(chip);
  });
}

function selectTool(tool, button) {
  document.querySelectorAll('.tool-item').forEach(el => el.classList.remove('active'));
  button.classList.add('active');
  addMessage(tool.prompt, true);
  setTimeout(() => {
    const resources = tool.links.map(([label, source, url]) => `<a class="resource" href="${url}" target="_blank" rel="noopener"><span><small>${source.toUpperCase()}</small><br>${label}</span><b>OPEN ↗</b></a>`).join('');
    addMessage(`<p>${tool.intro}</p><div class="tool-results">${resources}</div>`);
  }, 250);
  showSuggestions([`More ${tool.name.toLowerCase()} tools`, 'How should I verify this?', 'Return to main menu']);
}

function resourcesHtml(links) {
  return `<div class="tool-results">${links.map(([label, source, url]) => `<a class="resource" href="${url}" target="_blank" rel="noopener"><span><small>${source.toUpperCase()}</small><br>${label}</span><b>OPEN ↗</b></a>`).join('')}</div>`;
}

function replyFor(message) {
  const text = message.toLowerCase();
  if (text.includes('scam') || text.includes('phish') || text.includes('money') || text.includes('incident')) return `If money, an OTP, or credentials were involved, stop engaging and contact the affected bank or service through its official app/number. Preserve evidence. Here are the safest next resources.${resourcesHtml(tools[0].links)}`;
  if (text.includes('link') || text.includes('website') || text.includes('domain') || text.includes('ip ')) return `Avoid clicking or downloading anything from the suspicious source. These tools can provide public reputation and infrastructure context.${resourcesHtml(tools[1].links)}`;
  if (text.includes('phone') || text.includes('call') || text.includes('number')) return `Never reveal an OTP or remote-access code to a caller. Check the number using these services, then report suspicious activity.${resourcesHtml(tools[2].links)}`;
  if (text.includes('hack') || text.includes('password') || text.includes('account') || text.includes('breach')) return `Start by changing the password from a known-safe device and enabling MFA. These resources guide the next steps.${resourcesHtml(tools[3].links)}`;
  if (text.includes('image') || text.includes('photo') || text.includes('screenshot')) return `Check whether the image has appeared elsewhere online and look for the original context.${resourcesHtml(tools[4].links)}`;
  if (text.includes('news') || text.includes('alert') || text.includes('advisory')) return `For up-to-date cyber information, start with official advisories, then corroborate reporting.${resourcesHtml(tools[5].links)}`;
  if (text.includes('back') || text.includes('menu')) return 'You’re back at the main console. Select a cybersecurity module above, or tell me what you need to check.';
  return 'Tell me what you are trying to check — for example a <strong>suspicious link</strong>, <strong>scam call</strong>, <strong>account breach</strong>, or <strong>cyber alert</strong> — and I’ll recommend the relevant trusted links.';
}
function handleMessage(value) {
  const msg = value.trim(); if (!msg) return;
  addMessage(msg, true); input.value = '';
  setTimeout(() => addMessage(`<p>${replyFor(msg)}</p>`), 270);
}
form.addEventListener('submit', event => { event.preventDefault(); handleMessage(input.value); });
document.querySelector('#clearChat').addEventListener('click', () => { messages.innerHTML = ''; welcome(); });
function welcome() { addMessage('<p><strong>Welcome to SingaScope.</strong><br>I’m your cyber safety and public-information guide. Tell me what happened, and I’ll suggest the most relevant trusted resources.</p>'); showSuggestions(['Check a suspicious link', 'I received a scam call', 'Secure my account']); }
welcome();
