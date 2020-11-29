const mongoose = require('mongoose');
//const dburl = require('./dburl.js');

const db = process.env.MONGODB_URL;
// Export this to open a connection before listening.
const mongoConnection = () => {
  return mongoose.connect(db,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

////////////
// Survey //
////////////

const surveySchema = new mongoose.Schema({
  owner: { type: String, default: "" },
  questionaireTypeName: String,
  questions: {
    type: [
      {
        negativeIdentity: { type: String, default: "" },
        positiveIdentity: { type: String, default: "" },
        question: String,
        result: { type: String, default: "" },
        questionType: String,
        choices: { type: [String], default: [] }
      }
    ], default: []
  }
});

const Survey = mongoose.model('Survey', surveySchema);

//////////////////
// participants //
//////////////////

const participantsSchema = new mongoose.Schema({
  participant: String,
  surveyName: String
});

participantsSchema.methods.equalsTo = function (other) {
  return (this.participant === other.participant && this.surveyName === other.surveyName);
}

const Participant = mongoose.model('Participant', participantsSchema);

//

exports.db = db;
exports.Survey = Survey;
exports.Participant = Participant;
exports.mongoConnection = mongoConnection;