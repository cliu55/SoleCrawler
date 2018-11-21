import moment from 'moment';
// import AWS from "aws-sdk";
// import ical from "ical-generator";

// AWS.config.loadFromPath('./AwsConfig.json');
// const s3 = new AWS.S3();
// const cal = ical({domain: 'localhost'});

let BASE_URL = 'http://www.google.com/calendar/event?action=TEMPLATE',
MAX_LENGTH = 512;

const toMoment = function(options) {
    return moment(moment(options.date, 'YYYY/MM/DD'));
};

const toAllDay = function(options) {
    if (!options.date) return '';

    var moment = toMoment(options);

    return moment.isValid() ? '&dates=' + moment.format('YYYYMMDD') + '/' + moment.add(1, 'd').format('YYYYMMDD') : '';
};

const toIsoHour = function(date) {
    return moment(date).utc().format('YYYYMMDDTHHmmss') + 'Z';
};

const toHour = function(options) {
    if (!(options.start instanceof Date) || !(options.end instanceof Date)) return '';

    return '&dates=' + toIsoHour(options.start) + '/' + toIsoHour(options.end);
};

const toDatesParameter = function(options) {
    return options.start && options.end ? toHour(options) : options.date ? toAllDay(options) : '';
};

const toStringParameter = function(options, propertyName, alternativeName) {
    if (!options[propertyName]) return '';

    return '&' + (alternativeName || propertyName) + '=' + encodeURIComponent(options[propertyName].substr(0, MAX_LENGTH - 1));
};

export const createCalendarLink = function(options) {
    options = options || {};

    return BASE_URL +
    toStringParameter(options, 'title', 'text') +
    toStringParameter(options, 'location') +
    toStringParameter(options, 'details') +
    toDatesParameter(options);
};

// // Method for users to add release day to calendar if they dont have Google Calendar
// // TODO: Complete method
// export const createCalendarFile = async () => {
//     cal.domain('example.com');
//     cal.createEvent({
//         start: moment().add(1, 'hour'),
//         end: moment().add(2, 'hours'),
//         summary: 'Example Event',
//         description: 'It works ;)',
//         organizer: 'Organizer\'s Name <organizer@example.com>',
//         url: 'https://example.com'
//     });

//     let string = cal.toString();
//     await s3.putObject({
//         Bucket: 'solecrawler1',
//         Key: 'calendar.ics',
//         Body: string
//     }, (err, data) => {
//         console.log(data);
//         console.log(err);
//     });
// }
