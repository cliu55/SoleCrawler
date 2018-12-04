import {Image, Carousel} from 'actions-on-google';
import {manufactuers} from "./manufacturers";

export let buildShoesCarousel = (data, page = 1) => {
    let start = (page-1)*10;
    let end = page*10 > data.length ? start+data.length%10 : page*10;
    let list = {};
    for(var i = start; i < end; i++){
        list[data[i].id] = {
            title: data[i].title, 
            image: new Image({url: data[i].title_image_url, alt: data[i].title}),
            description: data[i].release_date
        };
    }
    // TODO: Replace with Browse Carousel in the future
    return new Carousel({items: list});
}

export let buildBrandsCarousel = () => {
    let list = {};
    for(let maker in manufactuers){
        list[maker] = {
            title: maker, 
            image: new Image({url: manufactuers[maker].logo_url, alt: maker}),
            description:  ""
        };
    };
    // TODO: Replace with Browse Carousel in the future
    return new Carousel({items: list});
}