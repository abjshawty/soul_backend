import { language } from '../helpers/env';
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
	fail: () => `${lang.Auth.fail}`
};
