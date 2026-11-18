import { json, safeEqual, saveTokens, twitchToken } from './_twitch.js';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    if (!env.SKELETON_KEY || !safeEqual(url.searchParams.get('key') ?? '', env.SKELETON_KEY))
        return json({ error: 'bad key' }, 401);

    const auth = await env.TWITCH_KV.get('auth', 'json');
    if (!auth) return json({ error: 'not connected - visit /twitch/login' }, 409);

    const fresh = auth.expires_at - Date.now() > 10 * 60 * 1000;
    if (fresh && !url.searchParams.has('force')) return json(reply(env, auth));

    const { ok, status, data } = await twitchToken(env, {
        grant_type: 'refresh_token',
        refresh_token: auth.refresh_token,
    });
    if (!ok) {
        const revoked = status === 400 || status === 401;
        return json({ error: revoked ? 'login revoked - visit /twitch/login' : 'twitch refresh failed' }, revoked ? 409 : 502);
    }
    await saveTokens(env, data, auth.user_id);
    return json(reply(env, { ...data, user_id: auth.user_id }));
}

const reply = (env, auth) => ({ access_token: auth.access_token, client_id: env.TWITCH_CLIENT_ID, user_id: auth.user_id });
