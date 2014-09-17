var currentQuizz = 1;
var currentQuestion = 1;
var bonne_reponse = "???";
var url = "question/quizz.json";
var JsonArray = "";

var duree_question = 4;
var secondes = 0;

var currentCouleur = "#81ccc2";
var gris_prop = "#a8a59e";
var gris_wrong_prop = "#e9e5de";

var timer1;
var timer2;


// joueur object

var joueur = function(name){
	this.name = name;
	this.score = 0;
	this.avote = false;
	this.iconBgPos = 0;
	this.getScore = function(){
		return(this.score);
	}
	this.initScore = function(){
		this.score = 0;
	}
	this.reponse = function(isRiteOrWrong){
		if(isRiteOrWrong){
			// right
			this.score+= 10;
			this.iconBgPos = "0 0px";
		}else{
			this.iconBgPos = "0 50%";
		}
		this.avote = true;
		console.log(this.name+" answer : "+isRiteOrWrong+" score : "+this.score);
	}
}

// init 3 joueurs

var joueur1 = new joueur("joueur 1");
var joueur2 = new joueur("joueur 2");
var joueur3 = new joueur("joueur 3");

$( "#ecran_choix_quizz" ).hide(0);
$( "#ecran_question" ).hide(0);


function updateScores(){

	$(".score_j1 .score").html( joueur1.score+"pt");
	$(".score_j1 .icon").css("background-position",joueur1.iconBgPos);
	$(".score_j2 .score").html( joueur2.score+"pt");
	$(".score_j2 .icon").css("background-position",joueur2.iconBgPos);
	$(".score_j3 .score").html( joueur3.score+"pt");
	$(".score_j3 .icon").css("background-position",joueur3.iconBgPos);
}


function valideJsonArray(arr) {

	JsonArray = arr;
	currentQuestion = 0;
	question_CheckIn();
}


function startNewQuizz(id){

	joueur1.initScore();
	joueur2.initScore();
	joueur3.initScore();
	$("#gifTimer span").css("color",currentCouleur);
	$( "#ecran_choix_quizz" ).hide();
	currentQuizz = id;
	currentQuestion = 0;
	var urlQuizz = "question/quizz_"+currentQuizz+".json";
	//var urlQuizz = "quizz.json";
	// loading des questions
	$.getJSON(urlQuizz, function(data) {
		valideJsonArray(data);
	});
}


function ShowChoixQuizz(){

	$( "#ecran_choix_quizz" ).fadeIn(1000);
	$( "#ecran_question" ).hide(0);

}

function nextQuestion(){

	console.log(currentQuestion+"/"+JsonArray.length-1);
	if(currentQuestion<JsonArray.length-1){
		currentQuestion++;
		question_CheckIn();
	}else{ finiQuizz() }
}

function question_CheckIn(){

	joueur1.iconBgPos = "0 100%";
	joueur2.iconBgPos = "0 100%";
	joueur3.iconBgPos = "0 100%";
	updateScores();

	console.log("// function question_CheckIn");
	$("#gifTimer img").attr('display',"none");
	$("#gifTimer img").attr('src',"");

	var i = currentQuestion;
	updateScores();
	$( " #num_Question" ).html("Question "+Number(currentQuestion+1)+"/"+10)
	$( "#ecran_question" ).fadeIn(1000);
	console.log(JsonArray[i].question);

	$("#question").html(JsonArray[i].question);
	TweenLite.to("#question", 0, {top:25, opacity:"0"});
	TweenLite.to("#question", 0.5, {top:0, opacity:"1", ease:Power2.easeOut});

	$("a.proposition_a").html(JsonArray[i].proposition_a);
	TweenLite.to("#prop_a .puce", 0, {backgroundColor:gris_prop, rotation:"-405"});
	TweenLite.to("#prop_a .puce", .5, { delay:2, rotation:"45"});
	TweenLite.to("#prop_a", 0, {opacity:"0"});
	TweenLite.to("#prop_a", 1.5, {delay:2, opacity:"1", ease:Power2.easeOut});

	$("a.proposition_b").html(JsonArray[i].proposition_b);
	TweenLite.to("#prop_b .puce", 0, {backgroundColor:gris_prop,  rotation:"-405"});
	TweenLite.to("#prop_b .puce", .5, { delay:2.2, rotation:"45"});
	TweenLite.to("#prop_b", 0, { opacity:"0"});
	TweenLite.to("#prop_b", 1.5, {delay:2.2, opacity:"1", ease:Power2.easeOut});

	$("a.proposition_c").html(JsonArray[i].proposition_c);
	TweenLite.to("#prop_c .puce", 0, {backgroundColor:gris_prop,   rotation:"-405"});
	TweenLite.to("#prop_c .puce", .5, { delay:2.5, rotation:"45"});
	TweenLite.to("#prop_c", 0, { opacity:"0"});
	TweenLite.to("#prop_c", 1.5, {delay:2.5, opacity:"1", ease:Power2.easeOut });
	bonne_reponse = JsonArray[i].bonne_reponse;

	if(JsonArray[i].question_img != "none"){
		$("#illus_question").attr('src',"img/illus/"+JsonArray[i].question_img);
		$("#illus_question").fadeIn();
	}else{
		$("#illus_question").css('display',"none");
		$("#illus_question").attr('src',"");
	}

	waitForAnswer();
}

