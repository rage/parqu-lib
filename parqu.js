function initParquQuestion(element, id, studentNumber) {
    $.get("http://parqutoo.herokuapp.com/questions/" + id, function(data) {
        $(element).find("[data-parqu-code]").append(data.code);
        $(element).find("[data-parqu-question-text]").append(data.questionText);

        $.each(data.answers, function(index, answer) {
            var radio = $("<input></input>", {
                type: "radio",
                name: "answer" + id,
                value: answer
            });

            $(element).find("[data-parqu-options]").append(radio).append(" " + answer).append("<br>");
        });
        var submit = $("<input></input>", {
                type: "submit",
                value: "Check answer",
                id: "checkAnswer" + id
        });
        $(element).find("[data-parqu-options]").append(submit);

        $("#checkAnswer" + id).click(function(){
            checkAnswer(data.correctAnswer, id, data.answerID, studentNumber)});
    });
}

function checkAnswer(rightAnswer, id, answerID, studentNumber){
    var chosenElement = $('input[name=answer' + id +']:checked');
    var chosenValue = chosenElement.val();

    $.ajax({
          type: "POST",  
          url: "http://parqutoo.herokuapp.com/questions/",
          data: JSON.stringify({'studentNumber':studentNumber, 'answerID': answerID, 'answer':chosenValue, 'questionID':id}),
          contentType: 'application/json',
          success: function( data ) {
            if(data){
                chosenElement.addClass("correct");
            } else {
                chosenElement.addClass("wrong");
            }
          },
          error: function(jqXHR) {
            console.log("ERROR! DATA NOT SENT");
          }
    });
}