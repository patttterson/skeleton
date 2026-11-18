import { SCOPE } from './_twitch.js';

export async function onRequestGet({ request, env }) {
    const state = crypto.randomUUID();
    const url = new URL('https://id.twitch.tv/oauth2/authorize');
    url.search = new URLSearchParams({
        response_type: 'code',
        client_id: env.TWITCH_CLIENT_ID,
        redirect_uri: new URL('/twitch/callback', request.url).href,
        scope: SCOPE,
        state,
        force_verify: 'true',
    });
    return new Response(null, {
        status: 302,
        headers: {
            Location: url.href,
            'Set-Cookie': `twitch_state=${state}; Path=/twitch; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
            'Cache-Control': 'no-store',
        },
    });
}
