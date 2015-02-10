function ParquExercise(element, id, name) {
    this.element = element;
    this.id = id;
    this.name = name;
    this.correct = false;
    this.answers = [];
}

ParquExercise.prototype.addAnswer = function(answer, correct) {
    if (correct) {
        this.correct = true;
    }
    answers.push(answer);
}

ParquExercise.prototype.reset = function() {
    this.correct = false;
    this.answers = [];
}

function Parqu(url, studentNumber) {
    this.url = url;
    this.studentNumber = studentNumber;
    this.exerciseCallbacks = [];
}

Parqu.prototype.init = function(elements) {

    if (elements === undefined) {
        return;
    }

    for (var i = 0; i < elements.length; i++) {
        var domElement = $(elements[i]);
        var element = new ParquExercise(domElement, domElement.data('id'), domElement.data('name'));
        this.buildQuestionHTMLFramework(element);
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
    var parquQuestionOptions = $('<form/>', {
        class: 'parqu-options'
    });

    $(exercise.element).append(panelGroup);
    panelGroup.append(panelDefault);
    panelDefault.append(collapseLink);
    collapseLink.append(panelHeading);
    panelHeading.append(exerciseNameElement);

    panelDefault.append(panelCollapse);
    panelCollapse.append(panelBody);

    panelBody.append(parquQuestionElement);

    parquQuestionElement.append(parquQuestionText)
                        .append(parquQuestionCode)
                        .append(parquQuestionOptions);

    var self = this;
    collapseLink.click(function(){
        collapseLink.unbind();
        self.initQuestion(exercise);
    });
}

Parqu.prototype.initQuestion = function(exercise) {
    
    exercise.reset();

    var self = this;
    $('.parqu-question-text', exercise.element).append('Ladataan tehtävää...');
    $.get(this.url + '/questions/' + exercise.id, {studentID: this.studentNumber}).done( function(data) {
        $('.parqu-code', exercise.element).append(data.code);
        $('.parqu-question-text', exercise.element).empty();
        $('.parqu-question-text', exercise.element).append(data.questionText);

        $.each(data.answers, function(index, answer) {
            var radio = $('<input/>', {
                type: 'radio',
                name: 'answer',
                value: answer
            });

            var el = $('<label/>').append(radio).append(' ' + answer);

            $('.parqu-options', exercise.element).append(el).append('<br>');
        });
        var submit = $('<input/>', {
                type: 'submit',
                value: 'Tarkista vastaus',
                class: 'checkAnswer'
        });

        var parquQuestionReroll = $('<button/>', {
            class: 'parqu-reroll'
        });

        $('.parqu-options', exercise.element)
            .prepend(parquQuestionReroll)
            .append(submit)
            .submit(function(e) {
                self.checkAnswer(exercise, data.answerID);
                return false;
            });

        $('.parqu-reroll', exercise.element)
            .text('Uusi tehtävä')
            .click(function(){
                $('.parqu-reroll', exercise.element).empty();
                $('.parqu-reroll', exercise.element).unbind();
                $('.parqu-options', exercise.element).empty();
                $('.parqu-code', exercise.element).empty();
                $('.parqu-question-text', exercise.element).empty();
                self.initQuestion(exercise)
            });
        for (var i = 0; i < self.exerciseCallbacks.length; i++) {
            self.exerciseCallbacks[i]();
        }
        typeof callback === 'function' && callback();
    });
}

Parqu.prototype.checkAnswer = function(exercise, answerId){

    var chosenElement = $('input[name=answer]:checked', exercise.element);
    var answer = chosenElement.val();
    $.ajax({
        type: 'POST',
        url: this.url + '/questions/',
        data: JSON.stringify({'studentID':this.studentNumber, 'answerID': answerId, 'answer': answer, 'questionID':exercise.id}),
        contentType: 'application/json',
        success: function(data) {
            exercise.addAnswer(answer, !!data);
            if (data) {
                $('input[name=answer]', exercise.element).attr('disabled', true);
                $('.checkAnswer', exercise.element).attr('disabled', true);
                chosenElement.parent().addClass('correct');
            } else {
                chosenElement.parent().addClass('wrong');
                chosenElement.attr('disabled', true);
            }
        },
        error: function(jqXHR) {
            console.error(jqXHR);
        }
    });
}

Parqu.prototype.addExerciseCallback = function(callback) {

    this.exerciseCallbacks.push(callback);
}
