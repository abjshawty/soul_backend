import { Code } from "../services";

/**
 * Default service for initialization logic that runs once at app startup
 */
let initialized = false;

export default async () => {
	if (initialized) return;
	initialized = true;

	try {
		// Add your initialization logic here
		const code = await Code.getByCode('333333');
		if (!code) {
			Code.create({
				code: '333333',
				assignedTo: 'Admin',
				discount: 0
			});
		}
	} catch (error: any) {
		console.error('Failed to initialize default service:', error);
		throw error;
	}
};
