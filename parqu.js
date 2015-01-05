function initParquQuestion(element, url) {
    $.get(url, function(data) {
        $(element).find("[data-parqu-code]").append(data.code);
        $(element).find("[data-parqu-question-text]").append(data.questionText);

        $.each(data.answers, function(index, answer) {
            var radio = $("<input></input>", {
                type: "radio",
                name: "answer",
                value: answer
            });

            $(element).find("[data-parqu-options]").append(radio).append(" " + answer).append("<br>");
        });
        var submit = $("<input></input>", {
                type: "submit",
                value: "Check answer",
                id: "checkAnswer"
        });
        $(element).find("[data-parqu-options]").append(submit);

        $("#checkAnswer").click(function(){
            checkAnswer(data.correctAnswer)});
    });
}

function checkAnswer(rightAnswer){
    var chosenValue = ($('input[name=answer]:checked').val());
    if(chosenValue){
        console.log(chosenValue);
        if(chosenValue == rightAnswer){
            $('input[name=answer]:checked').addClass("correct");
        } else {
            $('input[name=answer]:checked').addClass("wrong");
        }
    }
}