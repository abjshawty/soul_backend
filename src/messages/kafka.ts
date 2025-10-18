import { log } from 'console';
import { language } from '../helpers/env';
import * as locales from '../locales';
let lang: {
	Auth?: any;
	Database?: any;
	Kafka: any;
	Server?: any;
};
if (language == 'en-US') {
	lang = locales.en;
} else {
	lang = locales.fr;
}
export default {
	start: () => log(`${lang.Kafka.start}`),
	error: (error: Error, message?: string) => log(`${lang.Kafka.error}, ${message}:\n${error.message}`),
	close: () => log(`${lang.Kafka.close}`)
};
