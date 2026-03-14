import { useEffect, useRef, useState, useCallback } from "react";
import type { TimeOfDay } from "@/features/city/CityVisualization";

// Generate simple ambient tones using Web Audio API oscillators + noise
const createAudioContext = () => {
	return new (window.AudioContext || (window as any).webkitAudioContext)();
};

const createNoiseBuffer = (ctx: AudioContext, duration: number) => {
	const size = ctx.sampleRate * duration;
	const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < size; i++) {
		data[i] = (Math.random() * 2 - 1) * 0.02;
	}
	return buffer;
};

interface SoundLayer {
	gain: GainNode;
	stop: () => void;
}

const createBirdChirps = (ctx: AudioContext, master: GainNode): SoundLayer => {
	const gain = ctx.createGain();
	gain.gain.value = 0.08;
	gain.connect(master);

	let active = true;
	const chirp = () => {
		if (!active) return;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = "sine";
		const baseFreq = 2000 + Math.random() * 2000;
		osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(
			baseFreq * (0.8 + Math.random() * 0.6),
			ctx.currentTime + 0.1,
		);
		g.gain.setValueAtTime(0.3, ctx.currentTime);
		g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
		osc.connect(g);
		g.connect(gain);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.15);
		setTimeout(chirp, 800 + Math.random() * 3000);
	};
	chirp();
	// Second bird
	setTimeout(() => {
		if (!active) return;
		const chirp2 = () => {
			if (!active) return;
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sine";
			const f = 3000 + Math.random() * 1500;
			osc.frequency.setValueAtTime(f, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(
				f * 1.2,
				ctx.currentTime + 0.05,
			);
			osc.frequency.exponentialRampToValueAtTime(
				f * 0.7,
				ctx.currentTime + 0.12,
			);
			g.gain.setValueAtTime(0.2, ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
			osc.connect(g);
			g.connect(gain);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.12);
			setTimeout(chirp2, 1500 + Math.random() * 4000);
		};
		chirp2();
	}, 500);

	return {
		gain,
		stop: () => {
			active = false;
		},
	};
};

const createWaterFlow = (ctx: AudioContext, master: GainNode): SoundLayer => {
	const gain = ctx.createGain();
	gain.gain.value = 0.04;
	gain.connect(master);

	const buffer = createNoiseBuffer(ctx, 2);
	const source = ctx.createBufferSource();
	source.buffer = buffer;
	source.loop = true;

	const filter = ctx.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.value = 800;
	filter.Q.value = 0.5;

	const lfo = ctx.createOscillator();
	const lfoGain = ctx.createGain();
	lfo.frequency.value = 0.3;
	lfoGain.gain.value = 200;
	lfo.connect(lfoGain);
	lfoGain.connect(filter.frequency);
	lfo.start();

	source.connect(filter);
	filter.connect(gain);
	source.start();

	return {
		gain,
		stop: () => {
			try {
				source.stop();
				lfo.stop();
			} catch {}
		},
	};
};

const createCrickets = (ctx: AudioContext, master: GainNode): SoundLayer => {
	const gain = ctx.createGain();
	gain.gain.value = 0.06;
	gain.connect(master);

	let active = true;
	const cricket = (baseFreq: number, delay: number) => {
		setTimeout(() => {
			const loop = () => {
				if (!active) return;
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				osc.type = "square";
				osc.frequency.value = baseFreq + Math.random() * 200;
				g.gain.setValueAtTime(0.15, ctx.currentTime);
				const dur = 0.03 + Math.random() * 0.02;
				// Rapid chirps
				const chirps = 3 + Math.floor(Math.random() * 5);
				for (let i = 0; i < chirps; i++) {
					g.gain.setValueAtTime(0.15, ctx.currentTime + i * dur * 2);
					g.gain.setValueAtTime(0, ctx.currentTime + i * dur * 2 + dur);
				}
				g.gain.setValueAtTime(0, ctx.currentTime + chirps * dur * 2);
				osc.connect(g);
				g.connect(gain);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + chirps * dur * 2 + 0.01);
				setTimeout(loop, 2000 + Math.random() * 5000);
			};
			loop();
		}, delay);
	};
	cricket(4200, 0);
	cricket(4800, 1000);
	cricket(3800, 2000);

	return {
		gain,
		stop: () => {
			active = false;
		},
	};
};

export const useAmbientSounds = (timeOfDay: TimeOfDay) => {
	const [enabled, setEnabled] = useState(false);
	const ctxRef = useRef<AudioContext | null>(null);
	const masterRef = useRef<GainNode | null>(null);
	const layersRef = useRef<{
		birds?: SoundLayer;
		water?: SoundLayer;
		crickets?: SoundLayer;
	}>({});

	const cleanup = useCallback(() => {
		Object.values(layersRef.current).forEach((l) => l?.stop());
		layersRef.current = {};
		if (ctxRef.current && ctxRef.current.state !== "closed") {
			ctxRef.current.close().catch(() => {});
		}
		ctxRef.current = null;
		masterRef.current = null;
	}, []);

	useEffect(() => {
		if (!enabled) {
			cleanup();
			return;
		}

		const ctx = createAudioContext();
		ctxRef.current = ctx;
		const master = ctx.createGain();
		master.gain.value = 0.6;
		master.connect(ctx.destination);
		masterRef.current = master;

		const isDaytime = ["morning", "noon"].includes(timeOfDay);
		const isTransition = ["fajr", "evening"].includes(timeOfDay);
		const isNight = timeOfDay === "night";

		if (isDaytime || isTransition) {
			layersRef.current.birds = createBirdChirps(ctx, master);
			if (isTransition) layersRef.current.birds.gain.gain.value = 0.04;
		}

		layersRef.current.water = createWaterFlow(ctx, master);

		if (isNight || isTransition) {
			layersRef.current.crickets = createCrickets(ctx, master);
			if (isTransition) layersRef.current.crickets.gain.gain.value = 0.03;
		}

		return cleanup;
	}, [enabled, timeOfDay, cleanup]);

	const toggle = useCallback(() => setEnabled((e) => !e), []);

	return { enabled, toggle };
};
