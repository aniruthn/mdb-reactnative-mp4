// const User = require('../models/User');
// import { Expo } from 'expo-server-sdk';
// import firebase from "firebase";
const expoServer = require("expo-server-sdk");
const Expo = expoServer.Expo;
const firebase = require("firebase");

const geofirestore = require("geofirestore");

const firebaseConfig = require("../keys.json");

// const firebaseConfig = {
//   "apiKey": "AIzaSyC5fKJ7KWtwMNyPbNPs7mzqFGfYhnYj3zk",
//   "authDomain": "pear-l.firebaseapp.com",
//   "projectId": "pear-l",
//   "storageBucket": "pear-l.appspot.com",
//   "messagingSenderId": "683106748596",
//   "appId": "1:683106748596:web:1d9a0879611e62814cefe1",
//   "measurementId": "G-8BQHXJLMMX"
// };

console.log(firebaseConfig);

if (firebase.apps.length == 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const GeoFirestore = geofirestore.initializeApp(db);
// const geocollection = GeoFirestore.collection("locations");
const GeoCollectionStartLocations = GeoFirestore.collection("startLocations");
const GeoCollectionTargetLocations = GeoFirestore.collection("targetLocations");

// geocollection.add({
//   name: 'Geofirestore',
//   score: 100,
//   // The coordinates field must be a GeoPoint!
//   coordinates: new firebase.firestore.GeoPoint(40.7589, -73.9851)
// })

// Create a new Expo SDK client
const expo = new Expo();
console.log("made it");

/**
 * POST /user
 * Store a user's details
 */
// exports.postUser = (req, res) => {
//   const response = {
//     status: 'failure',
//     message: 'you didn\'t pass valid parameters'
//   };

//   const { email, name, token } = req.body;
//   if (!email || !name || !token) {
//     return res.json(response);
//   }

//   const user = new User({ email, name, token });

//   user.save((err) => {
//     if (err) {
//       response.message = 'couldn\'t save user, duplicate entry?';
//       return res.json(response);
//     }

//     response.status = 'success';
//     response.message = 'user successfully saved';

//     res.json(response);
//   });
// };

/**
 * POST /notificaion
 * Send a push notification to a user
 */
exports.postNotification = (req, response) => {
  const {
    uid,
    startLocationLat,
    startLocationLong,
    targetLocationLat,
    targetLocationLong,
  } = req.params;

  const startLocation = new firebase.firestore.GeoPoint(
    Number(startLocationLat),
    Number(startLocationLong)
  );
  const targetLocation = new firebase.firestore.GeoPoint(
    Number(targetLocationLat),
    Number(targetLocationLong)
  );

  db.collection("users")
    .doc(uid)
    .get()
    .then((currentUserInfo) => {
      const startQuery = GeoCollectionStartLocations.near({
        center: startLocation,
        radius: 100,
      }).where("requested", "==", true);
      const targetQuery = GeoCollectionTargetLocations.near({
        center: targetLocation,
        radius: 100,
      }).where("requested", "==", true);
      //query will always be defined since it'll query the own user too

      // Get query (as Promise)
      startQuery
        .get()
        .then((startValue) => {
          // All GeoDocument returned by GeoQuery, like the GeoDocument added above
          targetQuery.get().then((targetValue) => {
            //make sure the other user is not the same user and is arbitrarily close with a close enough
            //target location

            const startUIDs = startValue.docs;
            let targetUIDs = [];
            targetValue.docs.forEach((val) => {
              targetUIDs.push(val.id);
            });
            const findOtherUID = () => {
              for (let i = 0; i < startUIDs.length; i++) {
                if (
                  uid != startUIDs[i].id &&
                  startUIDs &&
                  targetUIDs.includes(startUIDs[i].id)
                ) {
                  return startUIDs[i];
                }
              }
              return undefined;
            };

            const ref = findOtherUID();

            if (ref == undefined) {
              //don't send notifications, there isn't another user on the same path unfortunately
              console.log("No other user wants that route.");
              response.send({ msg: "No other user wants that route." });
              return;
            }

            db.collection("users")
              .doc(ref.id)
              .get()
              .then((doc) => {
                //grabs tokens and names
                const otherToken = doc.data().notificationToken;
                const otherName = doc.data().name;
                const currentToken = currentUserInfo.data().notificationToken;
                const currentName = currentUserInfo.data().name;

                let somePushTokens = [currentToken, otherToken];
                let names = [otherName, currentName];

                let messages = [];
                for (let i = 0; i < somePushTokens.length; i++) {
                  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
                  const pushToken = somePushTokens[i];
                  const name = names[i];

                  // Check that all your push tokens appear to be valid Expo push tokens
                  if (!Expo.isExpoPushToken(pushToken)) {
                    console.error(
                      `Push token ${pushToken} is not a valid Expo push token`
                    );
                    continue;
                  }

                  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
                  messages.push({
                    to: pushToken,
                    sound: "default",
                    body: `${name} is your match!`,
                    data: { withSome: "data" },
                  });
                }

                // The Expo push notification service accepts batches of notifications so
                // that you don't need to send 1000 requests to send 1000 notifications. We
                // recommend you batch your notifications to reduce the number of requests
                // and to compress them (notifications with similar content will get
                // compressed).
                let chunks = expo.chunkPushNotifications(messages);
                let tickets = [];
                (async () => {
                  // Send the chunks to the Expo push notification service. There are
                  // different strategies you could use. A simple one is to send one chunk at a
                  // time, which nicely spreads the load out over time:
                  for (let chunk of chunks) {
                    try {
                      let ticketChunk = await expo.sendPushNotificationsAsync(
                        chunk
                      );
                      console.log(ticketChunk);
                      tickets.push(...ticketChunk);
                      // NOTE: If a ticket contains an error code in ticket.details.error, you
                      // must handle it appropriately. The error codes are listed in the Expo
                      // documentation:
                      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                    } catch (error) {
                      console.error(error);
                    }
                  }
                })();
              });
            db.collection("startLocations").doc(uid).update({
              requested: false,
            });
            db.collection("targetLocations").doc(uid).update({
              requested: false,
            });
            db.collection("startLocations").doc(ref.id).update({
              requested: false,
            });
            db.collection("targetLocations").doc(ref.id).update({
              requested: false,
            });
            response.send({ msg: "Worked!", otherUID: ref.id });
          });
        })
        .catch((error) => {
          console.error(error);
          response.send({ msg: "Didn't work!" });
        });
    });
};

// exports.postNotification = (req: { params: { uid: any; location1: any; location2: any;}; body: { title: any; message: any; }; }, res: { json: (arg0: any) => void }) => {
//   const uid: string = req.params.uid;
//   const location1: string = req.params.location1;
//   const location2: string = req.params.location2;

//   var docRef = db.collection("users").doc("SIgrga1h7nffYouiKInEge98ql73");
//   docRef.get().then((doc: any) => {
//     const token = doc.data().notificationToken;
//     if (!Expo.isExpoPushToken(token)) {
//         return console.error(`Push token ${token} is not a valid Expo push token`);
//       }
//     const message = {
//         to: token,
//         sound: 'default',
//         title: req.body.title,
//         body: req.body.message,
//     };
//     if (doc.exists) {
//         const receipt = expo.sendPushNotificationsAsync(message).then(() => {
//             res.json({ message: receipt });
//         });
//     }
//   }).catch((error: any) => {
//     console.error(error);
//   });
// };

/*
// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

// Create the messages that you want to send to clients
let messages = {} as ExpoPushMessage[];
for (let pushToken of somePushTokens) {
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    continue;
  }

  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
  messages.push({
    to: pushToken,
    sound: 'default',
    body: 'This is a test notification',
    data: { withSome: 'data' },
  })
}

// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
let chunks = expo.chunkPushNotifications(messages);
let tickets = [];
(async () => {
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      console.error(error);
    }
  }
})();
*/
/*

// Later, after the Expo push notification service has delivered the
// notifications to Apple or Google (usually quickly, but allow the the service
// up to 30 minutes when under load), a "receipt" for each notification is
// created. The receipts will be available for at least a day; stale receipts
// are deleted.
//
// The ID of each receipt is sent back in the response "ticket" for each
// notification. In summary, sending a notification produces a ticket, which
// contains a receipt ID you later use to get the receipt.
//
// The receipts may contain error codes to which you must respond. In
// particular, Apple or Google may block apps that continue to send
// notifications to devices that have blocked notifications or have uninstalled
// your app. Expo does not control this policy and sends back the feedback from
// Apple and Google so you can handle it appropriately.
let receiptIds = [];
for (let ticket of tickets) {
  // NOTE: Not all tickets have IDs; for example, tickets for notifications
  // that could not be enqueued will have error information and no receipt ID.
  if (ticket.id) {
    receiptIds.push(ticket.id);
  }
}

let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
(async () => {
  // Like sending notifications, there are different strategies you could use
  // to retrieve batches of receipts from the Expo service.
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log(receipts);

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === 'ok') {
          continue;
        } else if (status === 'error') {
          console.error(
            `There was an error sending a notification: ${message}`
          );
          if (details && details.error) {
            // The error codes are listed in the Expo documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            // You must handle the errors appropriately.
            console.error(`The error code is ${details.error}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
})();

*/
