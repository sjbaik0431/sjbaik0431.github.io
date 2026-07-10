/**
 * lexington-sms — 산단분양.com 문의 SMS 알림 중계 (Solapi)
 *
 * Cloudflare 대시보드 → Workers & Pages → Create Worker → 이름 "lexington-sms"
 * → Edit code에 이 파일 전체를 붙여넣고 Deploy.
 *
 * 그 후 Settings → Variables and Secrets 에 4개 추가:
 *   SOLAPI_API_KEY    (Secret) — Solapi 콘솔에서 발급한 API Key
 *   SOLAPI_API_SECRET (Secret) — API Secret
 *   SMS_SENDER        (Text)   — Solapi에 등록된 발신번호 (예: 01034045955)
 *   SMS_RECEIVER      (Text)   — 알림 받을 번호: 01034045955
 */

const ALLOW = [
  'https://xn--6j1b64rtpc22g.com',
  'https://www.xn--6j1b64rtpc22g.com',
  'https://shiny-surf-fdae.bsj0431.workers.dev',
  'http://localhost:5510',
];

function cors(origin) {
  const o = ALLOW.includes(origin) ? origin : ALLOW[0];
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(obj, origin, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (req.method !== 'POST') return new Response('lexington-sms OK', { headers: cors(origin) });

    let d = {};
    try { d = await req.json(); } catch (e) {}
    const company = String(d.company || '').slice(0, 30);
    const name = String(d.name || '').slice(0, 20);
    const tel = String(d.tel || '').slice(0, 20);
    const type = String(d.type || '문의').slice(0, 30);
    if (!company && !name) return json({ ok: false, error: 'empty' }, origin, 400);

    const date = new Date().toISOString();
    const salt = crypto.randomUUID().replace(/-/g, '');
    const signature = await hmacHex(env.SOLAPI_API_SECRET, date + salt);

    const text = '[산단분양.com] 새 문의\n' + company + ' ' + name + '\n' + tel + '\n' + type;

    const res = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'HMAC-SHA256 apiKey=' + env.SOLAPI_API_KEY +
          ', date=' + date + ', salt=' + salt + ', signature=' + signature,
      },
      body: JSON.stringify({
        message: { to: env.SMS_RECEIVER, from: env.SMS_SENDER, text },
      }),
    });
    const body = await res.json().catch(() => ({}));
    return json({ ok: res.ok, detail: body.statusMessage || body.errorMessage || res.status }, origin);
  },
};
