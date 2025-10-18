/**
 * @file Generator utility for creating CRUD controllers, services, schemas, and routes
 * based on Prisma schema definitions. This module automates the generation of
 * boilerplate code for API endpoints, reducing manual work and ensuring consistency.
 */

import { Prisma } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Represents metadata about a field in a Prisma model
 */
interface FieldInfo {
	/**
	 * The name of the field
	 */
	name: string;
	/**
	 * The type of the field
	 */
	type: string;
	/**
	 * Whether the field is optional
	 */
	isOptional: boolean;
	/**
	 * Whether the field is an ID
	 */
	isId: boolean;
	/**
	 * Whether the field is a relation
	 */
	isRelation: boolean;
	/**
	 * The name of the relation (if applicable)
	 */
	relationName?: string;
	/**
	 * The type of the relation (if applicable)
	 */
	relationTo?: string;
	/**
	 * Whether the field is a list
	 */
	isList: boolean;
}

/**
 * Represents metadata about a Prisma model and its relations
 */
interface ModelInfo {
	/**
	 * The name of the model
	 */
	name: string;
	/**
	 * The fields of the model
	 */
	fields: FieldInfo[];
	/**
	 * The relations of the model
	 */
	relations: {
		/**
		 * The name of the relation
		 */
		name: string;
		/**
		 * The type of the relation
		 */
		type: string;
		/**
		 * Whether the relation is a list
		 */
		isList: boolean;
		/**
		 * The fields of the relation (if applicable)
		 */
		relationFromFields?: readonly string[];
		/**
		 * The fields of the relation (if applicable)
		 */
		relationToFields?: readonly string[];
	}[];
}

/**
 * Main generator class that handles the creation of CRUD components
 * based on Prisma schema definitions.
 *
 * @example
 * // Generate all components for all models
 * const generator = new PrismaGenerator();
 * await generator.generate();
 *
 * // Generate components for a specific model
 * await generator.generate('User');
 */
class PrismaGenerator {
	/**
	 * Collection of parsed Prisma models
	 */
	private models: ModelInfo[] = [];

	/**
	 * Output directories for generated files
	 */
	private outputDirs = {
		/**
		 * Directory for generated controllers
		 */
		controllers: path.join(process.cwd(), 'src', 'controllers'),
		/**
		 * Directory for generated services
		 */
		services: path.join(process.cwd(), 'src', 'services'),
		/**
		 * Directory for generated schemas
		 */
		schemas: path.join(process.cwd(), 'src', 'schemas'),
		/**
		 * Directory for generated routes
		 */
		routes: path.join(process.cwd(), 'src', 'routes')
	};

	/**
	 * Converts a model name to its camelCase representation
	 * @param name - The model name to format
	 * @returns The formatted name in camelCase
	 */
	private formatName (name: string): string {
		return name.charAt(0).toLowerCase() + name.slice(1);
	}

	/**
	 * Main generation method that orchestrates the creation of all components
	 * @param modelName - Optional specific model to generate components for
	 * @throws {Error} If no models are found or specified model doesn't exist
	 */
	async generate (modelName?: string): Promise<void> {
		await this.ensureDirectories();
		await this.parsePrismaSchema();

		const modelsToGenerate = modelName
			? this.models.filter(m => m.name.toLowerCase() === this.formatName(modelName))
			: this.models;

		if (modelsToGenerate.length === 0) {
			throw new Error(`No models found${modelName ? ` matching '${modelName}'` : ''}`);
		}

		for (const model of modelsToGenerate) {
			await this.generateController(model);
			await this.generateService(model);
			await this.generateSchema(model);
			await this.generateRouteFile(model);

			await this.updateControllerIndex(model.name);
			await this.updateServiceIndex(model.name);
			await this.updateSchemaIndex(model.name);
		}

		await this.updateRoutesIndex(modelName);
		console.log('Generation completed successfully!');
	}

	/**
	 * Ensures that the output directories exist
	 */
	private async ensureDirectories (): Promise<void> {
		for (const dir of Object.values(this.outputDirs)) {
			await fs.mkdir(dir, { recursive: true });
		}
	}

	/**
	 * Parses the Prisma schema and populates the models array
	 */
	private async parsePrismaSchema (): Promise<void> {
		const dmmf = Prisma.dmmf;

		if (!dmmf) {
			throw new Error('Prisma DMMF not found. Make sure @prisma/client is installed.');
		}

		this.models = dmmf.datamodel.models.map(model => {
			const fields: FieldInfo[] = model.fields.map(field => {
				const relationName = field.relationName;
				const relationTo = relationName ? field.type : undefined;

				return {
					name: field.name,
					type: field.type,
					isOptional: !field.isRequired,
					isId: field.isId || false,
					isRelation: !!relationName,
					relationName,
					relationTo,
					isList: field.isList || false
				};
			});

			const relations = model.fields
				.filter(f => f.relationName)
				.map(f => ({
					name: f.name,
					type: f.type,
					isList: f.isList || false,
					relationFromFields: f.relationFromFields,
					relationToFields: f.relationToFields
				}));

			return {
				name: model.name,
				fields,
				relations
			};
		});
	}

