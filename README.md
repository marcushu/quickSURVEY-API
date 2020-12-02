# quickSURVEY-API
An API for a survey management application

A Node server built as the back end for a survey application (code to be uploaded). 
The routes provide for creating, accessing, and deleting survey questionaires and survey participants.
A client application can use this interface to build a survey, associate participants, 
generate unique survey urls, and save completed surveys. 


Object mapping is provided by [Mongoose](https://mongoosejs.com/).


## ROUTES

method | path
----------|---------
GET | /
GET | /allSurveys
POST | /surveyByType
POST | /blankSurveyByType
POST | /surveyByOwner
POST | /survey
POST | /update
DELETE | /surveys
POST | /blankSurveyFor
POST | /participant
POST | /surveyTakers

### note:
* The mongoose Survey schema provides positive/negativeIdentity keys to provide for binary survey questions.  Since binary responses
can be included in the `choices` key, the `positiveIdentity` and `negativeIdentity` keys may be removed. 
