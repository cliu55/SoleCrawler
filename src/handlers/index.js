import { welcome, welcomeList } from "./welcome";
import { allReleases, releasesByBrand, chooseBrand, productDetails } from "./releases";
import { fallback } from "./fallback";

export const registerHandlers = assistant => {
    assistant.intent('welcome', welcome);
    assistant.intent('welcome.list', welcomeList);
    assistant.intent('releases.all', allReleases);
    assistant.intent('releases.brand', releasesByBrand);
    assistant.intent('releases.brand.list', chooseBrand);
    assistant.intent('releases.detail', productDetails);
    assistant.intent('fallback', fallback);
}