	/**
	 * Generates a controller for the given model
	 * @param model - The model to generate a controller for
	 */
	private async generateController (model: ModelInfo): Promise<void> {
		const controllerPath = path.join(this.outputDirs.controllers, `${this.formatName(model.name)}.ts`);
		const className = model.name;
		const varName = this.formatName(model.name);

		const content = `import { ${className} as Build } from "@prisma/client";
import { ControllerFactory } from "../helpers";
class Controller extends ControllerFactory<Build> { }
export default new Controller('${varName}');
`;

		await fs.writeFile(controllerPath, content, 'utf-8');
		console.log(`Generated controller: ${controllerPath}`);
	}

	/**
	 * Generates a service for the given model
	 * @param model - The model to generate a service for
	 */
	private async generateService (model: ModelInfo): Promise<void> {
		const servicePath = path.join(this.outputDirs.services, `${this.formatName(model.name)}.ts`);
		const className = model.name;

		const content = `import { ${className} as Build } from "@prisma/client";
import { ${className} as Controller } from "../controllers";
import { ServiceFactory } from "../helpers";
class Service extends ServiceFactory<Build> { }
export default new Service(Controller);
`;

		await fs.writeFile(servicePath, content, 'utf-8');
		console.log(`Generated service: ${servicePath}`);
	}

	/**
	 * Generates a schema for the given model
	 * @param model - The model to generate a schema for
	 */
	private async generateSchema (model: ModelInfo): Promise<void> {
		const schemaPath = path.join(this.outputDirs.schemas, `${this.formatName(model.name)}.ts`);
		const requiredFields = model.fields
			.filter(
				f =>
					!f.isOptional &&
					!f.isId &&
					!f.name.startsWith('createdAt') &&
					!f.name.startsWith('updatedAt') &&
					!f.isRelation
			)
			.map(f => `'${f.name}'`)
			.join(', ');

		const baseProperties = model.fields
			.filter(f => !f.isId && !f.name.startsWith('createdAt') && !f.name.startsWith('updatedAt') && !f.isRelation)
			.reduce((acc, field) => {
				const prop: Record<string, any> = {
					type: this.mapPrismaTypeToSchemaType(field.type)
				};

				if (field.type === 'DateTime') {
					prop.format = 'date-time';
				}

				return {
					...acc,
					[field.name]: prop
				};
			}, {});

		const searchProperties = model.fields
			.filter(f => !f.isRelation)
			.reduce((acc, field) => {
				const prop: Record<string, any> = {
					type: this.mapPrismaTypeToSchemaType(field.type)
				};

				if (field.type === 'DateTime') {
					prop.format = 'date-time';
				}

				return {
					...acc,
					[field.name]: prop
				};
			}, {});

		const content = `export const search = {
    querystring: {
        type: "object",
        properties: ${JSON.stringify(searchProperties, null, 8).replace(/"([^"]+)":/g, '$1:')},
    },
};

export const find = {
    querystring: {
        type: "object",
        properties: ${JSON.stringify(searchProperties, null, 8).replace(/"([^"]+)":/g, '$1:')},
    },
};

export const getOrDelete = {
    params: {
        type: "object",
        properties: {
            id: { type: "string" },
        },
        required: ["id"],
    },
};

export const create = {
    body: {
        type: "object",
        properties: ${JSON.stringify(baseProperties, null, 8).replace(/"([^"]+)":/g, '$1:')},
        required: [${requiredFields}],
    },
};

export const update = {
    params: {
        type: "object",
        properties: {
            id: { type: "string" },
        },
        required: ["id"],
    },
    body: {
        type: "object",
        properties: ${JSON.stringify(baseProperties, null, 8).replace(/"([^"]+)":/g, '$1:')}
    },
};
`;

		await fs.writeFile(schemaPath, content, 'utf-8');
		console.log(`Generated schema: ${schemaPath}`);
	}

