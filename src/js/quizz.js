var main_width = 1920;
var main_height = 1080;

var currentQuizz = 0;
var currentQuestion = 1;
var bonne_reponse = "???";
var url = "question/quizz.json";
var JsonArray = "";

var duree_question = 8;
var duree_reponse = 3;
var duree_reponse_txt = 7;
var duree_affichage_resultats = 18;
var secondes = 0;
var playVideo_onEnd = "";
var waitForStart = false;

var monoJoueurMode = false;
var testNoBody = 0;

var couleur_id_currentQuizz = ["#000000","#0078b4","#a0dcfa","#e66428","#f5b45a"];
var currentCouleur = "#000";
var gris_prop = "#a8a59e";
var gris_wrong_prop = "#e9e5de";

var timer1;
var timer2;
var timer3;
var canVoteTimer;
var timer_sleeping;

var showQuizz = false;

var canVote = false;

// hack to transparently make media work with browser and node webkit
var currentLocation = window.location.href;
if (currentLocation.indexOf("index.html") > -1) {
	currentLocation = currentLocation.substr(0, currentLocation - "index.html".length);
}


// Main init

function initMain(index){

	playVideo("1.1");

	show_ecran("none");
	currentQuizz = index;
	currentQuestion = 1;
	showQuizz = false;
	testNoBody = 0;
	clearTimeout(timer1);
	clearTimeout(timer2);
	clearTimeout(timer3);
	$(document).unbind('keypress');
	$(document).keypress(Touchdown);
	$(document).keypress(traitement);
	canVote = false;
	//nextQuizz();
	//Quizz_ckeckOut();

	/* on définit une fois pour toute le bind ended de la vidéo "réponse" pour ne pas dupliquer ce comportement */
	$("#zone_reponse video").unbind('ended');
	$("#zone_reponse video").bind("ended", function() { question_CheckOut(); $("#zone_reponse video").delay( 1000 ).fadeOut(); } );

	if (typeof require !== 'undefined'){
		var gui = require('nw.gui');
		gui.App.setCrashDumpDir(gui.App.dataPath);
		//var win = gui.Window.get();
		// show devtools to debug
		//win.showDevTools();
	}
}

// Screen switch

function show_ecran(id){

	switch(id){
		case "ecran_video":
			$("#ecran_video").css("display","block");
			$("#ecran_questions").css("display","none");
			$("#zone_reponse").css("display","none");
			$("#ecran_resultat").css("display","none");
			break;
		case "questions":
			$("#ecran_questions").fadeIn();
			$("#zone_reponse").css("display","none");
			$("#ecran_resultat").css("display","none");
			$("#ecran_video").css("display","none");
			break;
		case "ecran_resultat":
			$("#ecran_resultat").fadeIn();
			$("#zone_reponse").css("display","none");
			$("#ecran_questions").css("display","none");
			$("#ecran_video").css("display","none");
			break;
	}
}

// Gameplay

function nextQuizz(){
	console.log("// function nextQuizz");
	console.log("init Quizz N°"+currentQuizz);

	showQuizz = true;
	show_ecran("questions");
	
	/* avant modif par géraldine */
	if(currentQuizz<4){ currentQuizz=Number(currentQuizz+1); }else{ main_reset(); }
	
	/* modif Géraldine */
	// Le quizz n°1 a l'index 0, il faut donc faire un reset au 3eme index
	//if(currentQuizz<3){ currentQuizz=Number(currentQuizz+1); }else{ main_reset(); }

	/* custom visuals  */
	currentCouleur = couleur_id_currentQuizz[currentQuizz];
	$("#gifTimer span").css("color",currentCouleur);
	$("#num_Question").css("color",currentCouleur);
	document.getElementById("num_Quizz").className= "num_Quizz_q"+currentQuizz; ;
	document.getElementById("footer").className= "footer_q"+currentQuizz; ;

	/* init Screen */
	TweenLite.to("#prop_a", 0, {opacity:"0"});
	TweenLite.to("#prop_b", 0, {opacity:"0"});
	TweenLite.to("#prop_c", 0, {opacity:"0"});

	$("#prop_a a").css("color","#000");
	$("#prop_b a").css("color","#000");
	$("#prop_c a").css("color","#000");

	/* init Gameplay */
	joueur1.initScore();
	joueur2.initScore();
	joueur3.initScore();
	currentQuestion = 0;

	/* get Quizz */
	var urlQuizz = "question/quizz_"+currentQuizz+".json";
	$.getJSON(urlQuizz, function(data) {
		valideJsonArray(data);
	});
}

function valideJsonArray(arr) {
	JsonArray = arr;
	currentQuestion = 0;
	question_CheckIn();
}

