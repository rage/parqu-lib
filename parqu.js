function initParqu(elements, studentNumber, callback) {
    if (elements === undefined || elements.length === 0) {
        return;
    }

    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        buildQuestionHTMLFramework(element, element.data('id'), studentNumber, element.data('name'), callback);
    }
}

function buildQuestionHTMLFramework (element, id, studentNumber, exerciseName, callback){
    if($(element)[0] == undefined){
        return;
    }

    var idElement = '#parqu-panel' + id;

    var panelGroup = $('<div/>', {
        class: 'panel-group',
        id: 'parqu-panel' + id
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
        id: 'parqu-panel' + id + '-2'
    });

    var collapseLink = $('<a/>', {
        class: 'collapsed panel-title',
        href: idElement + '-2',
        'data-toggle': 'collapse',
        'data-parent': idElement
    });

    var exerciseNameElement = $('<h4/>', {
        class: 'tehtava',
        text: 'Koodinluku: ' + exerciseName
    });

    var parquQuestionElement = $('<div/>', {
        id: 'parquQuestion' + id,
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

    $(element).append(panelGroup);
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

    collapseLink.click(function(){
        collapseLink.unbind();
        initParquQuestion(parquQuestionElement, id, studentNumber, callback);
    });
}

function initParquQuestion(element, id, studentNumber, callback) {
    $('.parqu-question-text', element).append('Ladataan tehtävää...');
    $.get('https://parqu.herokuapp.com/questions/' + id, {studentID: studentNumber}).done( function(data) {
        $('.parqu-code', element).append(data.code);
        $('.parqu-question-text', element).empty();
        $('.parqu-question-text', element).append(data.questionText);

        $.each(data.answers, function(index, answer) {
            var radio = $('<input/>', {
                type: 'radio',
                name: 'answer',
                value: answer
            });

            var el = $('<label/>').append(radio).append(' ' + answer);

            $('.parqu-options', element).append(el).append('<br>');
        });
        var submit = $('<input/>', {
                type: 'submit',
                value: 'Tarkista vastaus',
                class: 'checkAnswer'
        });

        var parquQuestionReroll = $('<button/>', {
            class: 'parqu-reroll'
        });

        $('.parqu-options', element)
            .prepend(parquQuestionReroll)
            .append(submit)
            .submit(function(e) {
                checkAnswer(id, data.answerID, studentNumber, element);
                return false;
            });

        $('.parqu-reroll', element)
            .text('Uusi tehtävä')
            .click(function(){
                $('.parqu-reroll', element).empty();
                $('.parqu-reroll', element).unbind();
                $('.parqu-options', element).empty();
                $('.parqu-code', element).empty();
                $('.parqu-question-text', element).empty();
                initParquQuestion(element, id, studentNumber, callback)
            });
        typeof callback === 'function' && callback();
    });
}

function checkAnswer(id, answerID, studentNumber, element){
    var chosenElement = $('input[name=answer]:checked', element);
    $.ajax({
        type: 'POST',
        url: 'https://parqu.herokuapp.com/questions/',
        data: JSON.stringify({'studentID':studentNumber, 'answerID': answerID, 'answer':chosenElement.val(), 'questionID':id}),
        contentType: 'application/json',
        success: function(data) {
            if (data) {
                $('input[name=answer]',element).attr('disabled', true);
                $('.checkAnswer', element).attr('disabled', true);
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
