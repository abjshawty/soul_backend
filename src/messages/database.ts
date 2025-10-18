import { log } from 'console';
import { language } from '../helpers/env';
import * as locales from '../locales';
let lang: {
	Database: any;
};
if (language == 'en-US') {
	lang = locales.en;
} else {
	lang = locales.fr;
}
export default {
	start: () => log(`${lang.Database.start}`),
	success: () => log(`${lang.Database.success}`),
	connection_error: (err: Error) => log(`${lang.Database.connection_error}${err.message}`),
	init_error: (err: Error) => log(`${lang.Database.init_error}${err.message}`),
	seed_done: () => log(`${lang.Database.seed_done}`),
	seed_error: (err: Error) => log(`${lang.Database.seed_error} ${err.message}`),
	die: () => log(`${lang.Database.die}`)
};
