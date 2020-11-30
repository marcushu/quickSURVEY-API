const mongoose = require('mongoose');

const mongodbUrl = process.env.MONGODB_URL;
//const mongodbUrl = "mongodb://172.17.0.2/surveys";  //TODO: local dev db

// Export this to open a connection before listening.
const mongoConnection = () => {
  return mongoose.connect(mongodbUrl,
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