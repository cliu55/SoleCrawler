import rp from 'request-promise';
import moment from 'moment';
import { Table, Image, Button, LinkOutSuggestion } from "actions-on-google";
import { buildShoesCarousel, buildBrandsCarousel } from "../utilities/carousel";
import { manufactuers } from "../utilities/manufacturers";
import { createCalendarLink } from "../utilities/calendar";

export const allReleases = async (conv) => {
	const hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
	
	let result = await rp(`http://www.solelinks.com/api/releases-by-month/?month=${moment().format('M')}&year=${moment().format('YYYY')}&page=1`);
	result = JSON.parse(result);
	let { data } = result.data;

	if(hasScreen){
		if(data.length === 1){
			await productDetails(conv, {}, data[0].id);
		} else {
			let carousel = buildShoesCarousel(data);
			conv.contexts.set('product_details', 3);
			conv.ask('Here are some recent releases');
			conv.ask(carousel);
		}
	}
};

export const releasesByBrand = async (conv, params, option) => {
	const hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');
	let result = await rp(`http://www.solelinks.com/api/releases-by-month/?month=${moment().format('M')}&year=${moment().format('YYYY')}&page=1&manufacturer=${manufactuers[option].id}`);
	result = JSON.parse(result);
	let { data } = result.data;

	if(!data.length){
		conv.ask(`I am sorry, there are no recent releases from ${option}`)
		return;
	}

	if(hasScreen){
		if(data.length === 1){
			await productDetails(conv, {}, data[0].id);
		} else {
			let carousel = buildShoesCarousel(data);
			conv.ask(`Here are some recent releases from ${option}`);
			conv.ask(carousel);
		}
	}
}

export const chooseBrand = conv => {
	const hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

	if(hasScreen){
		let carousel = buildBrandsCarousel();
		conv.contexts.set('brand_releases', 3)
		conv.ask('Please choose one of the following brands');
		conv.ask(carousel);
	}
}

export const productDetails = async (conv, params = {}, option) => {
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
	let releaseDayArr  = data.release_date.split("/"),
		releaseDay = moment(releaseDayArr[2]+releaseDayArr[0]+releaseDayArr[1]),
		now = moment();

	let response = `Here is the ${data.title}. Click the title for more details`;
	if(now <= releaseDay) {
		response += ', or save the release date onto your calendar using the suggestion chip';
		conv.add(new LinkOutSuggestion({
			name: 'Add to Calendar',
			url: createCalendarLink({
				date: new Date(releaseDayArr[2], releaseDayArr[0]-1, releaseDayArr[1]),
				title: `${data.title} Release Day`,
				details: `http://www.solelinks.com/releases/${option}`
			})
		}));
	}
	conv.add(response);
	conv.ask(table);
}