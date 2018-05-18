const path = require('path');

// Load ORM
const Sequelize = require('sequelize');


const url = process.env.DATABASE_URL || "sqlite:quizzes.sqlite";
const sequelize = new Sequelize(url);

// To use SQLite data base:
// DATABASE_URL = sqlite:quiz.sqlite
// To use  Heroku Postgres data base:
// DATABASE_URL = postgres://user:passwd@host:port/database

//const sequelize = new Sequelize("sqlite:quizzes.sqlite",{logging:false});



/*
sequelize.define('quiz',{
	question:{
		type:Sequelize.STRING,
		unique:{msg:"Ya existe esta pregunta"},
		validate:{notEmpty:{msg:"La pregunta no puede estar vacía"}}
	},
	answer:{
		type:Sequelize.STRING,
		validate:{notEmpty:{msg:"La pregunta no puede estar vacía"}}
	
	}
});
*/

//creamos la base de datos quiz
//quiz.function(sequelize, Sequelize);

/*
sequelize.sync()
.then(()=>sequelize.models.quiz.count())
.then(count=>{
	if(!count){
		return sequelize.models.quiz.bulkCreate([
			{question:"¿Tú novi@ te pone los cuernos",answer:"Si"},
			{question:"¿Tú novi@ te quiere solo por el interés?",answer:"Si"},
			{question:"¿Ser Teleco ayuda a ligar?",answer:"No"},
			{question:"¿Crees que morirás sol@?",answer:"Si"},
			{question:"¿Crees que algún día conseguirás a tu amor platónico?",answer:"No"},
			])
	}
})
.catch(error=>{
	console.log(error);
});
*/

// Import the definition of the Quiz Table from quiz.js
sequelize.import(path.join(__dirname, 'quiz'));

// Session
sequelize.import(path.join(__dirname,'session'));

// Create tables
sequelize.sync()
.then(() => console.log('Data Bases created successfully'))
.catch(error => {
    console.log("Error creating the data base tables:", error);
    process.exit(1);
});


module.exports = sequelize;
