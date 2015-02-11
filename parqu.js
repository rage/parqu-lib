function ParquExercise(element, id, name) {
    this.element = element;
    this.id = id;
    this.name = name;
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

ParquExercise.prototype.setProgressbar = function(progressbar) {
    this.progressbar = progressbar;
}

function ParquProgressBar() {
    this.value = 0;
    this.progressBar = $("<div/>",{
        class: 'progress-bar',
        'aria-valuemin': 0,
        'aria-valuemax': 100
    });
    this.progress = $("<div/>", {
        class: 'progress',
        style: 'width: 100%'
    }).append(this.progressBar);
}

ParquProgressBar.prototype.setValue = function(value) {
    console.log(value);
    this.value = value;
    this.progressBar.css('width', value + '%');
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

    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        var exercise = new ParquExercise(element, element.data('id'), element.data('name'));
        exercise.setProgressbar(new ParquProgressBar());
        this.buildQuestionHTMLFramework(exercise);
    }
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


    $(exercise.element).append(panelGroup);
    panelGroup.append(panelDefault);
    panelDefault.append(collapseLink);
    collapseLink.append(panelHeading);
    panelHeading.append(exerciseNameElement);

    panelDefault.append(panelCollapse);
    panelCollapse.append(panelBody);

    panelBody.append(parquQuestionElement);

    parquQuestionOptions.append(parquQuestionReroll);

    parquQuestionElement.append(parquQuestionText)
                        .append(parquQuestionCode)
                        .append(parquQuestionOptions)
                        .append(exercise.progressbar.progress);

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
            exercise.addAnswer(answer, !!data);
            for (var i = 0; i < self.answerCallbacks.length; i++) {
                self.answerCallbacks[i](exercise, chosenElement, !!data);
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