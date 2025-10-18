/**
 * @file Database configuration and utilities
 * Provides access to the Prisma client and database connection management.
 */

import { Database as messages } from '../messages';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client instance for database operations.
 * Use this client to perform all database queries.
 *
 * @example
 * // Import and use the client
 * import { client } from './db';
 *
 * // Example query
 * const users = await client.user.findMany();
 */
export const client = new PrismaClient();

/**
 * Gracefully shuts down the database connection.
 * Call this when the application is shutting down to ensure
 * all database connections are properly closed.
 *
 * @example
 * // On application shutdown
 * import { die } from './db';
 *
 * process.on('SIGTERM', die);
 * process.on('SIGINT', die);
 */
export const die = () => {
	client
		.$disconnect()
		.then(() => {
			messages.die();
		})
		.catch(error => {
			console.error('Error disconnecting from database:', error);
		});
};