function Quizz_ckeckOut(){
	console.log("// function Quizz_ckeckOut");

	show_ecran("ecran_resultat");
	$("#ecran_resultat span.score_j1").html(joueur1.score+" pt");
	$("#ecran_resultat span.score_j2").html(joueur2.score+" pt");
	$("#ecran_resultat span.score_j3").html(joueur3.score+" pt");

	clearTimeout(timer3);
	timer3 = setTimeout(Quizz_IsOver,duree_affichage_resultats*1000);
}

function Quizz_IsOver(){

	clearTimeout(timer3);
	if(currentQuizz==4){ main_reset(); }
	else{	playVideo("1.1_interQuizz"); }
}

function nextQuestion(){

	if(showQuizz == false){ $("#ecran_questions").css("display","none"); }
	else{
		if(currentQuestion< Number(JsonArray.length)-1){
			currentQuestion++;
			question_CheckIn();
		}else{ Quizz_ckeckOut() }
	}
}


function question_CheckIn(){

	console.log("// function question_CheckIn");

	joueur1.iconBgPos = "0 100%";
	joueur2.iconBgPos = "0 100%";
	joueur3.iconBgPos = "0 100%";
	updateScores();



	var i = currentQuestion;
	updateScores();
	$( " #num_Question" ).html("Question "+Number(currentQuestion+1)+"/"+10)
	$( "#ecran_questions" ).fadeIn(1000);

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



	TweenLite.set(".score_j1 .icon_j1", { rotationY:"450", opacity:"0.5" });
	TweenLite.set(".score_j2 .icon_j2", { rotationY:"450", opacity:"0.5" });
	TweenLite.set(".score_j3 .icon_j3", { rotationY:"450", opacity:"0.5"  });

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

	joueur1.avote = false;
	joueur2.avote = false;
	joueur3.avote = false;

	clearTimeout(canVoteTimer);
	canVoteTimer = setTimeout(function() {
		//$(document).keypress(traitement);
		canVote = true;
	}, 2000);

	document.getElementById("gif_chrono").src = "img/chrono_q"+currentQuizz+".gif?time=" + new Date();
	secondes = duree_question;
	loop_CompteArebours();
}


function updateScores(){

	posBg =  "0 "+ Math.floor( joueur1.score  ) + "%";
	$(".score_j1 .score").css("background-position", posBg );
	$(".score_j1 .icon_j1").css("background-position",joueur1.iconBgPos);

	posBg =  "0 "+ Math.floor( joueur2.score  ) + "%";
	$(".score_j2 .score").css("background-position", posBg );
	$(".score_j2 .icon_j2").css("background-position",joueur2.iconBgPos);

	posBg =  "0 "+ Math.floor( joueur3.score  ) + "%";
	$(".score_j3 .score").css("background-position", posBg );
	$(".score_j3 .icon_j3").css("background-position",joueur3.iconBgPos);

	var tween1 = TweenMax.to(".score_j1 .icon_j1", 2, { rotationY:0, opacity:"1", delay:0.1, ease:Power2.easeOut});
	var tween2 = TweenMax.to(".score_j2 .icon_j2", 2, { rotationY:0, opacity:"1",  delay:0.1, ease:Power2.easeOut});
	var tween3 = TweenMax.to(".score_j3 .icon_j3", 2, { rotationY:0, opacity:"1", delay:0.1, ease:Power2.easeOut});
}

function loop_CompteArebours(){
	if(secondes<0){
		$("#gifTimer span").html("");
		clearTimeout(timer1);
		showReponse();
	}else{
		$("#gifTimer span").html(secondes);
		clearTimeout(timer1);
		timer1 = setTimeout(loop_CompteArebours,1500);
		secondes--;
	}
}


