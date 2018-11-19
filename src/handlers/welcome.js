import { List } from "actions-on-google";
import { allReleases, chooseBrand } from "./releases";
import { fallback } from "./fallback";

export const welcome = conv => {
	let list = new List({
		title: 'What can you do?',
		items: {
			'releases': {
				title: 'All Releases',
				description: 'See the newest releases'
			},
			'brands': {
				title: 'Releases By Brand',
				description: 'See the newest releases by brand'
			}
		},
		
	});
	conv.ask('Welcome to Sole Crawler! Try saying release calendar to see the upcoming drops.');
	conv.ask(list);
};

export const welcomeList = async (conv, params, option) => {
	switch (option) {
		case 'releases':
			await allReleases(conv);
			break;
		case 'brands':
			chooseBrand(conv);
			break;
		default:
			fallback(conv);
	}
}