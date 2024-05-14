var access_id
var answer_id
var problems
var problem_id = 0

function show_problem(data) {
    document.querySelector(".ctrl > button").style.disabled = true
    document.querySelector("#question_number").innerHTML = "問題 " + String(data.question_id + 1)
    document.querySelector("#question_content").innerHTML = data.question
    document.querySelector("#selection_1").innerHTML = '<input type="checkbox"> ' + data.choice_1
    document.querySelector("#selection_2").innerHTML = '<input type="checkbox"> ' + data.choice_2
    document.querySelector("#selection_3").innerHTML = '<input type="checkbox"> ' + data.choice_3
    document.querySelector("#selection_4").innerHTML = '<input type="checkbox"> ' + data.choice_4
}

window.onload = async () => {
    var base_url = "https://script.google.com/macros/s/AKfycbw59LIHrNa250YlkhykC3eFuy17rQFh9lP5xBhadjfolzjnO0pMbiT2w3td7xU9lsoR/exec"

    const response = await fetch(base_url)

    if (!response.ok) {
        // Network is not ok
        alert("問題サーバーに接続できません... あとでもう一度お試しください。")
    }

    const result = await response.text()
    const result_json = JSON.parse(result)

    //IF POSSIBLE: save access id and resume it

    access_id = result_json.access_id
    answer_id = null
    problems = result_json.problems

    show_problem(problems[problem_id])

    for (let element of document.querySelectorAll(".selection")) {
        element.onclick = function () {
            console.log("clicked!")
            for (let element of document.querySelectorAll("input[type='checkbox']")) {
                element.checked = false
            }
            element.querySelector("input").checked = true
            document.querySelector(".ctrl > button").style.disabled = false
            answer_id = Number(element.value)
        }
    }

    document.querySelector("body > div.question > div.ctrl > button").onclick = async () => {
        document.querySelector("body > div.mame_back").style.display = "flex"

        const params = {
            "question_id": problem_id,
            "answer_id": answer_id,
            "access_id": access_id
        }
        const query_params = new URLSearchParams(params)

        const response = await fetch(base_url, {
            body: query_params,
            method: "POST",
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        var res_txt = await response.text()
        var res_json = JSON.parse(res_txt)
        if (res_json.is_correct) {
            document.querySelector("#maru").style.display = "block"
            document.querySelector("#answer-judge").innerHTML = "正解"
            document.querySelector("#correct-rate").innerHTML = "正答率: " + String(res_json.answer_rate) + "%"
        } else {
            document.querySelector("#batu").style.display = "block"
            document.querySelector("#answer-judge").innerHTML = "不正解"
            document.querySelector("#correct-rate").innerHTML = "あなたと同じ回答をした割合: " + String(res_json.same_rate) + "%"
        }

        document.querySelector("#mame_content").innerHTML = problems[problem_id].mame
    }

    document.querySelector("body > div.mame_back > div > div.ctrl > button").onclick = () => {
        problem_id += 1
        show_problem(problems[problem_id])
        document.querySelector("#batu").style.display = "none"
        document.querySelector("#maru").style.display = "none"
        document.querySelector("body > div.mame_back").style.display = "none"
    }
}