function showReponse(){

	canVote = false;

	joueur1.avote = true;
	joueur2.avote = true;
	joueur3.avote = true;


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
	$("#zone_reponse video").css("display","none");
	$("#zone_reponse .reponse").html("");
	var i =  currentQuestion;

	if(JsonArray[i].reponse != "none"){

		// soit on a une réponse ecrite, alors on l'affiche et on met en route un timer2 qui declenchera checkOut
		$("#zone_reponse .reponse").html(JsonArray[i].reponse);
		$("#zone_reponse .reponse").delay( duree_reponse*1000 ).fadeIn( 600 );
		$("#zone_reponse .reponse").delay( duree_reponse*1000 + duree_reponse_txt*1000  ).fadeOut( 1000 );
		$( "#zone_reponse" ).delay( duree_reponse*1000 ).fadeIn( 400 );

		clearTimeout(timer2);
		timer2 = setTimeout(question_CheckOut,(duree_reponse*1000+duree_reponse_txt*1000 + 3000));
	}else{
		if(JsonArray[i].reponse_anim != "none"){

			// soit on a une réponse vidéo
			videoFile = currentLocation + "media/"+JsonArray[i].reponse_anim;

			var video_reponse = document.getElementById("video_reponse");
			$("#video_reponse").delay( duree_reponse*1000 ).fadeIn( 400 );

			video_reponse.style.className = "antiflicker";
			video_reponse.addEventListener("play", function() {
				video_reponse.style.className = "";
			});

		    video_reponse.children[0].src = videoFile+".webm";
		    video_reponse.children[1].src = videoFile+".mp4";

			$("#zone_reponse video").css("display","block");
			$("#zone_reponse").css("display","block");
			TweenLite.fromTo("#zone_reponse", 1, {opacity:"0"}, {  delay:2.5, opacity:"1",  onComplete:playvidAnswer } );
		}else{
			// soit on a pas de réponse
			clearTimeout(timer2);
			timer2 = setTimeout(question_CheckOut,duree_reponse*1000);
		}
	}
}

function playvidAnswer(){

		$("#zone_reponse video")[0].load();
		TweenLite.fromTo("#zone_reponse video", 0.2, {opacity:"0"}, {  delay:0.2, opacity:"1" } );
}


function question_CheckOut(){
	console.log("// function question_CheckOut");

	clearTimeout(timer2);
	testNoBody++;
	console.log("testNoBody "+testNoBody);
	if(testNoBody>=3){

		testNoBody = 0;

		clearTimeout(timer1);
		clearTimeout(timer2);
		clearTimeout(timer3);
		if (currentQuizz === 4) currentQuizz = 0;
		initMain(currentQuizz);

	} // réinitialisation si aucune réponse deux questions de suite
	else{
		$("#zone_reponse").delay( 1000 ).fadeOut(1000);
		var i =  currentQuestion;
		TweenLite.to("#question", 1, { opacity:"0", onComplete:nextQuestion});
		TweenLite.to("#prop_a", 1, { opacity:"0"});
		TweenLite.to("#prop_a a", 1, {css:{ color:"#000"}});
		TweenLite.to("#prop_b", 1, { opacity:"0"});
		TweenLite.to("#prop_b a", 1, { color:"#000"});
		TweenLite.to("#prop_c", 1, { opacity:"0"});
		TweenLite.to("#prop_c a", 1, { color:"#000"});
		$("#illus_question").fadeOut();
	}
}


function traitement(evenement){

	if (canVote) {
		testNoBody = 0;
		show_multijoueurs_mode();
		var caractere = String.fromCharCode(evenement.which);
		switch(caractere) {
			case "1": 	if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="a")); }
				break;
			case "2": 	if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="b")); }
				break;
			case "3": 	if(joueur1.avote == false){ joueur1.reponse((bonne_reponse=="c")); }
				break;
			case "4": 	if(joueur2.avote == false){ joueur2.reponse((bonne_reponse=="a")); }
				break;
			case "5":   if(joueur2.avote == false){ joueur2.reponse((bonne_reponse=="b")); }
				break;
			case "6": 	if(joueur2.avote == false){ joueur2.reponse((bonne_reponse=="c")); }
				break;
			case "7": 	if(joueur3.avote == false){ joueur3.reponse((bonne_reponse=="a")); }
				break;
			case "8": 	if(joueur3.avote == false){ joueur3.reponse((bonne_reponse=="b")); }
				break;
			case "9": 	if(joueur3.avote == false){ joueur3.reponse((bonne_reponse=="c")); }
				break;
		}
		updateScores();
	}
}

function show_multijoueurs_mode(){

	$(".score_j1 .intitule").html("Joueur 1");
	$(".score_j2 .intitule").html("Joueur 2");
	$(".score_j3 .intitule").html("Joueur 3");

	$(".score_j1").css("display","block");
	$(".score_j2").css("display","block");
	$(".score_j3").css("display","block");

	$("#ecran_resultat li.score_j1").css("width","27%");
}

function show_monojoueurs_mode(){

	console.log("show_monojoueurs_mode");
	monoJoueurMode = true;
	$(".score_j1 .intitule").html("Score");
	$(".score_j2").css("display","none");
	$(".score_j3").css("display","none");
	$("#ecran_resultat").css("background-image","url('img/bg_ecran_resultats_solo.png')");
	$("#ecran_resultat li.score_j1").css("width","92%");
	$("#ecran_resultat li.score_j2").css("display","none");
	$("#ecran_resultat li.score_j3").css("display","none");
	playVideo("1.3");
}

function clickAnswer(myAnswer){

	testNoBody = 0;
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
	clearTimeout(timer1);
	showReponse();
	updateScores();
}


