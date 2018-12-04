import rp from 'request-promise';
import moment from 'moment';
import { Table, Image, Button, LinkOutSuggestion, Suggestions } from "actions-on-google";
import { buildShoesCarousel, buildBrandsCarousel } from "../utilities/carousel";
import { manufactuers } from "../utilities/manufacturers";
import { createCalendarLink } from "../utilities/calendar";

export const allReleases = async conv => {
	const hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

	let page = conv.contexts.get('releasesall-followup') ? conv.contexts.get('releasesall-followup').parameters.page : 1;
	if(conv.intent === 'releases.all.next') {
		page++;
	} else if (conv.intent === 'releases.all.previous' && page-1 !== 0) {
		page--;
	}
	let result = await rp(`http://www.solelinks.com/api/releases-by-month/?month=${moment().format('M')}&year=${moment().format('YYYY')}&page=1`);
	result = JSON.parse(result);
	let { data } = result.data;

	if(hasScreen){
		const start = (page-1)*10;
		if(data.length-start === 1){
			await productDetails(conv, {}, data[data.length-1].id);
			return;
		} 
		if(page>1){
			conv.add(new Suggestions('Previous'));
		}
		if(start+data.length%10 < data.length){
			conv.add(new Suggestions('Next'));
		} else {
			conv.ask('There are no more releases');
			return;
		}
		let carousel = buildShoesCarousel(data, page);
		conv.contexts.set('product_details', 3);
		conv.contexts.set('releasesall-followup', 3, { page : page });
		conv.add('Here are some recent releases');
		conv.add(carousel);
	}
};

export const releasesByBrand = async (conv, params = {}, option) => {
	const hasScreen = conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT');

	let page = conv.contexts.get('releasesbrand-followup').parameters ? conv.contexts.get('releasesbrand-followup').parameters.page : 1;
	option = conv.contexts.get('releasesbrand-followup').parameters ? conv.contexts.get('releasesbrand-followup').parameters.option : option;
	if(conv.intent === 'releases.brand.next') {
		page++;
	} else if (conv.intent === 'releases.brand.previous' && page-1 !== 0) {
		page--;
	}
	let result = await rp(`http://www.solelinks.com/api/releases-by-month/?month=${moment().format('M')}&year=${moment().format('YYYY')}&page=1&manufacturer=${manufactuers[option].id}`);
	result = JSON.parse(result);
	let { data } = result.data;
	
	if(!data.length){
		conv.ask(`I am sorry, there are no recent releases from ${option}`)
		return;
	}

	if(hasScreen){
		const start = (page-1)*10;
		if(data.length-start === 1){
			await productDetails(conv, {}, data[data.length-1].id);
			return;
		} 
		if(page>1){
			conv.add(new Suggestions('Previous'));
		}
		if(start+data.length%10 < page*10){
			conv.add(new Suggestions('Next'));
		} else {
			conv.ask(`There are no more releases from ${option}.`);
			return;
		}
		let carousel = buildShoesCarousel(data, page);
		conv.contexts.set('product_details', 3);
		conv.contexts.set('brand_releases', 3);
		conv.contexts.set('releasesbrand-followup', 3, { page : page, option : option});
		conv.add(`Here are some recent releases from ${option}`);
		conv.ask(carousel);
	}
};

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