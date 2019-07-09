const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const url = require('url');
const bodyParser = require('body-parser')
const questionData = require('./public/api/questionData');
const sessionData = require('./public/api/sessionData');
const models = require('./public/api/models');

const hostname = '127.0.0.1';
const port = 3000;

let state = {
    sessions: [],
    questionSets: []
};

var app = express();
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')));

// Audience experience
app.get('/web', function (req, res) {

    let fileName = path.join(__dirname, '/public/web', 'index.html');
    fs.readFile(fileName, function (err, data) {
        res.statusCode = 200;
        res.write(data);
        res.end();
    });
});

// Presenter experience
app.get('/add-in', function (req, res) {
    let fileName = path.join(__dirname, '/public/add-in', 'index.html');
    fs.readFile(fileName, function (err, data) {
        res.statusCode = 200; // OK
        res.write(data);
        res.end();
    });
});



// Get questions for a presentation
app.get('*/api/questions/pid/:pid', function (req, res) {

    try {        
        let presentationId = req.params.pid;
        console.log(`GET */api/questions/pid/${presentationId}`);

        let questionSet = state.questionSets.find((qs) => qs.presentationId === presentationId);
        
        if (questionSet !== undefined) {
            res.statusCode = 200; // OK
            res.json(questionSet);
        }
        else {
            res.statusCode = 204; // No Content
            console.log("204 No Content");
        }
    }
    catch (e) {
        res.statusCode = 500; // Internal server error
        console.log(e);
    }
    finally {
        res.end();
    }
});

// Save a question
app.post('*/api/question/save', function (req, res) {

    try {
        let presentationId = req.query.pid;
        let slideId = req.query.sid;
        let questionText = req.query.text;

        console.log(`POST */api/question/save/pid/${presentationId}/sid/${slideId}/text/${questionText}`);

        let questionSet = state.questionSets.find((qs) => qs.presentationId === presentationId);

        if (questionSet === undefined) {
            questionSet = new models.QuestionSet(presentationId);
            questionSet.addUpdateQuestion(slideId, questionText);
            state.questionSets.push(questionSet);
        }
        else {
            questionSet.addUpdateQuestion(slideId, questionText);
        }

        res.statusCode = 200; // OK
        res.json(questionSet);
    }
    catch (e) {
        res.statusCode = 500; // Internal server error
        console.log(e);
    }
    finally {
        res.end();
    }
});

// Get or Create a new session for a live presentation
app.get('*/api/session/live', function (req, res) {

    try {
        let presentationId = req.query.pid;
        let slideId = req.query.sid;
        console.log(`GET */api/session/live?pid=${presentationId}&sid=${slideId}`);

        let session = state.sessions.find((s) => s.presentationId == presentationId);

        if (!session) {
            session = new models.Session(presentationId);
            state.sessions.push(session);
        }

        session.activeSlideId = slideId;


        res.statusCode = 200; // OK
        res.json(session);
    }
    catch (e) {
        res.statusCode = 500; // Internal server error
        console.log(e);
    }
    finally {
        res.end();
    }
});

// Get a session by code
app.get('*/api/session/:code', function (req, res) {

    try {
        let code = req.params.code;
        let slideId = req.query.slideId;
        let session = state.sessions.find((s) => s.code == code);

        console.log(`GET */api/session/${code}`);

        if (session === null) {
            res.statusCode = 204; // No Content
            return;
        }

        let presentationId = session.presentationId;
        let questionSet = state.questionSets.find((qs) => qs.presentationId == presentationId);
        let question = questionSet.getBySlideId(slideId);
        session.currentQuestion = question;

        res.statusCode = 200; // OK
        res.json(session);
    }
    catch (e) {
        res.statusCode = 500; // Internal server error
        console.log(e);
    }
    finally {
        res.end();
    }

    return;
});

// Submit a response
app.post('*/api/session/:code', function (req, res) {

    try {

        let code = req.params.code;
        let response = req.query.response;
        let session = state.sessions.find((s) => s.code == code);

        session.respond(session.currentQuestion.slideId, response);

        let session = new models.Session(presentationId);
        state.sessions.push(session);

        console.log(`POST */api/session/${code}?response=${response}`);

        res.statusCode = 200; // OK
        res.json(session);
    }
    catch (e) {
        res.statusCode = 500; // Internal server error
        console.log(e);
    }
    finally {
        res.end();
    }
});

const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});