	/**
	 * Updates the index file for the given directory and model
	 * @param directory - The directory to update the index file for
	 * @param modelName - The model to update the index file for
	 * @param exportName - The name of the export to add to the index file
	 */
	private async updateIndexFile (directory: string, modelName: string, exportName: string): Promise<void> {
		const indexPath = path.join(directory, 'index.ts');
		const modelLower = this.formatName(modelName);

		try {
			let content = '';
			const exists = await fs
				.access(indexPath)
				.then(() => true)
				.catch(() => false);

			if (exists) {
				content = await fs.readFile(indexPath, 'utf-8');
				const exportRegex = new RegExp(
					`export\\s*\\{\\s*${exportName}\\s*\\}\\s*from\\s*[\"']\\.\\/${modelLower}[\"']`,
					'i'
				);
				if (exportRegex.test(content)) {
					return; // Already exported
				}
			}

			const exportStatement = `export { ${exportName} } from './${modelLower}'`;
			const newContent = content.trim() + '\n' + exportStatement + '\n';

			await fs.writeFile(indexPath, newContent, 'utf-8');
			console.log(`Updated ${path.basename(directory)} index with ${exportName}`);
		} catch (error) {
			console.error(`Error updating ${path.basename(directory)} index:`, error);
		}
	}

	/**
	 * Updates the controller index file for the given model
	 * @param modelName - The model to update the controller index file for
	 */
	private async updateControllerIndex (modelName: string): Promise<void> {
		await this.updateIndexFile(this.outputDirs.controllers, modelName, 'default as ' + modelName);
	}

	/**
	 * Updates the service index file for the given model
	 * @param modelName - The model to update the service index file for
	 */
	private async updateServiceIndex (modelName: string): Promise<void> {
		await this.updateIndexFile(this.outputDirs.services, modelName, 'default as ' + modelName);
	}

	/**
	 * Updates the schema index file for the given model
	 * @param modelName - The model to update the schema index file for
	 */
	private async updateSchemaIndex (modelName: string): Promise<void> {
		const indexPath = path.join(this.outputDirs.schemas, 'index.ts');
		const modelLower = this.formatName(modelName);
		const exportName = modelName;
		const exportStatement = `export * as ${exportName} from './${modelLower}'`;

		try {
			let content = '';
			const exists = await fs
				.access(indexPath)
				.then(() => true)
				.catch(() => false);

			if (exists) {
				content = await fs.readFile(indexPath, 'utf-8');
				const exportRegex = new RegExp(
					`export\\s*\\*\\s*as\\s*${exportName}\\s*from\\s*['"]\\.\\/\\/${modelLower}['"]`,
					'i'
				);
				if (exportRegex.test(content)) {
					return; // Already exported
				}
				content = content.replace(
					new RegExp(`export\\s*\\*\\s*as\\s*${exportName}\\s*from\\s*['"]\\.\\/\\w+['"];?\\s*`, 'gi'),
					''
				);
				content = content.replace(
					new RegExp(`export\\s*\\{[^}]*\\b${exportName}\\b[^}]*\\}\\s*from\\s*['"]\\.\\/\\w+['"];?\\s*`, 'gi'),
					''
				);
			}

			const newContent = content.trim() + '\n' + exportStatement + '\n';
			await fs.writeFile(indexPath, newContent, 'utf-8');
			console.log(`Updated schemas index with ${exportName}`);
		} catch (error) {
			console.error('Error updating schemas index:', error);
		}
	}

