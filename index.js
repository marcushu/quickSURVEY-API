const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const surveyService = require('./surveydb/surveyService');
const surveyMongo = require('./surveydb/surveyMongo');

app.use(cors());

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Survey API')
})

app.get('/allSurveys', (req, res) => {
  surveyService.getAllSurveys()
    .then(result => res.send(result))
    .catch(err => console.error(err));
});

/**
 * Retrieves all of a particular kind of survey.
 * Only completed surveys will be returned.
 */
app.post('/surveyByType', (req, res) => {
  surveyService.getBySurveyName(req.body.typeName)
    .then(result => res.send(result))
    .catch(err => console.error(err));
});

/**
 * Retuns a single blank survey given
 * the name of the survey.
 */
app.post('/blankSurveyByType', (req, res) => {
  surveyService.getBlankSurveyByName(req.body.typeName)
    .then(result => res.send(result))
    .catch(err => console.error(err));
})

/**
 * Return a personal (answered) survey
 * for the given owner and survey.
 */
app.post('/surveyByOwner', (req, res) => {
  surveyService.getSurveyByOwner(req.body.owner, req.body.survey)
    .then(result => res.send(result))
    .catch(err => console.error(err));
});

/**
 * Save a survey. Returns the saved document.
 */
app.post('/survey', (req, res) => {
  surveyService.saveSurvey(req.body)
    .then(result => res.send(result))
    .catch(err => console.error(err));
})

/**
 * Call with an updated survey, it will
 * replace an existing survey.
 */
app.post('/update', (req, res) => {
  surveyService.updateBySurveyName(req.body)
    .then(result => res.send(result))
    .catch(err => console.error(err));
})

/**
 * Delete ALL surveys by name
 */
app.delete('/surveys', (req, res) => {
  surveyService.deleteSurveysByName(req.body.name)
    .then(result => res.send(result))
    .catch(err => console.error(err));
})

/**
 * Return a blank survey for a survey-taker
 * to fill out.  Takes the participant's
 * id as a parameter.
 */
app.post('/blankSurveyFor', (req, res) => {
  surveyService.getBlankSurveyFor(req.body.participantId)
    .then( result => res.send(result))
    .catch(err => console.error(err));
})

/**
 * Add a bunch of participants for a survey.
 * Takes an array of participant names along
 * with the survey name.
 */
app.post('/participant', (req, res) => {
  surveyService
    .addSurveyParticipants(req.body.surveyName, req.body.names)
    .then(result => res.send(result))
    .catch(err => console.error(err));
})

/**
 * Return a list of participants for a 
 * particular survey
 */
app.post('/surveyTakers', (req, res) => {
  surveyService.getParticipantsBySurvey(req.body.surveyName)
    .then(result => res.send(result))
    .catch(err => console.error(err));
})


// connect and listen...
surveyMongo.mongoConnection().then(async () => {
  app.listen(port, () => {
    console.log(`listening on: ${port}`)
  });
})
