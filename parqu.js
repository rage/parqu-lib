function buildQuestionHTMLFramework (element, id, studentNumber, exerciseName){
    if($(element)[0] == undefined){
        return;
    }

    var idElement = "#parqu-panel" + id;

    var panelGroup = $("<div></div>", {
        class: "panel-group",
        id: "parqu-panel" + id
    });

    var panelDefault = $("<div></div>", {
        class: "panel panel-default"
    });

    var panelHeading = $("<div></div>", {
        class: "panel-heading"
    });

    var panelBody = $("<div></div>", {
        class: "panel-body"
    });

    var panelCollapse = $("<div></div>", {
        class: "panel-collapse collapse",
        id: "parqu-panel" + id + "-2"
    });

    var collapseLink = $("<a></a>", {
        class: "panel-title",
        href: idElement + "-2"
    }).attr("data-toggle", "collapse").attr("data-parent", idElement);

    var exerciseNameElement = $("<h4/>", {
        class: "tehtava",
    }).text("Koodinluku: " + exerciseName);

    var parquQuestionElement = $("<div></div>", {
        id: "parquQuestion" + id,
        class: "parqu-question-div"
    });

    var parquQuestionText = $("<h3 data-parqu-question-text></h3>");
    var parquQuestionCode = $("<pre data-parqu-code></pre>", {
        class: "sh_java"
    });
    var parquQuestionOptions = $("<div data-parqu-options></div>");
    var parquQuestionReroll = $("<button parqu-reroll></button>");

    $(element).append(panelGroup);
    $(idElement).append(panelDefault);
    $(idElement + " .panel-default").append(collapseLink);
    $(idElement + " .panel-title").append(panelHeading);
    $(idElement + " .panel-heading").append(exerciseNameElement);

    $(idElement + " .panel-default").append(panelCollapse);
    $(idElement + " .panel-collapse").append(panelBody);

    $(idElement + " .panel-body").append(parquQuestionElement);

    $("#parquQuestion" + id).append(parquQuestionText);        
    $("#parquQuestion" + id).append(parquQuestionCode);
    $("#parquQuestion" + id).append(parquQuestionOptions);
    $("#parquQuestion" + id).append(parquQuestionReroll);

    $(element).find(idElement + " .panel-default" + " a").click(function(){
        initParquQuestion("#parquQuestion" + id, id, studentNumber)
        $(element).find(idElement + " .panel-default" + " a").unbind();
    });
}

function initParquQuestion(element, id, studentNumber) {
    $.get("http://parqutoo.herokuapp.com/questions/" + id, {studentID: studentNumber}).done( function(data) {
        $(element).find("[data-parqu-code]").append(data.code);
        $(element).find("[data-parqu-question-text]").append(data.questionText);

        $.each(data.answers, function(index, answer) {
            var radio = $("<input></input>", {
                type: "radio",
                name: "answer" + id,
                value: answer
            });

            var el = $("<label></label>").append(radio).append(" " + answer);

            $(element).find("[data-parqu-options]").append(el).append("<br>");
        });
        var submit = $("<input></input>", {
                type: "submit",
                value: "Tarkista vastaus",
                id: "checkAnswer" + id
        });
        $(element).find("[data-parqu-options]").append(submit);

        $("#checkAnswer" + id).click(function(){
            checkAnswer(data.correctAnswer, id, data.answerID, studentNumber)});

        $(element).find("[parqu-reroll]").append("Uusi tehtävä");
        $(element).find("[parqu-reroll]").click(function(){
            $(element).find("[parqu-reroll]").empty();
            $(element).find("[parqu-reroll]").unbind();
            $(element).find("[data-parqu-options]").empty();
            $(element).find("[data-parqu-code]").empty();
            $(element).find("[data-parqu-question-text]").empty();
            initParquQuestion(element, id, studentNumber)});
    });
}

function checkAnswer(rightAnswer, id, answerID, studentNumber){
    var chosenElement = $('input[name=answer' + id +']:checked');
    var chosenValue = chosenElement.val();

    $.ajax({
          type: "POST",
          url: "http://parqutoo.herokuapp.com/questions/",
          data: JSON.stringify({'studentID':studentNumber, 'answerID': answerID, 'answer':chosenValue, 'questionID':id}),
          contentType: 'application/json',
          success: function( data ) {
            if(data){
                chosenElement.parent().addClass("correct");
            } else {
                chosenElement.parent().addClass("wrong");
            }
          },
          error: function(jqXHR) {
            console.log("ERROR! DATA NOT SENT");
          }
    });
}
