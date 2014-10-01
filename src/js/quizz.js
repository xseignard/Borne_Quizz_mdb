var main_width = 1920;
var main_height = 1080;

var currentQuizz = 0;
var currentQuestion = 1;
var bonne_reponse = "???";
var url = "question/quizz.json";
var JsonArray = "";

var duree_question = 2;//4;
var duree_reponse = 1;//3;
var duree_reponse_txt = 2;//7;
var duree_time_reset = 120;
var duree_affichage_resultats = 18;
var secondes = 0;
var playVideo_onEnd = "";
var waitForStart = false;

var couleur_id_currentQuizz = ["#000000","#0078b4","#a0dcfa","#e66428","#f5b45a"];
var currentCouleur = "#000";
var gris_prop = "#a8a59e";
var gris_wrong_prop = "#e9e5de";

var timer1;
var timer2;
var timer3;
var timer_sleeping;

var showQuizz = false;

// hack to transparently make media work with browser and node webkit
var currentLocation = window.location.href;
if (currentLocation.indexOf("index.html") > -1) {
	currentLocation = currentLocation.substr(0, currentLocation - "index.html".length);
}


// Main init

function initMain(){

	show_ecran("none");
	currentQuizz = 0;
	currentQuestion = 1;
	reinit_timer_reset();
	playVideo("1.1");
	showQuizz = false;
	//nextQuizz();
	clearTimeout(timer1);
	clearTimeout(timer2);
	clearTimeout(timer3);
	$(document).keypress(Touchdown);


}

// Screen switch

function show_ecran(id){

	$("#ecran_video").css("display","none");
	$("#ecran_questions").css("display","none");
	$("#zone_reponse").css("display","none");
	$("#ecran_resultat").css("display","none");

	switch(id){
		case "ecran_video":
			$("#ecran_video").css("display","block");
			break;
		case "questions":
			$("#ecran_questions").fadeIn();
			break;
		case "ecran_resultat":
			$("#ecran_resultat").fadeIn();
			break;
	}
}

// Gameplay

function nextQuizz(){

	showQuizz = true;
	//alert("nextQuizz");
	show_ecran("questions");
	if(currentQuizz<4){ currentQuizz=Number(currentQuizz+1); }else{ currentQuizz = 1; }
	//console.log("init Quizz N°"+currentQuizz);

	/* custom visuals  */
	currentCouleur = couleur_id_currentQuizz[currentQuizz];
	$("#gifTimer span").css("color",currentCouleur);
	$("#num_Question").css("color",currentCouleur);
	document.getElementById("num_Quizz").className= "num_Quizz_q"+currentQuizz; ;
	document.getElementById("footer").className= "footer_q"+currentQuizz; ;
	$("#zone_reponse .reponse").css("color",currentCouleur);
	$("#zone_reponse .reponse sup").css("color",currentCouleur);

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

	show_ecran("ecran_resultat");
	$("#ecran_resultat .score_j1").html(joueur1.score+" pt");
	$("#ecran_resultat .score_j2").html(joueur2.score+" pt");
	$("#ecran_resultat .score_j3").html(joueur3.score+" pt");

	timer3 = setTimeout(Quizz_IsOver,duree_affichage_resultats*1000);
}

function Quizz_IsOver(){

	clearTimeout(timer3);
	if(currentQuizz==4){ initMain(); }
	else{	playVideo("3.1"); }
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

	joueur1.iconBgPos = "0 100%";
	joueur2.iconBgPos = "0 100%";
	joueur3.iconBgPos = "0 100%";
	updateScores();

	//console.log("// function question_CheckIn");
	$("#gifTimer img").attr('display',"none");
	$("#gifTimer img").attr('src',"");

	var i = currentQuestion;
	updateScores();
	$( " #num_Question" ).html("Question "+Number(currentQuestion+1)+"/"+10)
	$( "#ecran_questions" ).fadeIn(1000);
//console.log(JsonArray[i].question);

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

//	console.log("// function waitForAnswer");
	//waitForAnswer
	joueur1.avote = false;
	joueur2.avote = false;
	joueur3.avote = false;

	$(document).keypress(traitement);
	$("#gifTimer span").html("");
	$("#gifTimer span").fadeIn(100);
	$("#gifTimer img").fadeIn(100);
	$("#gifTimer img").attr('src',"img/chrono_q"+currentQuizz+".gif");
//	console.log("call -> loop_CompteArebours / secondes = "+ secondes);
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
		clearTimeout(timer1);
		showReponse();
	}else{
		$("#gifTimer span").html(secondes);
		timer1 = setTimeout(loop_CompteArebours,1500);
		secondes--;
	}
}


