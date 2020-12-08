const surveyMongo = require('./surveyMongo.js');


exports.getAllSurveys = async () => {
  try {
    const result = await surveyMongo.Survey.find();
    return result;
  } catch (err) {
    return await Promise.reject(new Error(err));
  }
}

/**
 * Returns all COMPLETED surveys of a particular
 * kind.  Any blank survey is not returned.
 * @param {String} surveyName the survey type
 */
exports.getBySurveyName = async surveyName => {
  try {
    const result = await surveyMongo.Survey
      .find({ questionaireTypeName: decodeURI(surveyName), owner: { $ne: "" } });
    return result;
  } catch (err) {
    return await Promise.reject(new Error(err));
  }
}

/**
 * Returns a blank copy of a survey named by the parameter.
 * @param {String} surveyName the type of survey
 */
exports.getBlankSurveyByName = async surveyName => {
  try {
    const result = await surveyMongo.Survey.findOne(
      {
        questionaireTypeName: surveyName,
        owner: ""
      });
    try {
      // make and return a copy
      let newClone = new surveyMongo.Survey({
        questionaireTypeName: result.questionaireTypeName,
        questions: result.questions
      });

      return newClone;

    } catch (error) {
      return Promise.reject(new Error(err));
    }
  } catch (err) {
    return await Promise.reject(new Error(err));
  }
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
exports.updateBySurveyName = async updatedSurvey => {
  try {
    const result = await surveyMongo.Survey.findOneAndUpdate(
      {
        questionaireTypeName: updatedSurvey.questionaireTypeName
      },
      {
        questions: updatedSurvey.questions,
        owner: updatedSurvey.owner
      },
      {
        useFindAndModify: false
      });
    return result;
  } catch (err) {
    return await Promise.reject(new Error(err));
  }
}

/**
 * Returns a (completed) survey for a particular owner.
 * @param {String} _owner the participant
 * @param {String} survey the name of the completed survey
 */
exports.getSurveyByOwner = async (_owner, survey) => {
  try {
    const result = await surveyMongo.Survey.find({ owner: _owner, questionaireTypeName: survey });
    return result;
  } catch (err) {
    return await Promise.reject(new Error(err));
  }
}

/**
 * Save
 * @param {String} survey 
 */
exports.saveSurvey = async survey => {
  let newMongoSurvey = new surveyMongo.Survey(survey);

  try {
    const result = await newMongoSurvey.save();
    return result;
  } catch (err) {
    return await Promise.reject(new Error(err));
  }
}

/**
 * Delete all surveys of a particular type along 
 * with all the assigned participants.
 * @param {String} surveyName name/type to delete 
 */
exports.deleteSurveysByName = async surveyName => {
  try {
    await surveyMongo.Survey.deleteMany({ questionaireTypeName: surveyName });
    surveyMongo.Participant.deleteMany({ surveyName: surveyName })
      .catch(err => {
        console.error(err);
        return { surveyName: sureyName };
      });
  } catch (err_1) {
    console.error(err_1);
    return { surveyName: surveyName };
  }
}

/**
 * Create survey-takers for a particular survey.
 * @param {String} surveyName Survey Name
 * @param {[String]} participants An array of names
 */
exports.addSurveyParticipants = async (surveyName, participants) => {
  let toInsert = [];

  const alreadyListed = (_newParticipant, _existingParticipants) => {
    return _existingParticipants.some(({ participant }) => { return participant === _newParticipant });
  }

  // get existing participant list to avoid duplicates.
  try {
    const existingParticipants = await surveyMongo.Participant.find();
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
      .then(() => toInsert)
      .catch(err => Promise.reject(new Error(err)));
  } catch (err_1) {
    return await Promise.reject(new Error(err_1));
  }
}

/**
 * Return everyone signed up to fill out this survey.
 * @param {String} surveyName 
 */
exports.getParticipantsBySurvey = async surveyName => {
  try {
    const result = await surveyMongo.Participant.find({ surveyName: surveyName });
    return result;
  } catch (err) {
    return await Promise.reject(new Error(err));
  }
}
