/**
 * @file Service layer that acts as an intermediary between controllers and data access layer.
 * Handles business logic, error handling, and data transformation.
 */

import { FastifyReply } from 'fastify';
import Controller from './controller';

/**
 * Generic service class that provides CRUD operations and additional business logic
 * for a given model type. Acts as a bridge between controllers and the data access layer.
 *
 * @template T - The type of the model this service operates on
 */
class Service<T extends object> {
	/** The controller instance used for data access operations */
	controller: Controller<T>;

	/**
	 * Creates a new Service instance
	 * @param controller - The controller instance to use for data access
	 */
	constructor (controller: Controller<T>) {
		this.controller = controller;
	}

	/**
	 * Creates a new record in the database
	 * @param data - The data to create the record with
	 * @returns The created record
	 * @throws Will throw an error if creation fails
	 */
	async create (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) {
		try {
			return await this.controller.create(data);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Creates a new record in the database with default values
	 * @param data - The data to create the record with
	 * @returns The created record
	 * @throws Will throw an error if creation fails
	 */
	async createDefault (data: T) {
		try {
			return await this.controller.createDefault(data);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Retrieves all records from the database
	 * @returns An array of all records
	 * @throws Will throw an error if retrieval fails
	 */
	async getAll (options?: {
		orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
		omit?: {
			[key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean;
		};
		include?: { [key: string]: boolean; };
	}) {
		try {
			return await this.controller.getAll(options);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Retrieves a single record by its ID
	 * @param id - The ID of the record to retrieve
	 * @returns The found record
	 * @throws {Error} Will throw a 404 error if record is not found
	 * @throws Will throw a 500 error if retrieval fails
	 */
	async getById (
		id: string,
		options?: {
			include?: { [key: string]: boolean; };
		}
	) {
		try {
			const result = await this.controller.getById(id, options);
			if (!result) {
				const error: any = new Error('Not found');
				error.statusCode = 404;
				throw error;
			}
			return result;
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Finds a single record that matches the query
	 * @param query - The query to match against
	 * @returns The first matching record or null if none found
	 * @throws Will throw an error if the query fails
	 */
	async find (
		query: { [key in keyof T]?: T[key] },
		options?: {
			include?: { [key: string]: boolean; };
		}
	) {
		try {
			return await this.controller.find(query, options);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Counts the number of records that match the query
	 * @param query - The query conditions to match
	 * @returns The count of matching records
	 * @throws Will throw an error if count fails
	 */
	async count (
		query?: { [key in keyof T]?: T[key] },
		options?: {
			include?: { [key: string]: boolean; };
		}
	): Promise<number> {
		try {
			return await this.controller.count(query, options);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Updates a record by ID with the provided data
	 * @param id - The ID of the record to update
	 * @param data - The data to update
	 * @returns The updated record
	 * @throws Will throw an error if update fails
	 */
	async update (id: string, data: Partial<T>) {
		try {
			return await this.controller.update(id, data);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Updates multiple records that match the query
	 * @param query - The query conditions to match
	 * @param data - The data to update
	 * @returns The updated records
	 * @throws Will throw an error if update fails
	 */
	async updateMany (query: { [key in keyof T]?: T[key] }, data: Partial<T>) {
		try {
			return await this.controller.updateMany(query, data);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Deletes a record by ID
	 * @param id - The ID of the record to delete
	 * @returns The deleted record
	 * @throws Will throw an error if deletion fails
	 */
	async delete (id: string) {
		try {
			return await this.controller.delete(id);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Deletes multiple records that match the query
	 * @param query - The query conditions to match
	 * @returns The deleted records
	 * @throws Will throw an error if deletion fails
	 */
	async deleteMany (query: { [key in keyof T]?: T[key] }) {
		try {
			return await this.controller.deleteMany(query);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Searches for records matching the query with pagination and sorting options
	 * @param query - The search criteria
	 * @param options - Pagination and sorting options
	 * @param options.page - The page number (1-based)
	 * @param options.take - Number of records per page
	 * @param options.orderBy - Sorting criteria
	 * @param options.include - Related models to include
	 * @param strict - If true, uses exact matching instead of partial matching
	 * @returns Paginated search results or exact matches based on strict mode
	 * @throws Will throw an error if search fails
	 */
	async search (
		query: { [key in keyof T]?: T[key] },
		options?: {
			page?: number;
			take?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			include?: { [key: string]: boolean; };
		}
	): Promise<
		| T[]
		| {
			record: T[];
			count: number;
			items: number;
			pages: number;
			currentPage: number;
		}
	> {
		try {
			let passingOptions: {
				take: number;
				skip: number;
				orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			};

			if (!options) {
				passingOptions = {
					take: 10,
					skip: 0
				};
			} else {
				passingOptions = {
					take: options.take || 10,
					skip: ((options.page || 1) - 1) * (options.take || 10),
					orderBy: options.orderBy
				};
			}

			return await this.controller.search(query, passingOptions);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Searches for records approximately matching the query with pagination and sorting options
	 * @param query - The search criteria
	 * @param options - Pagination and sorting options
	 * @param options.page - The page number (1-based)
	 * @param options.take - Number of records per page
	 * @param options.orderBy - Sorting criteria
	 * @param options.include - Related models to include
	 * @returns Paginated search results
	 * @throws Will throw an error if search fails
	 */
	async paginatedSearch (
		query: { [key in keyof T]?: T[key] },
		options?: {
			page?: number;
			take?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			include?: { [key: string]: boolean; };
		}
	): Promise<{
		record: T[];
		count: number;
		items: number;
		pages: number;
		currentPage: number;
	}> {
		try {
			let passingOptions: {
				take: number;
				skip: number;
				orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
				include?: { [key: string]: boolean; };
			};

			if (!options) {
				passingOptions = {
					take: 10,
					skip: 0
				};
			} else {
				passingOptions = {
					take: options.take || 10,
					skip: ((options.page || 1) - 1) * (options.take || 10),
					orderBy: options.orderBy,
					include: options?.include
				};
			}

			return await this.controller.paginatedSearch(query, passingOptions);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Exports records in the specified format
	 * @param format - The export format (e.g., 'csv', 'json', 'xlsx', 'pdf')
	 * @param reply - Fastify reply object for streaming the response
	 * @param query - Optional query to filter records
	 * @param options - Export options
	 * @param options.take - Number of records to export
	 * @param options.skip - Number of records to skip
	 * @param options.orderBy - Sorting criteria
	 * @param options.omit - Fields to omit from the export
	 * @returns A promise that resolves when the export is complete
	 * @throws Will throw an error if export fails or format is unsupported
	 */
	async export (
		format: string,
		reply: FastifyReply,
		query?: { [key in keyof T]?: T[key] },
		options?: {
			take?: number;
			skip?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			omit?: { [key in keyof T]?: boolean };
		}
	): Promise<void> {
		try {
			switch (format) {
				case 'pdf':
					await this.controller.exportAsPdf(reply, query, options);
					break;
				case 'json':
					await this.controller.exportAsJson(reply, query, options);
					break;
				case 'csv':
					await this.controller.exportAsCsv(reply, query, options);
					break;
				case 'xlsx':
					await this.controller.exportAsXlsx(reply, query, options);
					break;
				default:
					const statusCode = 400;
					const error: any = new Error('Unspecified format.');
					error.statusCode = statusCode.toString();
					throw error;
			}
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}
}

export default Service;
