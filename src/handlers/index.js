import { welcome, welcomeList } from "./welcome";
import { allReleases, releasesByBrand, chooseBrand, productDetails } from "./releases";
import { fallback } from "./fallback";

export const registerHandlers = assistant => {
    assistant.intent('Default Welcome Intent', welcome);
    assistant.intent('Welcome List', welcomeList);
    assistant.intent('All Releases', allReleases);
    assistant.intent('Brand List', chooseBrand);
    assistant.intent('Releases By Brand', releasesByBrand);
    assistant.intent('Product Details', productDetails);
    assistant.intent('Default Fallback Intent', fallback);
}