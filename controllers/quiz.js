const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quiz.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};

// GET /quizzes/:quizId/play
exports.randomplay = (req, res, next) => {
    //cojo la respuesta del query
    var answer = req.query.answer || "";
    //inicializo la variable a 0 si empezamos desde el principio o al valor guardado en la sesión si simplemente 
    //estamos continuando con otra pregunta
    req.session.score = req.session.score || 0;
    //promesa con la que cojo todos los quizzes de models(BBDD) y los meto en req.session.preguntas creada de cero por eso tiene el ||
    //por si no está creada que lo rellene con quizzes y si está creada que cargue las preguntas que faltan
    models.quiz.findAll()
       .then(function(quizzes) {
        req.session.preguntas = req.session.preguntas || quizzes;
        //escogemos un número aleatorio para hacer preguntas de forma random
        var posicion;
        posicion = Math.floor(Math.random()*req.session.preguntas.length);
        //comprobamos que la posicion que hemos escogido para hacer la pregunta no sea .lenght porque ese valor no existe en nuestro array

        if (posicion === req.session.preguntas.length) {
        posicion--;
        }
        //cogemos la pregunta aleatoria con la variable posicion del array preguntas
        var  quiz = req.session.preguntas[posicion]; 
        //esto era solo para debuggear
        console.log(req.session.preguntas.length);
        //borramos la pregunta( con splice se borra entero del array no pone un cero en el hueco)
        req.session.preguntas.splice(posicion,1);
        //Devolvemos la pregunta, respuesta y puntuacion
        res.render('quizzes/randomplay', {
            quiz: quiz,
            answer: answer,
            score: req.session.score
            });
           
        })
        //por si errores
        .catch(function (error) {
            next(error);
        }); 
    
};


// GET /quizzes/randomcheck/:quizId
exports.randomcheck = function (req, res, next) {
    //cojo la variable query que es la respuesta
    var answer = req.query.answer || "";
    //compruebo si la respuesta está bien y en var se mete o true o false
    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();
    //cargo el array de preguntas 
    var preguntas= req.session.preguntas;
   //miro si el resultado es true y aumento la puntuacion
    if (result) {
        req.session.score++;
        var score = req.session.score; 
    }
    //si el resultado no era true se mete aqui, guarda la puntuación en la variable score y la guardada en sesión la inicializa a cero
    //cargo las preguntas de nuevo 
    else{
        
        var score = req.session.score;
        var preguntas = req.session.preguntas;
        req.session.score = 0;
    }
    // si el array tiene longitud cero significa que hemos contestado a todas las preguntas por eso le mete un valor undefined 
    //a req.session.preguntas para que al iniciarlo de nuevo en randomcheck las cargue y no lo ponga como un array vacío
    if (preguntas.length===0){
        req.session.preguntas = undefined;
        req.session.score = 0;
        //Sacamos por pantalla la vista 
        res.render('quizzes/random_nomore', {
           score: score
        });
    }
    else {
        //Sacamos por pantalla la vista, quiz, answer, score y result
        res.render('quizzes/random_result', {
           quiz: req.quiz,
           result: result,
           answer: answer,
           score: score
        });
 }

    
};
