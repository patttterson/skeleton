# skeleton

this is so stupid.

## Usage
```html
<script type="module" src="https://skeleton.minji.love/skeleton.min.js" data-fps="40" data-size="25" data-z="9999"></script>
```

## OBS

Add a Browser Source pointing at `https://skeleton.minji.love/obs/` w/ resolution set to your output res for random skeletons. Query params (`?size=30&fps=40&chance=0.01`)

### Channel point redemptions (must self host!)

1. Create an app at https://dev.twitch.tv/console/apps. Client type Confidential, OAuth redirect URL `[whatever your domain is]/twitch/callback`.
2. Cloudflare Pages:
   - create a KV namespace and bind it as `TWITCH_KV` (Settings → Bindings)
   - add variables: `TWITCH_CLIENT_ID`, `TWITCH_BROADCASTER` (your Twitch login name)
   - add secrets: `TWITCH_CLIENT_SECRET`, `SKELETON_KEY` (any long random password)
   - redeploy
3. Visit `[domain]/twitch/login` and approve. Only `TWITCH_BROADCASTER` can connect.
4. OBS Browser Source: `[domain]/obs/redeem.html?key=SKELETON_KEY&reward=Summon Skeleton` (`reward` is the reward title or ID, if left out will run on every redemption)

If the page ever logs `login revoked` (password change, app disconnected), visit `/twitch/login` again.

## Build
```bash
bun build skeleton.js --minify --outfile skeleton.min.js
```