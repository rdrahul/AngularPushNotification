const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');

const PUBLIC_VAPID = 'BEgFkR4Fqp3wUzG3kM-oEaROGV22s00RTBDW3UZTgycdV0PLh0-N71WNIKjdFxd3m_NL-15BY_OCQASFpXrZPOs';
const PRIVATE_VAPID = 'EAqcssX0h01XVjpqNURQpDpjSvJlz_tjimm0qwfqpJc';

const fakeDatabase = [];

const app = express();

app.use(cors());
app.use(bodyParser.json());

webpush.setVapidDetails('mailto:rahulrd005@gmail.com', PUBLIC_VAPID, PRIVATE_VAPID);

app.post('/subscription', (req, res) => {
  
  const subscription = req.body;
  fakeDatabase.push(subscription);
  return  res.sendStatus(200);
});

app.post('/sendNotification', (req, res) => {
  
  const notificationPayload = {
    notification: {
      title: 'New Notification',
      body: 'This is the body of the notification',
      icon: 'assets/icons/icon-512x512.png'
    }
  };

  const promises = [];
  fakeDatabase.forEach(subscription => {
    promises.push(webpush.sendNotification(subscription, JSON.stringify(notificationPayload)));
  });
  Promise.all(promises).then(() => res.sendStatus(200));
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});