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
let btn = []
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