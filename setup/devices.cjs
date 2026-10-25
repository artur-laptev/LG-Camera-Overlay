// SPDX-License-Identifier: GPL-3.0-only
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  net = require("node:net"),
  crypto = require("node:crypto");
const { Client } = require("ssh2");
const { fail, appId } = require("./store.cjs");
function host(value) {
  if (net.isIP(value) !== 4)
    fail("Enter the TV’s local IPv4 address, for example 192.168.1.50.");
  const n = value.split(".").map(Number);
  if (
    !(
      n[0] === 10 ||
      (n[0] === 192 && n[1] === 168) ||
      (n[0] === 172 && n[1] >= 16 && n[1] <= 31)
    )
  )
    fail("Use the TV’s private home-network address.");
  return value;
}
function fingerprint(address) {
  host(address);
  return new Promise((resolve, reject) => {
    const c = new Client();
    let hash;
    const timer = setTimeout(() => {
      c.destroy();
      reject(Error("timeout"));
    }, 9000);
    function done() {
      clearTimeout(timer);
      hash ? resolve(hash) : reject(Error("unreachable"));
    }
    c.on("error", done).on("close", done);
    c.connect({
      host: address,
      port: 9922,
      username: "prisoner",
      readyTimeout: 8000,
      hostHash: "sha256",
      hostVerifier: (h) => {
        hash = h;
        return false;
      },
    });
  });
}
function connect(tv, key) {
  return new Promise((resolve, reject) => {
    const c = new Client();
    c.on("error", reject);
    c.once("ready", () => resolve(c));
    c.connect({
      host: host(tv.host),
      port: 9922,
      username: "prisoner",
      privateKey: key,
      passphrase: tv.passphrase,
      hostHash: "sha256",
      hostVerifier: (h) => h === tv.fingerprint,
      readyTimeout: 10000,
    });
  });
}
function quote(value) {
  return "'" + value.replace(/'/g, "'\\''") + "'";
}
function execJSON(c, command, accept = () => true) {
  return new Promise((resolve, reject) => {
    let stream,
      buffer = "",
      total = 0,
      done = false;
    const timer = setTimeout(
      () => finish(Error("TV operation timed out")),
      45000,
    );
    function finish(error, value) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (stream) stream.close();
      error ? reject(error) : resolve(value);
    }
    c.exec(command, (error, s) => {
      if (error) return finish(error);
      stream = s;
      s.on("error", (e) => finish(e));
      s.on("data", (b) => {
        total += b.length;
        if (total > 262144) return finish(Error("response too large"));
        buffer += b;
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          let r;
          try {
            r = JSON.parse(line);
          } catch {
            continue;
          }
          try {
            if (r.returnValue === false)
              return finish(Error("TV refused operation"));
            if (accept(r)) return finish(null, r);
          } catch (e) {
            return finish(e);
          }
        }
      });
      s.on("close", () => {
        if (!done)
          try {
            const r = JSON.parse(buffer);
            if (r.returnValue !== false && accept(r)) return finish(null, r);
          } catch {}
        finish(Error("TV did not confirm operation"));
      });
    });
  });
}
function luna(c, service, payload, accept) {
  return execJSON(
    c,
    "/usr/bin/luna-send-pub -i " +
      quote("luna://" + service) +
      " " +
      quote(JSON.stringify(payload)),
    accept,
  );
}
async function keyFromTV(address) {
  const r = await fetch("http://" + host(address) + ":9991/webos_rsa", {
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw Error("Key Server unavailable");
  const chunks = [];
  let size = 0;
  for await (const b of r.body) {
    size += b.length;
    if (size > 65536) throw Error("Key too large");
    chunks.push(b);
  }
  return Buffer.concat(chunks);
}
function profiles() {
  const file =
    process.env.WEBOS_DEVICES_FILE ||
    path.join(
      process.platform === "win32" ? process.env.APPDATA : os.homedir(),
      ".webos/tv/novacom-devices.json",
    );
  if (!fs.existsSync(file)) return [];
  try {
    const list = JSON.parse(fs.readFileSync(file, "utf8"));
    return list
      .filter((d) => d.username === "prisoner" && Number(d.port) === 9922)
      .map((d) => ({ name: d.name, host: d.host, record: d }));
  } catch {
    return [];
  }
}
async function prepare(body, existing) {
  const address = host(body.host);
  if (typeof body.passphrase !== "string" || body.passphrase.length > 128)
    fail("Enter the Developer Mode passphrase.");
  let key,
    passphrase = body.passphrase;
  if (body.profile) {
    const p = profiles().find(
      (p) => p.name === body.profile && p.host === address,
    );
    if (!p) fail("That paired profile was not found for this TV.");
    const k = p.record.privateKey?.openSsh || p.record.privateKey;
    if (typeof k !== "string") fail("The profile has no SSH key.");
    key = fs.readFileSync(
      path.isAbsolute(k) ? k : path.join(os.homedir(), ".ssh", k),
    );
    passphrase = p.record.passphrase || "";
  } else key = await keyFromTV(address);
  const pin = await fingerprint(address);
  if (existing?.hostKeySha256 && existing.hostKeySha256 !== pin)
    fail(
      "The TV identity has changed. Check the TV address or reset history; the saved identity was not replaced.",
    );
  return { host: address, key, passphrase, fingerprint: pin };
}
async function verify(d) {
  const c = await connect(d, d.key);
  try {
    let info = {};
    try {
      const result = await luna(
        c,
        "com.webos.service.tv.systemproperty/getSystemInfo",
        { keys: ["modelName", "firmwareVersion", "sdkVersion"] },
      );
      for (const key of ["modelName", "firmwareVersion", "sdkVersion"])
        if (typeof result[key] === "string")
          info[key] = result[key].slice(0, 80);
    } catch {}
    return info;
  } finally {
    c.end();
  }
}
async function withTV(store, tvId, fn) {
  const tv = store.read().tvs[tvId];
  if (!tv) fail("Select a paired TV.");
  const c = await connect(
    { ...tv, fingerprint: tv.hostKeySha256 },
    fs.readFileSync(path.join(store.root, tv.privateKey)),
  );
  try {
    return await fn(c);
  } finally {
    c.end();
  }
}
async function install(store, tvId, artifact) {
  const bytes = fs.readFileSync(artifact);
  return withTV(store, tvId, async (c) => {
    const remote =
      "/media/developer/temp/overlay-" +
      crypto.randomBytes(8).toString("hex") +
      ".ipk";
    await new Promise((resolve, reject) =>
      c.exec("mkdir -p /media/developer/temp", (e, s) => {
        if (e) return reject(e);
        s.on("close", (code) =>
          code ? reject(Error("temp folder failed")) : resolve(),
        );
        s.resume();
      }),
    );
    try {
      await new Promise((resolve, reject) =>
        c.sftp((e, s) => {
          if (e) return reject(e);
          const out = s.createWriteStream(remote, { mode: 0o600 });
          out.on("error", reject).on("close", () => {
            s.end();
            resolve();
          });
          out.end(bytes);
        }),
      );
      return await luna(
        c,
        "com.webos.appInstallService/dev/install",
        { id: appId(), ipkUrl: remote, subscribe: true },
        (r) => {
          const state = r.details?.state || "";
          if (/FAILED/i.test(state)) fail("The TV refused the package.");
          return /installed|^SUCCESS/i.test(state);
        },
      );
    } finally {
      await new Promise((resolve) =>
        c.sftp((e, s) => {
          if (e) return resolve();
          s.unlink(remote, () => {
            s.end();
            resolve();
          });
        }),
      );
    }
  });
}
module.exports = {
  host,
  fingerprint,
  prepare,
  verify,
  profiles,
  install,
  luna,
  withTV,
};
