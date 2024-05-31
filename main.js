var access_id
var answer_id
var problems
var problem_id = 0
var is_corrected = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function show_problem(data) {
    document.querySelector(".ctrl > button").style.disabled = true
    document.querySelector("#question_number").innerHTML = "問題 " + String(data.question_id + 1)
    document.querySelector("#question_content").innerHTML = data.question
    document.querySelector("#selection_1").innerHTML = '<input type="checkbox"> ' + data.choice_1
    document.querySelector("#selection_2").innerHTML = '<input type="checkbox"> ' + data.choice_2
    document.querySelector("#selection_3").innerHTML = '<input type="checkbox"> ' + data.choice_3
    document.querySelector("#selection_4").innerHTML = '<input type="checkbox"> ' + data.choice_4
}
async function show_result(){
    document.querySelector(".question").remove()
    let answers_node = document.querySelector(".answers")
    document.querySelector(".result_screen").style.display = "block"
    
    for(let i= 0;i <= is_corrected.length;i++){
        await sleep(400)
        console.log(i)
        let node = document.createElement("h1")
        if(is_corrected[i]){
            node.style.color = "red"
            node.innerHTML = "第"+(i+1)+"問<br>◎"
        }else{
            node.style.color = "blue"
            node.innerHTML = "第"+(i+1)+"問<br>×"
        }
        answers_node.appendChild(node)   
    }

}

window.onload = async () => {
    document.querySelector("#start_button").onclick = async () => {
        document.querySelector(".welcome_screen").style.display = "none"
    }
    var base_url = "https://script.google.com/macros/s/AKfycbw59LIHrNa250YlkhykC3eFuy17rQFh9lP5xBhadjfolzjnO0pMbiT2w3td7xU9lsoR/exec"

    const response = await fetch(base_url)

    if (!response.ok) {
        // Network is not ok
        alert("問題サーバーに接続できません... あとでもう一度お試しください。")
        location.reload()
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
            "question_id": Number(problem_id),
            "answer_id": Number(answer_id),
            "access_id": Number(access_id)
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

        document.querySelector("#next-button").style.display = "block"
        
        if (res_json.is_correct) {
            document.querySelector("#maru").style.display = "block"
            document.querySelector("#answer-judge").innerHTML = "正解"
            document.querySelector("#correct-rate").innerHTML = "正答率: " + String(res_json.answer_rate * 100) + "%"
            is_corrected.push(true)
        } else {
            document.querySelector("#batu").style.display = "block"
            document.querySelector("#answer-judge").innerHTML = "不正解"
            document.querySelector("#correct-rate").innerHTML = "あなたと同じ回答をした割合: " + String(res_json.same_rate * 100) + "%"
            is_corrected.push(false)
        }


        document.querySelector("#mame_content").innerHTML = problems[problem_id].mame
    }

    document.querySelector("body > div.mame_back > div > div.ctrl > button").onclick = () => {
        problem_id += 1
        document.querySelector("#next-button").style.display = "none"
        document.querySelector("#answer-judge").innerHTML = "判定中..."
        document.querySelector("#correct-rate").innerHTML = "読み込み中"
        document.querySelector("#mame_content").innerHTML = "TIP: i-Filterは即ブロックしてくる場合とそうでない場合がある"
        if(problems.length > problem_id){
            show_problem(problems[problem_id])
        }else{
            show_result()
        }

        document.querySelector("#batu").style.display = "none"
        document.querySelector("#maru").style.display = "none"
        document.querySelector("body > div.mame_back").style.display = "none"
    }
}
