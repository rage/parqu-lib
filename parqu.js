String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function ParquExercise(element, id, name, visualizer) {
    this.element = element;
    this.id = id;
    this.name = name;
    this.visualizer = new visualizer(this);
    this.streak = 0;
    this.correct = false;
    this.answers = [];
}

ParquExercise.prototype.addAnswer = function(answer, correct) {
    if (correct) {
        this.correct = true;
        if (this.answers.length === 0) {
            this.streak++;
        }
    } else {
        this.streak = 0;
    }
    this.answers.push(answer);
}

ParquExercise.prototype.resetAnswers = function() {
    this.correct = false;
    this.answers = [];
}

ParquExercise.prototype.getVisualizer = function() {
    return this.visualizer;
}

function ProgressBar(exercise) {
    this.exercise = exercise;
    this.value = 0;
    this.answered = false;
}

ProgressBar.prototype.setElement = function(element) {
    this.element = element;

    this.progressBar = $("<div/>",{
        class: 'progress-bar',
        'aria-valuemin': 0,
        'aria-valuemax': 100
    });
    this.progress = $("<div/>", {
        class: 'progress',
        style: 'width: 100%'
    }).append(this.progressBar);

    this.element.append(this.progress);
}

ProgressBar.prototype.success = function() {
    if (this.answered) {
        return;
    }
    this.value = Math.min(100, this.value + 33.4);
    if (this.value == 100) {
        this.progressBar.addClass('progress-bar-success');
    }
    this._update();
}

ProgressBar.prototype.update = function() {
    if (!this.answered) {
        this.value = 0;
        this._update();
    }
    this.answered = false;
}

ProgressBar.prototype.fail = function() {
    this.value = 0;
    this._update();
}

ProgressBar.prototype._update = function() {
    this.answered = true;
    this.progressBar.css('width', this.value + '%');
}

function TextVisualizer(exercise) {
    this.exercise = exercise;
}

TextVisualizer.prototype.setElement = function(element) {
    this.element = element;
}

TextVisualizer.prototype.update = function() {
    this.element.html('');
}

TextVisualizer.prototype.success = function() {
    this.element.html($('<p/>', {html: '&#10003;', style: 'font-size:20px;'}));
}

TextVisualizer.prototype.fail = function() {
    this.element.html($('<p/>', {html: '&#10008;', style: 'font-size:20px;'}));
}
function CatPictureVisualizer(exercise) {

}

CatPictureVisualizer.prototype.setElement = function(element) {
    this.element = element;
}

CatPictureVisualizer.prototype.update = function() {
    this.element.html('');
}

CatPictureVisualizer.prototype.success = function() {
    var id = Math.round(Math.random() * 436 + 1)
    this.element.html($('<img/>', {src: "http://www.cs.helsinki.fi/group/java/lolcatz/" + id + ".png", style: "height: 200px;"}));
}

CatPictureVisualizer.prototype.fail = function() {
    this.element.html($('<img/>', {src: "http://www.cs.helsinki.fi/group/java/lolcatz/sad.png", style: "height: 200px;"}));
}

function Parqu(url, studentNumber) {
    this.url = url;
    this.studentNumber = studentNumber;
    this.exerciseCallbacks = [];
    this.answerCallbacks = [];
    this.answerCallbacks.push(this.markAnswer);
}

Parqu.prototype.init = function(elements) {
    if (elements === undefined) {
        return;
    }

    var group = this.getUserGroup();
    if (group) {
      this.setVisualizer(TextVisualizer);
    } else {
      this.setVisualizer(CatPictureVisualizer);
    }

    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var exercise = new ParquExercise(element, element.data('id'), element.data('name'), this.visualizer);
        this.buildQuestionHTMLFramework(exercise);
    }
}

Parqu.prototype.getUserGroup = function() {
    return Math.abs(this.studentNumber.hashCode() % 20) < 10;
}

