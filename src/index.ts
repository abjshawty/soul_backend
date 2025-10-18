import { server } from './helpers';
import { Server as messages } from './messages';
import { init } from './utils';
const main = () =>
	init()
		.then(() => server.start())
		.catch(error => messages.error(error));
main();
