import type { LayoutServerLoad } from './$types'
import { SECRET_OPEN_API_KEY } from '$env/static/private'

export const load = (async () => {
	return {
		apiKey: SECRET_OPEN_API_KEY
	}
}) satisfies LayoutServerLoad
