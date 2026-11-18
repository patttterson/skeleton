import { page, saveTokens, safeEqual, twitchToken, validate } from './_twitch.js';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const cookieState = /(?:^|;\s*)twitch_state=([^;]+)/.exec(request.headers.get('Cookie') ?? '')?.[1];

    if (url.searchParams.has('error')) return page(`twitch said no: ${escape(url.searchParams.get('error_description'))}`, 400);
    if (!cookieState || !safeEqual(cookieState, url.searchParams.get('state') ?? ''))
        return page('login expired or invalid - try <a style="color:#fff" href="/twitch/login">/twitch/login</a> again', 400);

    const { ok, data } = await twitchToken(env, {
        code: url.searchParams.get('code') ?? '',
        grant_type: 'authorization_code',
        redirect_uri: new URL('/twitch/callback', request.url).href,
    });
    if (!ok) return page(`couldn't get a token from twitch: ${escape(data.message ?? 'unknown error')}`, 502);

    const who = await validate(data.access_token);
    if (!who) return page("twitch gave back a token that doesn't validate", 502);
    if (who.login.toLowerCase() !== String(env.TWITCH_BROADCASTER).toLowerCase())
        return page(`you logged in as ${escape(who.login)}, but this only accepts ${escape(env.TWITCH_BROADCASTER)}`, 403);

    await saveTokens(env, data, who.user_id);
    return new Response(page(`connected as ${escape(who.login)}, you can close this tab`).body, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'Set-Cookie': 'twitch_state=; Path=/twitch; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        },
    });
}

const escape = (s = '') => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
