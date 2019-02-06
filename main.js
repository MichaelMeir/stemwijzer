
var btn_start = document.getElementById("start");

var intro = document.getElementById("intro");
var question_panel = document.getElementById("question-panel");
var result_panel = document.getElementById("result-panel");
var results = document.getElementById("results");

var title = document.getElementById("title");
var question = document.getElementById("question");


var pro = document.getElementById("btn_pro");
var amb = document.getElementById("btn_amb");
var con = document.getElementById("btn_con");

var btn_parties = document.getElementById("parties");

var btn_skip = document.getElementById("btn_skip");
var btn_back = document.getElementById("btn_back");

var extra_weight = document.getElementById("extra_weight");

var show_parties = 0

window.onload = () => {
	document.getElementById("intro_text").innerHTML = "Test uw politieke voorkeur aan de hand van " + subjects.length + " stellingen"
	btn_start.onclick = start;

	btn_pro.onclick = () => { next(1) };
	btn_amb.onclick = () => { next(0) };
	btn_con.onclick = () => { next(-1) };

	btn_back.onclick = back;
	btn_skip.onclick = skip;

	btn_parties.onclick = () => {
		show_parties++
		if(show_parties > 5) {
			show_parties = 0
		}

		let text = ""
		switch(show_parties) {
			case 0: text = "Alle partijen"; break;
			case 1: text = "Alleen seculaire partijen"; break;
			case 2: text = "Alleen grote partijen"; break;
			case 3: text = "Alleen kleine partijen"; break;
			case 4: text = "Alleen Grote en seculaire partijen"; break;
			case 5: text = "Alleen Kleine en seculaire partijen"; break;
		}
		btn_parties.innerHTML = text;
	}
}

let map = null;

let curr_question = null;

function start() {
	hide(intro)
	map = new Mapping()
	curr_question = NewQuestion(map)
	if(curr_question == null) {
		title.innerHTML = "No unanswered questions could be found!"
	}
	reveal(question_panel)
}

function next(answer) {
	if(map == null || curr_question == null) return;
	curr_question.extra_weight = extra_weight.checked
	map.AddAnswer(curr_question, answer)
	curr_question = NewQuestion(map)
	if(curr_question == null) {
		OutputResult()
	}else{
		if(curr_question.extra_weight == undefined || curr_question.extra_weight == false) {
			extra_weight.checked = false;
		}else{
			extra_weight.checked = true;
		}
	}
}

function back() {
	curr_index -= 2;
	NewQuestion(map)
}

function skip() {
	curr_question = NewQuestion(map)
	if(curr_question == null) {
		OutputResult()
	}
}

function hide(element) {
	element.className += " w3-hide";
}

function reveal(element) {
	element.className = element.className.replace(" w3-hide", "");
}

let curr_index = -1

function NewQuestion(map) {
	curr_index++
	if(curr_index >= 1) {
		reveal(btn_back)
	}else{
		hide(btn_back)
	}
	if(subjects[curr_index] == null) return null;
	title.innerHTML = subjects[curr_index].title;
	question.innerHTML = subjects[curr_index].statement;
	return subjects[curr_index]
}


function OutputResult() {
	hide(question_panel)
	reveal(result_panel)
	map.RevealStats(map.Output(), results);
}


function Mapping() {
	this.questions = []

	this.HasAnswered = (question) => {
		for (var i = this.questions.length - 1; i >= 0; i--) {
			if(this.questions[i].statement == question.statement) {
				return true
			}
		}
		return false
	}

	this.RemoveAnswer = (question) => {
		for (var i = this.questions.length - 1; i >= 0; i--) {
			if(this.questions[i].statement == question.statement) {
				this.questions.splice(i, 1)
			}
		}
	}

	this.AddAnswer = (question, answer) => {
		if(this.HasAnswered(question)) {
			this.RemoveAnswer(question)
		}
		question.answer = answer;
		this.questions.push(question);
	}

	this.Output = () => {
		var parties = []
		for (var i = this.questions.length - 1; i >= 0; i--) {
			let q = this.questions[i]
			for (var j = q.parties.length - 1; j >= 0; j--) {
				let exists = false
				for (var k = parties.length - 1; k >= 0; k--) {
					if(q.parties[j].name == parties[k].name) {
						parties[k].points += q.extra_weight ? this.CalcPoint(q.parties[j].position, q.answer) *2 : this.CalcPoint(q.parties[j].position, q.answer)
						exists = true
					}
				}
				if(!exists) {
					q.parties[j].points = q.extra_weight ? this.CalcPoint(q.parties[j].position, q.answer) *2 : this.CalcPoint(q.parties[j].position, q.answer)
					parties.push(q.parties[j])
				}
			}
		}
		return parties;
	}

	this.CalcPoint = (expected, given) => {
		let conv = 0
		if(expected == "pro") {
			conv = 1
		}else if(expected == "contra") {
			conv = -1
		}

		if(given == conv) {
			return 1
		}else if(given == 0) {
			return given
		}
		return -1
	}

	this.RevealStats = (output, element) => {
		element.innerHTML = ""
		output.sort(function(a, b) {return a.points - b.points})
		var weight_count = 0;
		for (var i = this.questions.length - 1; i >= 0; i--) {
			weight_count++
			if(this.questions[i].extra_weight) weight_count++
		}
		let stat = (per, txt, max) => { 
			return per >= 0 ? 
				"<div class=\"w3-animate-right w3-light-grey\"><div class=\"w3-container w3-green w3-center w3-text-black\" style=\"width: " + Math.floor((per*100)/max) + "%\">" + txt + ": " + Math.floor((per*100)/max) + "%</div></div>"
		 	  : "<div class=\"w3-animate-right w3-light-grey\"><div class=\"w3-container w3-red w3-center w3-text-black\" style=\"width: " + Math.floor((-per*100)/max) + "%\">" + txt + ": -" + Math.floor((-per*100)/max) + "%</div></div>" 
		 	}
		for (var i = output.length - 1; i >= 0; i--) {
			for (var j = parties.length - 1; j >= 0; j--) {
				if(parties[j].name == output[i].name && 
					((show_parties == 1 && parties[j].secular == true) || 
						(show_parties == 2 && parties[j].size > 5) || 
						show_parties == 0) ||
					(show_parties == 3 && parties[j].size <= 5) ||
					(show_parties == 4 && parties[j].size > 5 && parties[j].secular) ||
					(show_parties == 5 && parties[j].size <= 5 && parties[j].secular)) {
					element.innerHTML += stat(output[i].points, output[i].name, weight_count)
				}
			}
		}
	}
}




