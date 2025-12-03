/**
 * @fileoverview FrankFMY Platform — Initiative Development
 * @author Artyom Pryanishnikov | @license PolyForm-Shield-1.0.0
 */

import { Elysia } from 'elysia';

export const requestLogger = new Elysia({ name: 'request-logger' })
	.derive(() => ({
		startTime: Date.now()
	}))
	.onRequest(({ request }) => {
		const method = request.method;
		const url = new URL(request.url);
		console.log(`→ ${method} ${url.pathname}`);
	})
	.onAfterResponse(({ request, set, startTime }) => {
		const duration = Date.now() - startTime;
		const method = request.method;
		const url = new URL(request.url);
		const status = Number(set.status ?? 200);

		const statusColor =
			status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
		const reset = '\x1b[0m';

		console.log(
			`← ${method} ${url.pathname} ${statusColor}${status}${reset} ${duration}ms`
		);
	});
