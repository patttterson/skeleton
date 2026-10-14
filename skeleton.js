const script = [...document.scripts].find((s) => s.src === import.meta.url);
const opt = (name, def) => Number(script?.dataset[name] ?? def);
const frames = Array.from({ length: 33 }, (_, i) => new URL(`frames/frame_${i}.webp`, import.meta.url).href);

const G = 1.2128;
const DX = -737.6;
const DY = -25.5;

function planRun(W, V) {
	const want = (opt('size', 15) / 100) * (V / 420);
	let n = 0;
	let s;
	while (true) {
		const gn = G ** n;
		s = W / (1280 - 140 * gn - (DX * (gn - 1)) / (G - 1));
		if (s <= want || n >= 6) break;
		n++;
	}
	const gn = G ** n;
	const bottom = s * (530 * gn + (DY * (gn - 1)) / (G - 1));
	const ox = W - 1280 * s;
	const oy = (V - 50 * s - bottom) / 2;

	const seq = [];
	for (let i = 1; i < 14; i++) seq.push([i, 0]);
	for (let k = 0; k < n; k++) for (let i = 14; i < 24; i++) seq.push([i, k]);
	for (let i = 14; i < 33; i++) seq.push([i, n]);

	return seq.map(([i, k]) => {
		const gk = G ** k;
		const sk = (gk - 1) / (G - 1);
		return { src: frames[i], scale: s * gk, x: ox + s * DX * sk, y: oy + s * DY * sk };
	});
}

const img = document.createElement('img');
img.alt = '';
img.style.cssText =
	`position:fixed;top:0;left:0;width:1280px;max-width:none;transform-origin:top left;pointer-events:none`;

let timer;
let running = false;

function runSkeleton() {
	clearInterval(timer);
	const steps = planRun(innerWidth, innerHeight);
	let tick = 0;
	running = true;
	const show = () => {
		const s = steps[tick];
		img.src = s.src;
		img.style.transform = `translate(${s.x}px, ${s.y}px) scale(${s.scale})`;
	};
	show();
	img.style.zIndex = opt('z', -10);
	document.body.append(img);
	timer = setInterval(() => {
		if (++tick >= steps.length) {
			clearInterval(timer);
			img.remove();
			running = false;
		} else show();
	}, 1000 / opt('fps', 40));
}

for (const src of frames) new Image().src = src;
window.runSkeleton = runSkeleton;
setInterval(() => {
	if (!running && Math.random() < opt('chance', 1 / 1000)) runSkeleton();
}, 1000);
