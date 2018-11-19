import express from 'express';
import bodyParser from 'body-parser';
import { dialogflow } from 'actions-on-google';
import { registerHandlers } from "./handlers";

const server = express();
const assistant = dialogflow();

server.set('port', process.env.PORT || 80);
server.use(bodyParser.json());
// server.use(bodyParser.urlencoded({ extended: true }));

registerHandlers(assistant);

server.post('/webhook', assistant);
server.listen(server.get('port'), () => {
  console.log(`Server listening on port ${server.get('port')}`);
});