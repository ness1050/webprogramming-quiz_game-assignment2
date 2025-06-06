/* Author: Naseem Qurbanali*/

/* import {displayWarningSign, removeWarningSign, hideShow, hideRest, hideRule} from 'ui' */ 


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

