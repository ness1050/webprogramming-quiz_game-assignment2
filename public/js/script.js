/* Author: Naseem Qurbanali*/

import {displayWarningSign, removeWarningSign, hideShow, hideRest, hideRule} from 'ui'
import { fetching } from './api'; 


const startUrl =  'https://courselab.lnu.se/quiz/question/1';

// DOM wiht its elements and decleration of some constants.

const nameForm = document.getElementById('name-form');
const startBtn = document.getElementById('start');
const ansBtn = document.getElementById('submit');
const question = document.getElementById('question');
const ansField = document.getElementById('answer');
const radioBtnDiv = document.getElementById('radio-buttons');
const progressbar = document.getElementById('progress-bar');

// Assuming 
let Name = "";
let userTime
let questionType = 0;
let btns = []
let nextUrl = ''
let timer
let progressTimer
let highScorList = []

const questionContainer = document.getElementById('question-container');
hideShow('hide', questionContainer); // hides the question container from user
const result = document.getElementById('result');
const resultDiv = document.getElementById('result-div');
hideShow('hide', resultDiv);
const timeH2 = document.getElementById('time');
const restartBtn = document.getElementById('restart');

hideRest();
hideRule();

/**
 * this functions gets the name before quiz
 * @param {name} takes name as parameter
 */
function getname(name) {
    Name = name.value;
    name.value = ''
    hideShow('hide', nameForm)
    hideShow('show', questionContainer)
}


/**
 * Starts the timer when questions are about to be answered!
 */
function startTimer() {
    clearInterval(progressTimer);
    const time = 10;
    setInterval(progressTimer(time), 10000);
}

/**
 * This resets the progress style and other.
 */
function resetProgressBar() {
    progressbar.style.transition = 'none';
    progressbar.style.width = '100%';
    progressbar.style.backgroundColor ='green';
}

function progressBarTimer(time) {
    progressbar.style.transition = 'all 1s linear';

    timeH2.innerHTML = 'time: ' + time + ' s'
    progressTimer = setInterval(() => {
        time -= 1;
        if(time < 0) {
            gameOver("TIme's up <br> Game Over!")
        } else {
            if (time === 5) {
                progressbar.style.backgroundColor = 'orange';
            }
            if (time  === 2) {
                progressbar.style.backgroundColor = 'red';
            }
            progressbar.style.width = `${(time / 10) * 100}%`;
            timeH2.innerHTML = 'time: ' + time + ' s';
        }
    })
}

startBtn.addEventListener('click', e => {
    e.preventDefault()
    removeWarningSign()

    const name = document.getElementById('name')
    if(name.value === '') {
        displayWarningSign()
    } else {
        startQuiz(name)
    }
})

/**
 * Starts the quiz when the user has entered a name
 * @param {name} name is tbe element where to get the name 
 */
async function startQuiz(name) {
    getname(name)
    hideShow('hide', resultDiv)
    const question = await fetching(startUrl)

    if (question.status === 200) {
        userTime = Date.now()
        createQuestion(await question.json())
        document.getElementById('question-container').focus()
    } else {
        alert('Some problem occured!')
        console.log('error occured')
    }
}

function createQuestion(response) {
    clearInterval(timer);
    const questionElement = document.getElementById('question')
    question.innerHTML = response.question;

    if('aleternative' in response) {
        questionType = 1;
        hideShow('hide', ansField)
        hideShow('show', radioBtnDiv)

        btns = []
        createRadioBtns(response.alternatives)
        questionElement.parentElement.tabIndex = 3
        btns.forEach((radioBtn, index) => {
            radioBtn.tabIndex = 3 + index;
        })

        if (btns.length > 0) {
            btns[0].focus()
        }
    } else {
        questionType = 0
        hideShow('show', ansField)
        hideShow('hide', radioBtnDiv)

        ansField.tabIndex = 4;
        questionElement.parentElement.tabIndex = 3
        ansField.focus()
    }

    if ('nextURL' in response) {
        nextUrl = response.nextUrl
    }

    timer = startTimer()
}


ansBtn.addEventListener('click', e =>  {
    e.preventDefault()

    if (questionType === 0 && ansField.value === '' ) {
        gameOver('You Did not answer the question')
    } else {
        const checkBtn = getCheckedBtn()

        const opt = {
            method : 'post',
            headers: {
                'Content-type' : 'application/json'
            }, 
            body : JSON.stringify (
                {anser: (questionType === 0) ? ansField.value : checkBtn}
            )
        }
        radioBtnDiv.replaceChildren()
        ansField.value = ''

        sendResponse(nextUrl, opt)
    }
})

/**
 * Fucntion that creat and send the response to the Server
 * handle response of response
 * @param {url} url is the URL where to send the anser 
 * @param {object} opt json file to be sended
 */
async function sendResponse (url, opt) {
    const resOnRes = await fetching(url, opt)
    const resOnResDate = await resOnRes.json()

    resetProgressBar()

    if (resOnRes.status === 200) {
        if ('nextURL' in resOnResDate) {
            const nextQuestion = await fetch(resOnResDate.nextUrl)

            createQuestion(await nextQuestion.json())
        } else {
            userTime = ((Date.now() - userTime)/ 1000)
            highScorList.push({name: Name, time: userTime})

            gameOver('Wow!, A very Fast win! <br> time: ' + userTime + ' s')
        }
    } else if (resOnRes.status === 400) {
        gameOver(resOnResDate.message + '<br> Game over!!')
    }
}


/**
 * This function will create labels
 * which contains the anser alternatives
 * added eventlistner to check which radio button has been choosen
 * @param {object} alternatives alternative anser for the questions 
 */
function createRadioBtns (alternatives) {

    for (const alt in alternatives) {
        const label = document.createElement('label')
        const radioBtn = document.createElement('input')

        label.classList.add('label')
        label.innerHTML = alternatives[alt]
        label.name = alt
        label.id = '0'

        radioBtn.type = 'radio'
        radioBtn.name = 'radio-group'

        label.appendChild(radioBtn)
        radioBtnDiv.appendChild(label)
        btns.push(label)

        label.addEventListener('click', () =>{
            handleRadioBtn(label) 
            for (let l = 0; l < btns.length; l++) {
                btns[l].id = '0'
                btns[l].style.borderColor = 'black'
                btns[l].style.backgroundColor = 'rgba(0, 60, 255, 0.349)'
                btns[l].style.border = '1px solid'
            }
            ansField.style.borderColor = 'black'
            ansField.style.backgroundColor = 'white'
            // Toggle the selection for the clicked button
            label.id = label.id === '1' ? '0' : '1'
            // styling based on the question type
            radioBtn.tabIndex = 5

        })
        if (btns.length > 0) {
            btns[0].focus()
        }
    }
}




