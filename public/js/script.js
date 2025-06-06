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