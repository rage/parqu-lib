function initParquQuestion(element, id) {
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
            checkAnswer(data.correctAnswer, id)});
    });
}

function checkAnswer(rightAnswer, id){
    var chosenElement = $('input[name=answer' + id +']:checked');
    var chosenValue = chosenElement.val();
    if(chosenValue){
        if(chosenValue == rightAnswer){
            chosenElement.addClass("correct");
        } else {
            chosenElement.addClass("wrong");
        }
    }
}