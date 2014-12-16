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
    });
}