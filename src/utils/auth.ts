import { FastifyReply, FastifyRequest } from 'fastify';
import { authEnabled } from '../helpers/env';
import { Auth } from '../messages';
import '@fastify/jwt';
export default async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		if (!authEnabled) return;
		await request.jwtVerify();
	} catch {
		reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: Auth.fail() });
	}
};