	/**
	 * Updates the routes index file for the given model
	 * @param modelName - The model to update the routes index file for
	 */
	private async updateRoutesIndex (modelName?: string): Promise<void> {
		if (!modelName) {
			await this.regenerateRoutesIndex();
			return;
		}

		const routesIndexPath = path.join(this.outputDirs.routes, 'index.ts');

		let content = '';
		try {
			content = await fs.readFile(routesIndexPath, 'utf-8');
		} catch (error) {
			return this.regenerateRoutesIndex(modelName);
		}

		const importRegex = new RegExp(`import\\s+${modelName}\\s+from\\s+["']\\.\\/${modelName}["']`, 'i');
		const registerRegex = new RegExp(
			`server\\s*\\.register\\s*\\(\\s*${modelName}\\s*,\\s*\\{\\s*prefix\\s*:\\s*["']\\/${modelName}s["']\\s*\\}`,
			'i'
		);

		if (importRegex.test(content) && registerRegex.test(content)) {
			console.log(`Route for ${modelName} already exists in routes/index.ts`);
			return;
		}

		if (!importRegex.test(content)) {
			const lastImportMatch = content.match(/^import .*$/gm)?.pop();
			if (lastImportMatch) {
				content = content.replace(lastImportMatch, `${lastImportMatch}\nimport ${modelName} from \"./${modelName}\"`);
			}
		}

		if (!registerRegex.test(content)) {
			content = content.replace(
				/export default function \(server: FastifyInstance\) \{/,
				`export default function (server: FastifyInstance) {\n    server.register(${modelName}, { prefix: \"/${modelName}s\" });`
			);
		}

		await fs.writeFile(routesIndexPath, content, 'utf-8');
		console.log(`Updated routes index with new route: ${modelName}`);
	}

	/**
	 * Regenerates the routes index file for all models
	 * @param modelName - Optional model name to regenerate the routes index file for
	 */
	private async regenerateRoutesIndex (modelName?: string): Promise<void> {
		const routesIndexPath = path.join(this.outputDirs.routes, 'index.ts');
		const modelNames = modelName
			? this.models.filter(m => this.formatName(m.name) === this.formatName(modelName))
			: this.models.map(m => this.formatName(m.name));

		let content = 'import { FastifyInstance } from "fastify";\n';

		for (const model of modelNames) {
			console.log(model);
			content += `import ${model} from \"./${model}\";\n`;
		}

		content += '\nexport default function (server: FastifyInstance) {\n';
		for (const model of modelNames) {
			content += `    server.register(${model}, { prefix: \"/${model}s\" });\n`;
		}
		content += '}\n';

		await fs.writeFile(routesIndexPath, content, 'utf-8');
		console.log(`Regenerated routes index: ${routesIndexPath}`);
	}

	/**
	 * Generates a route file for the given model
	 * @param model - The model to generate a route file for
	 */
	private async generateRouteFile (model: ModelInfo): Promise<void> {
		const routesDir = this.outputDirs.routes;
		const routePath = path.join(routesDir, `${this.formatName(model.name)}.ts`);
		const className = model.name;
		const varName = this.formatName(model.name);

		try {
			await fs.access(routePath);
			console.log(`Route file ${routePath} already exists, skipping...`);
			await this.updateRoutesIndex(varName);
			return;
		} catch (error) {
			// File doesn't exist, proceed with generation
		}

		const content = `import { FastifyPluginCallback, FastifyRequest, FastifyReply } from "fastify";
import { ${className} as Build } from "@prisma/client";
import { ${className} as Service } from "../services";
import { ${className} as Schema } from "../schemas";
import { auth } from "../utils";

const routes: FastifyPluginCallback = (server) => {
    server.route({
        method: "POST",
        url: "/",
        schema: Schema.create,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Body: Build }>, reply: FastifyReply) => {
            const result = await Service.create(request.body);
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/",
        schema: Schema.search,
        preHandler: auth,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = await Service.getAll();
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/export/:format",
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { format: string; }; Querystring: { [key in keyof Build]?: Build[key] }; }>, reply: FastifyReply) => {
            await Service.export(request.params.format, reply, request.query);
        }
    });

    server.route({
        method: "GET",
        url: "/search",
        schema: Schema.search,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Querystring: { [key in keyof Build]?: Build[key] }; }>, reply: FastifyReply) => {
            const result = await Service.search(request.query, { include: { ExampleAttach: true } });
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/find",
        schema: Schema.find,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Querystring: { [key in keyof Build]?: Build[key] }; }>, reply: FastifyReply) => {
            const result = await Service.find(request.query);
            reply.send({ data: result });
        }
    });

    server.route({
        method: "GET",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const result = await Service.getById(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: '${className} not found' });
            }
            reply.send({ data: result });
        }
    });

    server.route({
        method: "PUT",
        url: "/:id",
        schema: Schema.update,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string }, Body: Partial<Build> }>, reply: FastifyReply) => {
            const result = await Service.update(request.params.id, request.body);
            if (!result) {
                return reply.status(404).send({ error: '${className} not found' });
            }
            reply.send({ data: result });
        }
    });

    server.route({
        method: "DELETE",
        url: "/:id",
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const result = await Service.delete(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: '${className} not found' });
            }
            reply.send({ data: { message: '${className} deleted successfully' } });
        }
    });
};

export default routes;
`;

		await fs.writeFile(routePath, content, 'utf-8');
		console.log(`Generated route: ${routePath}`);

		await this.updateRoutesIndex(varName);
	}

	/**
	 * Maps a Prisma type to a schema type
	 * @param prismaType - The Prisma type to map
	 * @returns The corresponding schema type
	 */
	private mapPrismaTypeToSchemaType (prismaType: string): string {
		const typeMap: Record<string, string> = {
			String: 'string',
			Int: 'number',
			Float: 'number',
			Boolean: 'boolean',
			DateTime: 'string',
			Json: 'object',
			BigInt: 'number',
			Decimal: 'number',
			Bytes: 'string'
		};

		return typeMap[prismaType] || 'string';
	}
}

/**
 * CLI entry point for the generator
 * @param modelName - Optional model name to generate components for
 */
function generate (modelName?: string): void {
	const generator = new PrismaGenerator();
	generator.generate(modelName).catch(console.error);
}

// Run generator if this file is executed directly
if (require.main === module) {
	generate(process.argv[2]);
}
