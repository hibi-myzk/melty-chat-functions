const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

exports.meltMessages = functions.firestore
  .document('topics/{topicsID}').onUpdate((change, context) => {
    console.log('topic `' + change.before.data().name + '` updated');

//    var now = change.after.data().updated_at;
//    var end = new admin.firestore.Timestamp(now.seconds, now.nanoseconds);

    var now = new Date();
    var sec = Math.floor(now.getTime() / 1000) - (24 * 60 * 60);
    var end = new admin.firestore.Timestamp(sec, 0);

    db.collection("topics/" + change.before.id + "/messages").where("created_at", "<", end)
      .get()
      .then(function(querySnapshot) {
        var batch = db.batch();

        querySnapshot.forEach(function(doc) {
//          console.log(doc.data());
          batch.delete(doc.ref);
        });

        return batch.commit();
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });

    db.collection("topics").where("updated_at", "<", end)
      .get()
      .then(function(querySnapshot) {
        var batch = db.batch();

        querySnapshot.forEach(function(doc) {
//          console.log(doc.data());
          batch.delete(doc.ref);
        });

        return batch.commit();
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });

    return 0;
  });