function waitForAnswer(){

	console.log("// function waitForAnswer");
	//waitForAnswer
	joueur1.avote = false;
	joueur2.avote = false;
	joueur3.avote = false;
	$(document).keypress(traitement);
	$("#gifTimer span").html("");
	$("#gifTimer span").fadeIn(100);
	$("#gifTimer img").fadeIn(100);
	$("#gifTimer img").attr('src',"img/chrono_q2.gif");
	console.log("call -> loop_CompteArebours / secondes = "+ secondes);
	secondes = duree_question;
	loop_CompteArebours();
}


function loop_CompteArebours(){

	console.log("loop_CompteArebours "+ secondes);
   //
	if(secondes<0){
		clearTimeout(timer1);
		showReponse();
	}else{
		$("#gifTimer span").html(secondes);
		timer1 = setTimeout(loop_CompteArebours,1500);
		secondes--;
	}
}


function showReponse(){

	console.log("// function showReponse");
	$("#gifTimer img").fadeOut(100);
	$("#gifTimer span").fadeOut(100);

	switch(bonne_reponse) {
		case "a":
			TweenLite.to("#prop_a .puce", 2, {backgroundColor:currentCouleur, rotation:"405",    ease:Elastic.easeOut});
			TweenLite.to("#prop_a a", 2, {color:currentCouleur,    ease:Elastic.easeOut});
			TweenLite.to("#prop_b", 2, { opacity:"0.2", ease:Power2.easeOut});
			TweenLite.to("#prop_c", 2, { opacity:"0.2", ease:Power2.easeOut});
			break;
		case "b":
			TweenLite.to("#prop_a", 2, { opacity:"0.2", ease:Power2.easeOut});
			TweenLite.to("#prop_b .puce", 2, {backgroundColor:currentCouleur, rotation:"405",    ease:Elastic.easeOut});
			TweenLite.to("#prop_b a", 2, {color:currentCouleur,    ease:Elastic.easeOut});
			TweenLite.to("#prop_c", 2, { opacity:"0.2", ease:Power2.easeOut});
			break;
		case "c":
			TweenLite.to("#prop_a", 2, { opacity:"0.2", ease:Power2.easeOut});
			TweenLite.to("#prop_b", 2, { opacity:"0.2", ease:Power2.easeOut});
			TweenLite.to("#prop_c .puce", 2, {backgroundColor:currentCouleur, rotation:"405",    ease:Elastic.easeOut});
			TweenLite.to("#prop_c a", 2, {color:currentCouleur,    ease:Elastic.easeOut});
			break;
	}

	// affichage de la réponse
	var i =  currentQuestion;
	if(JsonArray[i].reponse != "none"){
		$("#zone_reponse").html(JsonArray[i].reponse);
		$("#zone_reponse").fadeIn();
		timer2 = setTimeout(question_CheckOut,6000);
	}else{
		timer2 = setTimeout(question_CheckOut,3000);
	}
}


function question_CheckOut(){

	$("#zone_reponse").fadeOut();

	clearTimeout(timer2);
	console.log("// function question_CheckOut");
	var i =  currentQuestion;
	$("#gifTimer img").attr('src',"");
	TweenLite.to("#question", 1, { opacity:"0", onComplete:nextQuestion});
	TweenLite.to("#prop_a", 1, { opacity:"0"});
	TweenLite.to("#prop_a a", 1, {css:{ color:"#000"}});
	TweenLite.to("#prop_b", 1, { opacity:"0"});
	TweenLite.to("#prop_b a", 1, { color:"#000"});
	TweenLite.to("#prop_c", 1, { opacity:"0"});
	TweenLite.to("#prop_c a", 1, { color:"#000"});
	$("#illus_question").fadeOut();
}




function finiQuizz(){

	ShowChoixQuizz();
}

function traitement(evenement){
	var caractere = String.fromCharCode(evenement.which);
	switch(caractere) {
		case "1":
			if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="a")); }
			break;
		case "2":
			if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="b")); }
			break;
		case "3":
			if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="c")); }
			break;
		case "4":
			if(joueur2.avote == false){ joueur2.reponse((bonne_reponse=="a")); }
			break;
		case "5":
			if(joueur2.avote == false){ joueur2.reponse((bonne_reponse=="b")); }
			break;
		case "6":
			if(joueur2.avote == false){ joueur2.reponse((bonne_reponse=="c")); }
			break;
		case "7":
			if(joueur3.avote == false){ joueur3.reponse((bonne_reponse=="a")); }
			break;
		case "8":
			if(joueur3.avote == false){ joueur3.reponse((bonne_reponse=="b")); }
			break;
		case "9":
			if(joueur3.avote == false){ joueur3.reponse((bonne_reponse=="c")); }
			break;
	}
	updateScores();
}

function clickAnswer(myAnswer){

	 switch(myAnswer) {
		case "a":
			if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="a")); }
			break;
		case "b":
			if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="b")); }
			break;
		case "c":
			if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="c")); }
			break;
	}

	updateScores();
}


//showVideoIntro();
ShowChoixQuizz();


function showVideoIntro(){

	$("#ecran_video").css("display","block");
	$("#ecran_video").css("height", $(window).height());

	$("#ecran_video video").css("display","block");
	var videoFile = '../media/intro.mp4';
	$('#ecran_video video source').attr('src', videoFile);
	$("#ecran_video video")[0].load();
}
