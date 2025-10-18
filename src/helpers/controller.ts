/**
 * @file Controller layer that handles direct database operations.
 * Provides a generic interface for CRUD operations and data export functionality.
 * Acts as an abstraction layer between the service layer and the database client.
 */

// Require is used here because of TypeScript errors with pdfkit-table types
const pdfTable = require('pdfkit-table');
import { Parser } from 'json2csv';
import { FastifyReply } from 'fastify';
import { client } from '../db';
import ExcelJS from 'exceljs';

/**
 * Generic controller class that provides database operations for a specific model.
 * Handles CRUD operations and data export functionality.
 *
 * @template T - The type of the model this controller operates on
 */
class Controller<T extends object> {
	/** The Prisma client collection for the model */
	protected collection: any;

	/** The name of the model (capitalized) */
	private name: string;

	/**
	 * Creates a new Controller instance for the specified collection
	 * @param collection - The name of the Prisma model (lowercase)
	 */
	constructor (collection: string) {
		this.collection = client[collection];
		this.name = collection.charAt(0).toUpperCase() + collection.slice(1);
	}

	/**
	 * Creates a new record in the database
	 * @param data - The data to create the record with (excluding id, createdAt, updatedAt)
	 * @returns The created record
	 * @throws {Error} Will throw a 500 error if creation fails
	 */
	async create (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
		try {
			return await this.collection.create({
				data
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}
	/**
	 * Creates a new record in the database with default values
	 * @param data - The data to create the record with
	 * @returns The created record
	 * @throws {Error} Will throw a 500 error if creation fails
	 */
	async createDefault (data: T) {
		try {
			return await this.collection.create({
				data
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Retrieves a single record by its ID
	 * @param id - The ID of the record to retrieve
	 * @returns The found record or null if not found
	 * @throws {Error} Will throw a 404 error if record is not found
	 */
	async getById (
		id: string,
		options?: {
			include?: { [key: string]: boolean; };
		}
	): Promise<T> {
		try {
			return await this.collection.findUnique({
				where: { id },
				...options
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '404';
			throw error;
		}
	}

	/**
	 * Retrieves all records from the database
	 * @returns An array of all records
	 * @throws {Error} Will throw a 500 error if retrieval fails
	 */
	async getAll (options?: {
		orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
		omit?: {
			[key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean;
		};
		include?: { [key: string]: boolean; };
	}): Promise<T[]> {
		try {
			return await this.collection.findMany({
				...options
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Finds the first record that matches the query
	 * @param query - The query conditions to match
	 * @returns The first matching record or null if none found
	 * @throws {Error} Will throw a 500 error if query fails
	 */
	async find (
		query: { [key in keyof T]?: T[key] },
		options?: {
			include?: { [key: string]: boolean; };
		}
	): Promise<T> {
		try {
			return await this.collection.findFirst({
				where: { ...query },
				...options
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Searches for records that match the query with exact matching
	 * @param query - The query conditions to match
	 * @param options - Search options (pagination, sorting, relations)
	 * @returns An array of matching records
	 * @throws {Error} Will throw a 500 error if search fails
	 */
	async search (
		query: { [key in keyof T]?: T[key] },
		options?: {
			take?: number;
			skip?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			include?: { [key: string]: boolean; };
		}
	): Promise<T[]> {
		try {
			return await this.collection.findMany({
				where: { ...query },
				...options
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Performs a paginated search with partial matching on string fields
	 * @param query - The query conditions to match (partial matches on string fields)
	 * @param options - Pagination and sorting options
	 * @returns An object containing paginated results and metadata
	 * @throws {Error} Will throw a 500 error if search fails
	 */
	async paginatedSearch (
		query: { [key in keyof T]?: T[key] },
		options: {
			take: number;
			skip: number;
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
		const where =
			Object.keys(query).length !== 0
				? {
					OR: Object.keys(query).map(key => ({
						[key]: { contains: query[key] }
					}))
				}
				: query;

		try {
			const [record, count, items] = await Promise.all([
				this.collection.findMany({ where, ...options }),
				this.collection.count({ where }),
				this.collection.count()
			]);

			const pages = Math.ceil(items / (options?.take || 10));
			const currentPage = Math.floor(options.skip / options.take) + 1;

			return { record, count, items, pages, currentPage };
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Counts the number of records that match the query
	 * @param query - The query conditions to match
	 * @returns The count of matching records
	 * @throws {Error} Will throw a 500 error if count fails
	 */
	async count (
		query?: { [key in keyof T]?: T[key] },
		options?: {
			include?: { [key: string]: boolean; };
		}
	): Promise<number> {
		try {
			return await this.collection.count({ where: { ...query }, ...options });
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Updates a record by ID
	 * @param id - The ID of the record to update
	 * @param data - The data to update
	 * @returns The updated record
	 * @throws {Error} Will throw a 500 error if update fails
	 */
	async update (id: string, data: Partial<T>): Promise<T> {
		try {
			return await this.collection.update({
				where: { id },
				data
			});
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
	 * @throws {Error} Will throw a 500 error if update fails
	 */
	async updateMany (query: { [key in keyof T]?: T[key] | undefined }, data: Partial<T>) {
		try {
			return await this.collection.updateMany({
				where: { ...query },
				data
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Deletes a record by ID
	 * @param id - The ID of the record to delete
	 * @returns The deleted record
	 * @throws {Error} Will throw a 500 error if deletion fails
	 */
	async delete (id: string): Promise<T> {
		try {
			return await this.collection.delete({
				where: { id }
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Deletes multiple records that match the query
	 * @param query - The query conditions to match
	 * @returns The deleted records
	 * @throws {Error} Will throw a 500 error if deletion fails
	 */
	async deleteMany (query: { [key in keyof T]?: T[key] | undefined }) {
		try {
			return await this.collection.deleteMany({
				where: { ...query }
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Exports records as a CSV file
	 * @param reply - Fastify reply object for streaming the response
	 * @param query - Optional query to filter records
	 * @param options - Export options (pagination, sorting, field selection)
	 * @returns A CSV file download
	 */
	async exportAsCsv (
		reply: FastifyReply,
		query?: { [key in keyof T]?: T[key] },
		options?: {
			take?: number;
			skip?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			omit?: {
				[key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean;
			};
		}
	) {
		const defaultOmit = {
			id: true,
			createdAt: true,
			updatedAt: true
		};

		try {
			const data: T[] = await this.collection.findMany({
				where: { ...query },
				...options,
				omit: { ...defaultOmit, ...options?.omit }
			});

			if (data.length === 0) {
				throw new Error('No data to export');
			}

			const parser = new Parser({
				fields: Object.keys(data[0]),
				excelStrings: true
			});

			const document = parser.parse(data);
			return reply
				.header('Content-Type', 'text/csv')
				.header('Content-Disposition', `attachment; filename=${this.name}.csv`)
				.send(document);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Exports records as an Excel file
	 * @param reply - Fastify reply object for streaming the response
	 * @param query - Optional query to filter records
	 * @param options - Export options (pagination, sorting, field selection)
	 * @returns An Excel file download
	 */
	async exportAsXlsx (
		reply: FastifyReply,
		query?: { [key in keyof T]?: T[key] },
		options?: {
			take?: number;
			skip?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			omit?: {
				[key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean;
			};
		}
	) {
		const defaultOmit = {
			id: true,
			createdAt: true,
			updatedAt: true
		};

		try {
			const data: T[] = await this.collection.findMany({
				where: { ...query },
				...options,
				omit: { ...defaultOmit, ...options?.omit }
			});

			if (data.length === 0) {
				throw new Error('No data to export');
			}

			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet(this.name);

			// Add headers
			const headers = Object.keys(data[0]);
			worksheet.addRow(headers);

			// Add data rows
			data.forEach(item => {
				worksheet.addRow(Object.values(item as object));
			});

			// Generate buffer
			const buffer = await workbook.xlsx.writeBuffer();

			return reply
				.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
				.header('Content-Disposition', `attachment; filename=${this.name}.xlsx`)
				.send(buffer);
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Exports records as a PDF file
	 * @param reply - Fastify reply object for streaming the response
	 * @param query - Optional query to filter records
	 * @param options - Export options (pagination, sorting, field selection)
	 * @returns A PDF file download
	 */
	async exportAsPdf (
		reply: FastifyReply,
		query?: { [key in keyof T]?: T[key] },
		options?: {
			take?: number;
			skip?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			omit?: {
				[key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean;
			};
		}
	) {
		const defaultOmit = {
			id: true,
			createdAt: true,
			updatedAt: true
		};

		try {
			const data: T[] = await this.collection.findMany({
				where: { ...query },
				...options,
				omit: { ...defaultOmit, ...options?.omit }
			});

			if (data.length === 0) {
				throw new Error('No data to export');
			}

			const headers = Object.keys(data[0]);
			const rows = data.map(item => Object.values(item as object));

			const doc = new pdfTable({
				margin: 30,
				size: 'A4'
			});

			const table = {
				headers: headers,
				rows: rows
			};

			return new Promise((resolve, reject) => {
				const chunks: any[] = [];

				doc.on('data', (chunk: any) => chunks.push(chunk));
				doc.on('end', () => {
					const result = Buffer.concat(chunks);
					resolve(
						reply
							.header('Content-Type', 'application/pdf')
							.header('Content-Disposition', `attachment; filename=${this.name}.pdf`)
							.send(result)
					);
				});

				doc.table(table, {
					prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
					prepareRow: () => doc.font('Helvetica').fontSize(10)
				});

				doc.end();
			});
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}

	/**
	 * Exports records as a JSON file
	 * @param reply - Fastify reply object for streaming the response
	 * @param query - Optional query to filter records
	 * @param options - Export options (pagination, sorting, field selection)
	 * @returns A JSON file download
	 */
	async exportAsJson (
		reply: FastifyReply,
		query?: { [key in keyof T]?: T[key] },
		options?: {
			take?: number;
			skip?: number;
			orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
			omit?: {
				[key in keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'>]?: boolean;
			};
		}
	) {
		const defaultOmit = {
			id: true,
			createdAt: true,
			updatedAt: true
		};

		try {
			const data: T[] = await this.collection.findMany({
				where: { ...query },
				...options,
				omit: { ...defaultOmit, ...options?.omit }
			});

			if (data.length === 0) {
				throw new Error('No data to export');
			}

			return reply
				.header('Content-Type', 'application/json')
				.header('Content-Disposition', `attachment; filename=${this.name}.json`)
				.send(JSON.stringify(data, null, 2));
		} catch (error: any) {
			if (!error.statusCode) error.statusCode = '500';
			throw error;
		}
	}
}

export default Controller;
