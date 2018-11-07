import express from 'express';
import bodyParser from 'body-parser';
import {dialogflow} from 'actions-on-google';

const server = express();
const assistant = dialogflow()

server.set('port', process.env.PORT || 80);
server.use(bodyParser.json());
// server.use(bodyParser.urlencoded({ extended: true }));

assistant.intent('Default Welcome Intent', conv => {
	conv.ask('Welcome to my agent!');
});

assistant.intent('Default Fallback Intent', conv => {
	conv.ask(`I'm sorry, can you try again?`);
});

server.post('/webhook', assistant);
server.listen(server.get('port'), () => {
  console.log(`Server listening on port ${server.get('port')}`);
});