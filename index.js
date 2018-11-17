import express from 'express';
import bodyParser from 'body-parser';
import {dialogflow, Image, Carousel, Table, Button, List} from 'actions-on-google';
import rp from 'request-promise';
import moment from 'moment';

const server = express();
const assistant = dialogflow()

server.set('port', process.env.PORT || 80);
server.use(bodyParser.json());
// server.use(bodyParser.urlencoded({ extended: true }));

let welcome = conv => {
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

let welcomeList = async (conv, params, option) => {
	switch (option) {
		case 'releases':
			await allReleases(conv);
			break;
		case 'brands':
			releasesByBrand(conv);
			break;
		default:
			fallback(conv);
	}
}

let allReleases = async (conv) => {
	console.log('here');
	const hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
	
	let result = await rp(`http://www.solelinks.com/api/releases-by-month/?month=${moment().format('M')}&year=${moment().format('YYYY')}&page=1`);
	result = JSON.parse(result);
	let { data } = result.data;

	if(hasScreen){
		let list = {};
		for(var i = 0; i < 10; i++){
			list[data[i].id] = {
				title: data[i].title, 
				image: new Image({url: data[i].title_image_url, alt: data[i].title}),
				description: data[i].release_date
			};
		}
		// TODO: Replace with Browse Carousel in the future
		let carousel = new Carousel({items: list});
		conv.ask('Here are some recent releases');
		conv.ask(carousel);
	}
};

let releasesByBrand = conv => {
	conv.ask('Here are some recent releases from Adidas');
}

let productDetails = async (conv, params, option) => {
	let result = await rp(`http://www.solelinks.com/api/releases/${option}`);
	result = JSON.parse(result);
	let { data } = result;
	let table = new Table({
		title: data.title,
		image: new Image({url: data.title_image_url, alt: data.title}),
		columns: [{},{}],
		rows: [
			['Price', data.price],
			['Release Date', data.release_date],
			['Color', data.color],
		],
		buttons: [new Button({
			title: 'More Details...',
			url: `http://www.solelinks.com/releases/${option}`
		})]
	})

	conv.ask(`Here is the ${data.title}. Click the title for more details`);
	conv.ask(table);
}

let fallback = conv => {
	conv.ask(`I'm sorry, can you try again?`);
};

assistant.intent('Default Welcome Intent', welcome);
assistant.intent('Welcome List', welcomeList);
assistant.intent('All Releases', allReleases);
assistant.intent('Releases By Brand', releasesByBrand);
assistant.intent('Product Details', productDetails);
assistant.intent('Default Fallback Intent', fallback);

server.post('/webhook', assistant);
server.listen(server.get('port'), () => {
  console.log(`Server listening on port ${server.get('port')}`);
});