Parqu.prototype.buildQuestionHTMLFramework = function(exercise){

    var parquId = 'parqu-' + exercise.id;

    var panelGroup = $('<div/>', {
        class: 'panel-group'
    });

    var panelDefault = $('<div/>', {
        class: 'panel panel-default'
    });

    var panelHeading = $('<div/>', {
        class: 'panel-heading'
    });

    var panelBody = $('<div/>', {
        class: 'panel-body'
    });

    var panelCollapse = $('<div/>', {
        class: 'panel-collapse collapse',
        id: parquId
    });

    var collapseLink = $('<a/>', {
        class: 'collapsed panel-title',
        href: '#' + parquId,
        'data-toggle': 'collapse',
        'data-parent': parquId
    });

    var exerciseNameElement = $('<h4/>', {
        class: 'tehtava',
        text: 'Koodinluku: ' + exercise.name
    });

    var parquQuestionElement = $('<div/>', {
        class: 'parqu-question-div'
    });

    var parquQuestionText = $('<h3/>', {
        class: 'parqu-question-text'
    });
    var parquQuestionCode = $('<pre/>', {
        class: 'sh_java parqu-code'
    });
    var parquQuestionOptions = $('<div/>', {
        class: 'parqu-options'
    });

    var parquQuestionReroll = $('<button/>', {
        class: 'parqu-reroll',
        text: 'Uusi tehtävä'
    }).click(function(){
        self.initQuestion(exercise)
    });

    var visualizationElement = $('<div/>', {
        class: 'visualization'
    })

    $(exercise.element).append(panelGroup);
    panelGroup.append(panelDefault);
    panelDefault.append(collapseLink);
    collapseLink.append(panelHeading);
    panelHeading.append(exerciseNameElement);

    panelDefault.append(panelCollapse);
    panelCollapse.append(panelBody);

    panelBody.append(parquQuestionElement);
    panelBody.append(visualizationElement);

    parquQuestionOptions.append(parquQuestionReroll);

    parquQuestionElement.append(parquQuestionText)
                        .append(parquQuestionCode)
                        .append(parquQuestionOptions);
    
    exercise.getVisualizer().setElement(visualizationElement);

    var self = this;
    collapseLink.click(function(){
        collapseLink.unbind();
        self.initQuestion(exercise);
    });
}

Parqu.prototype.initQuestion = function(exercise) {
    
    exercise.resetAnswers();

    $('.parqu-options form', exercise.element).empty();
    var answerForm = $('<form/>');
    $('.parqu-options', exercise.element).append(answerForm);

    var self = this;
    $('.parqu-question-text', exercise.element).text('Ladataan tehtävää...');
    $.get(this.url + '/questions/' + exercise.id, {studentID: this.studentNumber}).done( function(data) {
        
        $('.parqu-code', exercise.element).text(data.code);
        $('.parqu-question-text', exercise.element).text(data.questionText);

        $.each(data.answers, function(index, answer) {
            var radio = $('<input/>', {
                type: 'radio',
                name: 'answer',
                value: answer
            });

            var el = $('<label/>').append(radio).append(' ' + answer);

            answerForm.append(el).append('<br>');
        });
        var submit = $('<input/>', {
                type: 'submit',
                value: 'Tarkista vastaus',
                class: 'checkAnswer'
        });

        answerForm.append(submit)
            .submit(function(e) {
                self.checkAnswer(exercise, data.answerID);
                return false;
            });
        exercise.getVisualizer().update();
        for (var i = 0; i < self.exerciseCallbacks.length; i++) {
            self.exerciseCallbacks[i]();
        }
    });
}

Parqu.prototype.checkAnswer = function(exercise, answerId){

    var chosenElement = $('input[name=answer]:checked', exercise.element);
    var answer = chosenElement.val();

    var self = this;
    $.ajax({
        type: 'POST',
        url: this.url + '/questions/',
        data: JSON.stringify({'studentID':this.studentNumber, 'answerID': answerId, 'answer': answer, 'questionID':exercise.id}),
        contentType: 'application/json',
        success: function(data) {
            var correctAnswer = !!data;
            exercise.addAnswer(answer, correctAnswer);
            if (correctAnswer) {
                exercise.getVisualizer().success(exercise);
            } else {
                exercise.getVisualizer().fail(exercise);
            }
            for (var i = 0; i < self.answerCallbacks.length; i++) {
                self.answerCallbacks[i](exercise, chosenElement, correctAnswer);
            }
        },
        error: function(jqXHR) {
            console.error(jqXHR);
        }
    });
}

Parqu.prototype.markAnswer = function(exercise, answerElement, correct) {
    if (correct) {
        $('input[name=answer]', exercise.element).attr('disabled', true);
        $('.checkAnswer', exercise.element).attr('disabled', true);
        answerElement.parent().addClass('correct');
    } else {
        answerElement.parent().addClass('wrong');
        answerElement.attr('disabled', true);
    }
}

Parqu.prototype.addExerciseCallback = function(callback) {

    this.exerciseCallbacks.push(callback);
}

Parqu.prototype.addAnswerCallback = function(callback) {

    this.answerCallbacks.push(callback);
}

Parqu.prototype.setVisualizer = function(visualizer) {
    this.visualizer = visualizer;
}