function showReponse(){

	joueur1.avote = true;
	joueur2.avote = true;
	joueur3.avote = true;

//	console.log("// function showReponse");
	$("#gifTimer img").fadeOut(200);
	$("#gifTimer span").fadeOut(400);

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


		$("#zone_reponse .reponse").html(JsonArray[i].reponse);
		$("#zone_reponse .reponse").delay( 3500 ).fadeIn( 600 );
		$( "#zone_reponse" ).delay( duree_reponse*1000 ).fadeIn( 400 );

		timer2 = setTimeout(question_CheckOut,duree_reponse_txt*1000);
	}else{
		if(JsonArray[i].reponse_anim != "none"){

			$("#zone_reponse video").delay( duree_reponse*1000 ).fadeIn( 400 );
			videoFile = currentLocation + "media/"+JsonArray[i].reponse_anim;
//			console.log("load video "+videoFile);

			$("#zone_reponse video").bind("ended", function() { question_CheckOut(); $("#zone_reponse video").delay( 1000 ).fadeOut(); } );
			$('#zone_reponse video source').attr('src', videoFile);

			$("#zone_reponse video").css("display","block");
			$("#zone_reponse").css("display","block");
			TweenLite.fromTo("#zone_reponse", 1, {opacity:"0"}, {  delay:2.5, opacity:"1",  onComplete:playvidAnswer } );
		}else{
//			console.log("timer 2 delay");
			timer2 = setTimeout(question_CheckOut,duree_reponse*1000);
		}
	}
}

function playvidAnswer(){

		$("#zone_reponse video")[0].load();
		TweenLite.fromTo("#zone_reponse video", 0.2, {opacity:"0"}, {  delay:0.2, opacity:"1" } );
}


