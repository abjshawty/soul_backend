import { log } from 'console';
import { language, port } from '../helpers/env';
import * as locales from '../locales';
let lang: {
	Auth?: any;
	Database?: any;
	Kafka?: any;
	Server: any;
};
if (language == 'en-US') {
	lang = locales.en;
} else {
	lang = locales.fr;
}
export default {
	start: () => log(`${lang.Server.start}${port}`),
	error: (error: Error) => log(`${lang.Server.error}: ${error.message}`),
	close: () => log(`${lang.Server.close}`)
};
