import Fastify, { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Server as messages } from '../messages';
import { die as killDatabase } from '../db';
import multipart from '@fastify/multipart';
import swagger_ui from '@fastify/swagger-ui';
import swagger from '@fastify/swagger';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import routes from '../routes';
import death from 'death';
import path from 'path';
import { env, kafka } from '.';

class Server {
	private kafka: typeof kafka;
	private host: string;
	private role: env.role;
	private port: number;
	private server: FastifyInstance;
	constructor () {
		this.server = Fastify({
			logger: {
				transport: {
					targets: [
						// Error Console
						{
							target: 'pino-pretty',
							level: 'error',
							options: {
								colorize: true,
								translateTime: true
							}
						},
						// Error File
						{
							target: 'pino-pretty',
							level: 'error',
							options: {
								destination: path.join(__dirname, '../logs/error.log'),
								colorize: true,
								translateTime: true
							}
						},
						// Info Console
						{
							target: 'pino-pretty',
							level: 'info',
							options: {
								colorize: true,
								translateTime: true
							}
						},
						// Info File
						{
							target: 'pino-pretty',
							level: 'info',
							options: {
								destination: path.join(__dirname, '../logs/server.log'),
								colorize: true,
								translateTime: true
							}
						},
						// Warning Console
						{
							target: 'pino-pretty',
							level: 'warn',
							options: {
								colorize: true,
								translateTime: true
							}
						},
						// Warning File
						{
							target: 'pino-pretty',
							level: 'warn',
							options: {
								destination: path.join(__dirname, '../logs/warnings.log'),
								colorize: true,
								translateTime: true
							}
						}
					]
				}
			}
		});
		this.port = env.port;
		this.host = env.host;
		this.config();
		this.docs();
		this.routes();
		this.errorHandler();
		this.kafka = kafka;
		this.role = env.role;
		if (this.role === 'producer' || this.role === 'both') this.kafka.produce();
		if (this.role === 'consumer' || this.role === 'both') this.kafka.consume();
	}
	private async bye (): Promise<void> {
		killDatabase();
		if (this.kafka) this.kafka.close();
		this.server
			.close()
			.then(() => {
				messages.close();
			})
			.catch(error => {
				messages.error(error);
			})
			.finally(() => {
				env.murder();
			});
	}
	private config (): void {
		if (env.jwtSecret === undefined) throw new Error('JWT secret not set');
		this.server.register(jwt, { secret: env.jwtSecret });
		this.server.register(multipart);
		this.helmet();
		this.hooks();
		this.cors();
		this.die();
	}
	private cors (): void {
		this.server.register(cors, {
			origin: env.corsOrigin,
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			exposedHeaders: ['Content-Range', 'X-Content-Range'],
			credentials: true
		});
	}
	private die (): void {
		death(() => this.bye());
	}
	private docs (): void {
		this.server.register(swagger, {
			openapi: {
				info: {
					title: `${env.apiName} API`,
					version: env.apiVersion,
					description: `${env.apiName} API`
				},
				servers: [
					{
						url: `http://${env.host}:${env.port}`,
						description: `${env.apiName} API for local development`
					}
				]
			}
		});
		this.server.register(swagger_ui, {
			routePrefix: '/docs'
		});
	}
	private errorHandler (): void {
		this.server.setErrorHandler((error: FastifyError, request: FastifyRequest, response: FastifyReply) => {
			this.server.log.error(error);
			response.status(error.statusCode ? error.statusCode : 500).send(error);
		});
	}
	private helmet (): void {
		this.server.register(helmet);
	}
	private hooks (): void {
		this.server.addHook('onRequest', (request, reply, done) => {
			this.server.log.info(`Request URL: ${request.url}`);
			done();
		});
	}
	private routes () {
		const options = {
			schema: {
				response: {
					200: {
						type: 'object',
						properties: {
							info: { type: 'string' }
						}
					}
				}
			}
		};
		this.server.get('/', options, (request, response) => {
			response.status(200).send({ info: `${env.apiName} server is up and running. Find docs at /docs.` });
		});
		this.server.get(`/${env.apiVersion}/close`, options, (request, response) => {
			response.status(200).send({ info: `${env.apiName} server closing gracefully.` });
			this.bye();
		});
		this.server.register(routes, { prefix: `/${env.apiVersion}` });
	}
	public async start (): Promise<void> {
		this.server
			.listen({ port: this.port, host: this.host })
			.then(() => {
				messages.start();
			})
			.catch(error => {
				this.server.log.error(error);
				env.murder();
			});
	}
}
export default new Server();
