import rp from 'request-promise';
import moment from 'moment';
import { Table, Image, Button } from "actions-on-google";
import { buildShoesCarousel, buildBrandsCarousel } from "../utilities/carousel";
import { manufactuers } from "../utilities/manufacturers";

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

	conv.ask(`Here is the ${data.title}. Click the title for more details`);
	conv.ask(table);
}