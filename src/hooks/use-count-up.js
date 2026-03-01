import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `target` when the returned `ref` element
 * enters the viewport (IntersectionObserver). The animation runs once.
 *
 * @param {number} target   - Final value to count up to.
 * @param {number} duration - Animation duration in ms (default 1400).
 * @returns {{ count: number, ref: React.RefObject }}
 */
export function useCountUp(target, duration = 1400) {
	const [count, setCount] = useState(0);
	const [triggered, setTriggered] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTriggered(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.4 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!triggered) return;

		let raf;
		let start = null;

		const step = (timestamp) => {
			if (!start) start = timestamp;
			const progress = Math.min((timestamp - start) / duration, 1);
			const eased = 1 - (1 - progress) ** 3; // ease-out cubic
			setCount(Math.round(target * eased));
			if (progress < 1) raf = requestAnimationFrame(step);
		};

		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [triggered, target, duration]);

	return { count, ref };
}