function question_CheckOut(){

	$("#zone_reponse").delay( 1000 ).fadeOut(1000);
	clearTimeout(timer2);
//	console.log("// function question_CheckOut");
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


function traitement(evenement){

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
	reinit_timer_reset();
}

function show_multijoueurs_mode(){

	$(".score_j1 .intitule").html("Joueur 1");
	$(".score_j2 .intitule").html("Joueur 2");
	$(".score_j3 .intitule").html("Joueur 3");

	$(".score_j1").css("display","block");
	$(".score_j2").css("display","block");
	$(".score_j3").css("display","block");
}

function show_monojoueurs_mode(){

	$(".score_j1 .intitule").html("Score");
	$(".score_j2").css("display","none");
	$(".score_j3").css("display","none");
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

	show_monojoueurs_mode();
	updateScores();
}


function playVideo(id){

	show_ecran("ecran_video");
	// init some vars the switch will handle
	var videoFile = "";
	var toDoOnEnd = function(){};
	var loop = false;

	// configure the playback
	switch(id) {
		case "1.1":
			videoFile = currentLocation + "media/1.1Titre_entree.webm";
			toDoOnEnd = function() { playVideo("1.2"); };
			break;
		case "1.2":
			videoFile = currentLocation + "media/1.2Titre_boucle.webm";
			toDoOnEnd = function() {} ;
			loop = true;
			waitForStart = true; // detetction dans la fonction Touchdown() pour lecture de la vidéo suivante
			break;
		case "1.3":
			videoFile = currentLocation + "media/1.3Titre_sortie.webm";
			toDoOnEnd = function() { playVideo("2.1"); };
			break;
		case "2.1":
			videoFile = currentLocation + "media/2.1_principe_jeu.webm";
			toDoOnEnd = function() { playVideo("3.1"); };
			break;
		case "3.1":
			videoFile = currentLocation + "media/3.1_choix_quiz_entree.webm";
			toDoOnEnd = function() { playVideo("nextQuizzEntree"); };
			break;
		case "nextQuizzEntree":
			videoFile = currentLocation + "media/3.2_choix_quiz_sortie_" + Number(currentQuizz+1) + ".webm";
			toDoOnEnd = function() { playVideo("noVideo"); nextQuizz(); };
			break;
		case "noVideo":
			break;
	}

	console.log("playVideo function id = "+id);
	console.log("onEnd = "+toDoOnEnd);

	var currentVideo = document.getElementById("videoclip");
	// clone the current video, it will remove all previous event listeners
	var newVideo = currentVideo.cloneNode(true);
	// bind the ended listener
	newVideo.addEventListener("ended", toDoOnEnd);
	// trick to avoid flickering
	// set to display none and size of 1px so the flickering will happen on only 1px
	// thus invisible for the user
	newVideo.style.className = "antiflicker";
	newVideo.src = videoFile;
	newVideo.loop = loop;
	// when the new video is playing, reset size and display to its defaults
	newVideo.addEventListener("play", function() {
		newVideo.style.className = "";
		// and finally replace the video in the DOM
		document.getElementById("ecran_video").replaceChild(newVideo, currentVideo);
	});
}


// gestion du reset


function Touchdown(evenement){

	var caractere = String.fromCharCode(evenement.which);

	if(waitForStart==true){
		waitForStart = false;
		playVideo("1.3");

		switch(caractere) {
			case "1": 	currentQuizz = 0;
				break;
			case "2": 	currentQuizz = 1;
				break
			case "3": 	currentQuizz = 2;
				break;
			case "4": 	currentQuizz = 3;
				break;
			}

	}

	reinit_timer_reset();
}

function Quizz_sleeping(){

	alert("reset App'");
	initMain();
}

function reinit_timer_reset(){

	//console.log("reinit timer ");

	clearTimeout(timer_sleeping);
	timer_sleeping = setTimeout(Quizz_sleeping,duree_time_reset*1000);
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



// resize

window.addEventListener("resize", resize_window);

function resize_window(){


	var rapport_hauteurLargeur = ($(document).width()/$(document).height())-(main_width/main_height);
	if(rapport_hauteurLargeur<0){
		//console.log("ecran trop 4/3 -> calcul de la longueur");
		if($(document).width()<main_width){
			new_height = Math.round((main_height/main_width)*$(document).width());
			$(".main").css("height",new_height)
		}else{
			$(".main").css("height",main_height);
		}
	}else{
		//console.log("ecran trop 16/9 -> hauteur ecran / calcul de la longueur");
		new_height = $(document).height();
		$(".main").css("height",new_height);
		new_width = Math.round((main_width/main_height)*$(document).height());
		$(".main").css("width",new_width);
	}
}

function auto_resize(){

$(".auto_resize").each(function(){
		// if width is defined with PX
		console.log($(this).css("width").substring( $(this).css("width").length-2, $(this).css("width").length) );
		if(  $(this).css("width").substring( $(this).css("width").length-2, $(this).css("width").length) == "px" ){
			css_px = $(this).css("width").substring(  0 , $(this).css("width").length-2 );
			css_pc = Math.round(css_px*100/main_width*100)/100+"%";
			$(this).css("width",css_pc);
		}

		// if left is defined with PX
		if(  $(this).css("left").substring( $(this).css("left").length-2, $(this).css("left").length) == "px" ){
			console.log("modif left of"+ $(this).name)
			css_px = $(this).css("left").substring(  0 , $(this).css("left").length-2 );
			css_pc = Math.round(css_px*100/main_width*100)/100+"%";
			$(this).css("left",css_pc);
		}

		// if height is defined with PX
		if(  $(this).css("height").substring( $(this).css("height").length-2, $(this).css("height").length) == "px" ){
			css_px = $(this).css("height").substring(  0 , $(this).css("height").length-2 );
			css_pc = Math.round(css_px*100/main_height*100)/100+"%";
			$(this).css("height",css_pc);
		}
		// if top is defined with PX
		if(  $(this).css("top").substring( $(this).css("top").length-2, $(this).css("top").length) == "px" ){
			css_px = $(this).css("top").substring(  0 , $(this).css("top").length-2 );
			css_pc = Math.round(css_px*100/main_height*100)/100+"%";
			$(this).css("top",css_pc);
		}
		// if bottom is defined with PX
		if(  $(this).css("bottom").substring( $(this).css("bottom").length-2, $(this).css("bottom").length) == "px" ){
			css_px = $(this).css("bottom").substring(  0 , $(this).css("bottom").length-2 );
			css_pc = Math.round(css_px*100/main_height*100)/100+"%";
			$(this).css("bottom",css_pc);
		}
	});
}

resize_window();
initMain();
auto_resize();