function playVideo(id){

	show_ecran("ecran_video");
	// init some vars the switch will handle
	var videoFile = "";
	var toDoOnClick = function(){};
	var toDoOnEnd = function(){};
	var loop = false;

	// configure the playback
	switch(id) {
		case "1.1":
			videoFile = currentLocation + "media/1.1Titre_entree";
			toDoOnEnd = function() { playVideo("1.2"); };
			toDoOnClick = function() { playVideo("1.2"); };
			break;
		case "1.1_interQuizz":
			videoFile = currentLocation + "media/1.1Titre_entree";
			toDoOnEnd = function() { playVideo("1.3_interQuizz"); };
			toDoOnClick = function() { playVideo("1.3_interQuizz"); };
			break;

		case "1.2":
			videoFile = currentLocation + "media/1.2Titre_boucle";
			toDoOnEnd = function() {} ;
			toDoOnClick = function() { show_monojoueurs_mode(); } ;
			loop = true;
			waitForStart = true; // detetction dans la fonction Touchdown() pour lecture de la vidéo suivante
			break;
		case "1.3":
			videoFile = currentLocation + "media/1.3Titre_sortie";
			toDoOnEnd = function() { playVideo("2.1"); };
			toDoOnClick = function() { playVideo("2.1"); };
	 		waitForStart = false;
			break;
		case "1.3_interQuizz":
			videoFile = currentLocation + "media/3.1_choix_quiz_entree";
			toDoOnEnd = function() { playVideo("3.2"); };
			toDoOnClick = function() {  playVideo("3.2"); };
			break;
		case "2.1":
			videoFile = currentLocation + "media/2.1_principe_jeu";
			toDoOnEnd = function() { playVideo("3.1"); };
			toDoOnClick = function() { playVideo("3.1"); };
			break;
		case "3.1":
			videoFile = currentLocation + "media/3.1_choix_quiz_entree";
			toDoOnEnd = function() { playVideo("3.2"); };
			toDoOnClick = function() {  playVideo("3.2"); };
			break;
		case "3.2":
			videoFile = currentLocation + "media/3.2_choix_quiz_sortie_" + Number(currentQuizz+1) ;
			toDoOnEnd = function() { playVideo("4.1"); };
			toDoOnClick = function() { playVideo("4.1"); };
			break;
		case "4.1":
			videoFile = currentLocation + "media/4.1_compte_a_rebours";
			toDoOnEnd = function() { playVideo("noVideo"); nextQuizz(); };
			toDoOnClick = function() {};
			break;

		case "noVideo":
			break;
	}

	console.log("playVideo function id = "+id);
	//console.log("onEnd = "+toDoOnEnd);


	var currentVideo = document.getElementById("videoclip");
	// clone the current video, it will remove all previous event listeners
	var newVideo = currentVideo.cloneNode(true);
	// bind the click listener
	newVideo.addEventListener("click", toDoOnClick);
	// bind the ended listener
	newVideo.addEventListener("ended", toDoOnEnd);
	// trick to avoid flickering
	// set to display none and size of 1px so the flickering will happen on only 1px
	// thus invisible for the user
	newVideo.style.className = "antiflicker";
	newVideo.loop = loop;
	// when the new video is playing, reset size and display to its defaults
	newVideo.addEventListener("play", function() {
// [GL] Quand ça bugue on n'arrive pas ici !
		newVideo.style.className = "";
		// and finally replace the video in the DOM
		//console.log('play');
		document.getElementById("ecran_video").replaceChild(newVideo, currentVideo);
	});
	//if (id == "1.1") alert(currentVideo + '     ' + newVideo.children[0] + '     ' + newVideo.children[1] +  '     ' + videoFile);

	if(id=="noVideo"){
    	newVideo.children[0].src = newVideo.children[1].src = "";
	}
	else{
	    newVideo.children[0].src = videoFile+".webm";
	    newVideo.children[1].src = videoFile+".mp4";
	}

	if (bowser.msie || bowser.safari) newVideo.play();
	newVideo.load();

}


// gestion du reset


function Touchdown(evenement){

	var caractere = String.fromCharCode(evenement.which);
	if(caractere === "r") main_reset();
	if(waitForStart === true) playVideo("1.3");

}

function main_reset(){
	console.log("// function main_reset");
	window.location.reload();
}


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
	//	console.log(this.name+" answer : "+isRiteOrWrong+" score : "+this.score);
	}
}

// init 3 joueurs

var joueur1 = new joueur("joueur 1");
var joueur2 = new joueur("joueur 2");
var joueur3 = new joueur("joueur 3");

// Main init


window.onload=function(){
	initMain(0);
};



