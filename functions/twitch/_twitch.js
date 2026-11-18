export const SCOPE = 'channel:read:redemptions';

export async function twitchToken(env, params) {
    const res = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: env.TWITCH_CLIENT_ID,
            client_secret: env.TWITCH_CLIENT_SECRET,
            ...params,
        }),
    });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
}

export async function validate(accessToken) {
    const res = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: { Authorization: `OAuth ${accessToken}` },
    });
    return res.ok ? res.json() : null;
}

export async function saveTokens(env, data, userId) {
    await env.TWITCH_KV.put(
        'auth',
        JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + data.expires_in * 1000,
            user_id: userId,
        }),
    );
}

export const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });

export const page = (text, status = 200) =>
    new Response(
        `<!doctype html><meta charset="utf-8"><title>skeleton</title><body style="background:#222;color:#fff;font:1.5rem sans-serif;display:grid;place-content:center;height:100vh;margin:0"><p>${text}</p>`,
        { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
    );

export function safeEqual(a = '', b = '') {
    const enc = new TextEncoder();
    const x = enc.encode(a);
    const y = enc.encode(b);
    if (x.byteLength !== y.byteLength) return false;
    return crypto.subtle.timingSafeEqual(x, y);
}
