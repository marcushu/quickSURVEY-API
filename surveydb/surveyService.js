const surveyMongo = require('./surveyMongo.js');


exports.getAllSurveys = () => {
  return new Promise((resolve, reject) => {
    surveyMongo.Survey.find((err, result) => {
      if (err)
        reject(err);

      resolve(result);
    });
  });
}

/**
 * Returns all COMPLETED surveys of a particular
 * kind.  Any blank survey is not returned.
 * @param {String} surveyName the survey type
 */
exports.getBySurveyName = surveyName => {
  return new Promise((resolve, reject) => {
    surveyMongo.Survey
      .find({ questionaireTypeName: decodeURI(surveyName), owner: { $ne: "" } }, (err, result) => {
        if (err)
          reject(err);

        resolve(result);
      });
  });
}

/**
 * Returns a blank copy of a survey named by the parameter.
 * @param {String} surveyName the type of survey
 */
exports.getBlankSurveyByName = surveyName => {
  return new Promise((resolve, reject) => {
    surveyMongo.Survey.findOne(
      {
        questionaireTypeName: surveyName,
        owner: ""
      }, (err, result) => {
        if (err)
          reject(err);

        try {
          // make and return a copy
          let newClone = new surveyMongo.Survey({
            questionaireTypeName: result.questionaireTypeName,
            questions: result.questions
          });

          resolve(newClone);

        } catch (error) {
          reject(error)
        }
      });
  });
}

/**
 * Returns a blank survey for the participant to fill out.
 * This method discovers the correct survey for a participant
 * identified by the parameter and calls a local function to
 * retrieve the survey.
 * @param {String} participantId id#, associates a user with a survey
 */
exports.getBlankSurveyFor = participantId => {
  return new Promise((resolve, reject) => {
    surveyMongo.Participant.findById(participantId, (err, result) => {
      if (err) {
        reject(err);
      }
      else {
        if (!result) {
          reject(new Error("Non existant ID"));
        }
        else {
          this.getBlankSurveyByName(result.surveyName)
            .then(blankSurvey => {
              blankSurvey.owner = result.participant;
              resolve(blankSurvey)
            })
            .catch(err => reject(err));
        }
      }
    });
  });
}

/**
 * Update a document. Return the original document.
 * @param {Survey} updatedSurvey a survey to update
 */
exports.updateBySurveyName = updatedSurvey => {
  return new Promise((resolve, reject) => {
    surveyMongo.Survey.findOneAndUpdate(
      {
        questionaireTypeName: updatedSurvey.questionaireTypeName
      },
      {
        questions: updatedSurvey.questions,
        owner: updatedSurvey.owner
      },
      { useFindAndModify: false },
      (err, result) => {
        if (err) reject(err);
        resolve(result)
      });
  });
}

/**
 * Returns a (completed) survey for a particular owner.
 * @param {String} _owner the participant
 * @param {String} survey the name of the completed survey
 */
exports.getSurveyByOwner = (_owner, survey) => {
  return new Promise((resolve, reject) => {
    surveyMongo.Survey.find({ owner: _owner, questionaireTypeName: survey }, (err, result) => {
      if (err)
        reject(err);

      resolve(result);
    });
  });
}

exports.saveSurvey = survey => {
  let newMongoSurvey = new surveyMongo.Survey(survey);

  return new Promise((resolve, reject) => {
    newMongoSurvey.save(function (err, newMongoSurvey) {
      if (err)
        reject(err);

      resolve(newMongoSurvey);
    });
  });
}

/**
 * Delete all surveys of a particular type along 
 * with all the assigned participants.
 * @param {String} surveyName name/type to delete 
 */
exports.deleteSurveysByName = surveyName => {
  return new Promise((resolve, reject) => {
    surveyMongo.Survey.deleteMany({ questionaireTypeName: surveyName }, err => {
      if (err) reject(err);

      // delete survey takers
      surveyMongo.Participant.deleteMany({ surveyName: surveyName }, err => {
        if (err) reject(err);

        resolve({ surveyName: surveyName });
      });
    });
  })
}

/**
 * Create survey-takers for a particular survey.
 * @param {String} surveyName Survey Name
 * @param {[String]} participants An array of names
 */
exports.addSurveyParticipants = (surveyName, participants) => {
  let toInsert = [];

  const alreadyListed = (_newParticipant, _existingParticipants) => {
    return _existingParticipants.some(({ participant }) => { return participant === _newParticipant });
  }

  return new Promise((resolve, reject) => {
    // get existing participant list to avoid duplicates.
    surveyMongo.Participant.find((err, existingParticipants) => {
      if (err) reject(err)

      participants.forEach(newParticipant => {
        if (!alreadyListed(newParticipant, existingParticipants)) {
          let mongoParticipan = new surveyMongo.Participant({
            participant: newParticipant,
            surveyName: surveyName
          });

          toInsert.push(mongoParticipan);
        }
      });

      surveyMongo.Participant.insertMany(toInsert)
        .then(() => resolve(toInsert))
        .catch(err => reject(err));
    });
  })
}

/**
 * Return everyone signed up to fill out this survey.
 * @param {String} surveyName 
 */
exports.getParticipantsBySurvey = surveyName => {
  return new Promise((resolve, reject) => {
    surveyMongo.Participant.find({ surveyName: surveyName }, (err, result) => {
      if (err)
        reject(err);

      resolve(result);
    })
  });
}
