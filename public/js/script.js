/* Author nq222af */
import { displayWarningSign, removeWarningSign, hideShow, hideRest, hideRule } from './ui.js'
import { fetching } from './api.js'

const startUrl = 'https://courselab.lnu.se/quiz/question/1' // default url.

// DOM with its elements and decleration of some constants.
const nameForm = document.getElementById('name-form')
const startBtn = document.getElementById('start')
const answerBtn = document.getElementById('submit')
const question = document.getElementById('question')
const answerField = document.getElementById('answer')
const radioBtnDiv = document.getElementById('radio-buttons')
const progressBar = document.getElementById('progress-bar')

let NAME = ''
let userTime
let questionType = 0
let btns = []
let nexturl = ''
let timer
let progressTimer // progress timer for the questions.
let highScoreList = [] // to store highscore.

const questionContainer = document.getElementById('question-container')
hideShow('hide', questionContainer) // hides the questions from user.
const result = document.getElementById('result')
const resultDiv = document.getElementById('result-div')
hideShow('hide', resultDiv) // should not show result.
const timeH2 = document.getElementById('time') // the element where to show the thime in the page
const restartBtn = document.getElementById('restart')

hideRest()

hideRule()

/**
 * gets the name of the user before starting the quiz.
 * @param {name} name is the element where to get the name from.
 */
function getname (name) {
  NAME = name.value
  name.value = ''
  hideShow('hide', nameForm)
  hideShow('show', questionContainer)
}

/**
 * start the timer for the questions.
 */
function startTimer () {
  clearInterval(progressTimer) // clears the existing timmer.
  const time = 10 // timmer set to 10 seconds.
  setInterval(progressBarTimer(time), 10000)
}

/**
 * reset the progressBar to 100% with removing the transition
 */
function resetProgressBar () {
  progressBar.style.transition = 'none'
  progressBar.style.width = '100%'
  progressBar.style.backgroundColor = 'green'
}

/**
 * this timer is mainly used to update the progressBar.
 * @param {number} time is the seconde which will be displayed.
 */
function progressBarTimer (time) {
  progressBar.style.transition = 'all 1s linear'

  timeH2.innerHTML = 'time: ' + time + ' s'
  progressTimer = setInterval(() => {
    time -= 1
    if (time < 0) {
      gameOver("Time's up <br> Game Over")
    } else {
      if (time === 5) {
        progressBar.style.backgroundColor = 'orange'
      }
      if (time === 2) {
        progressBar.style.backgroundColor = 'red'
      }
      progressBar.style.width = `${(time / 10) * 100}%`
      timeH2.innerHTML = 'time: ' + time + ' s'
    }
  }, 1000)
}

startBtn.addEventListener('click', e => {
  e.preventDefault()

  removeWarningSign()

  const name = document.getElementById('name')
  if (name.value === '') {
    displayWarningSign()
  } else {
    startQuiz(name)
  }
})

/**
 * Starts the quiz when the user has entered a name.
 * @param {name} name is tbe element where to get the name.
 */
async function startQuiz (name) {
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

/**
 * creates the question froms the response of the server.
 * @param {object} response is the response containing the question.
 */
function createQuestion (response) {
  clearInterval(timer)
  const questionElement = document.getElementById('question')
  question.innerHTML = response.question

  if ('alternatives' in response) {
    questionType = 1
    hideShow('hide', answerField)
    hideShow('show', radioBtnDiv)

    btns = []
    createRadioBtns(response.alternatives)

    questionElement.parentElement.tabIndex = 3

    btns.forEach((radioBtn, index) => {
      radioBtn.tabIndex = 3 + index
    })

    if (btns.length > 0) {
      btns[0].focus()
    }
  } else {
    questionType = 0
    hideShow('show', answerField)
    hideShow('hide', radioBtnDiv)

    answerField.tabIndex = 4
    questionElement.parentElement.tabIndex = 3
    answerField.focus()
  }

  if ('nextURL' in response) {
    nexturl = response.nextURL
  }
  timer = startTimer()
}

answerBtn.addEventListener('click', e => {
  e.preventDefault()

  if (questionType === 0 && answerField.value === '') {
    gameOver('You Did not answer the question!')
  } else {
    const checkedBtn = getCheckedBtn()

    const opt = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        { answer: (questionType === 0) ? answerField.value : checkedBtn }
      )
    }

    radioBtnDiv.replaceChildren()
    answerField.value = ''

    sendResponse(nexturl, opt)
  }
})

/**
 * function that creates and sends the response to the server.
 * it also handle the response of the response.
 * @param {url} url is the URL where to sen the.
 * @param {object} opt is the json to be sended.
 */
async function sendResponse (url, opt) {
  const resOnRes = await fetching(url, opt)
  const resOnResData = await resOnRes.json()

  resetProgressBar()

  if (resOnRes.status === 200) {
    if ('nextURL' in resOnResData) {
      const nextQuestion = await fetch(resOnResData.nextURL)

      createQuestion(await nextQuestion.json())
    } else {
      userTime = ((Date.now() - userTime) / 1000)
      highScoreList.push({ name: NAME, time: userTime })

      gameOver('Wow!, a very fast win!<br>' + '<br>time: ' + userTime + ' s')
    }
  } else if (resOnRes.status === 400) {
    gameOver(resOnResData.message + '<br> Game Over')
  }
}

/**
 *
 * This function will create labels that will contain
 * the answer alternatives and will add a click listner to them.
 * it works as a custom radio btns.
 * @param {object} alternatives is the alternatives to answer the question.
 */
function createRadioBtns (alternatives) {
  for (const alt in alternatives) {
    const label = document.createElement('label')
    const radioBtn = document.createElement('input')

    label.classList.add('label')
    label.innerText = alternatives[alt] // is the value to be shown in the page
    label.name = alt // is the value of the custom btn
    label.id = '0' // will be the 1 if the button is checked and 0 if not

    radioBtn.type = 'radio'
    radioBtn.name = 'radio-group'
    label.appendChild(radioBtn)
    radioBtnDiv.appendChild(label)
    btns.push(label)

    // when any btn is clicked the value of it should change to 1
    // and some styling changes to show that the btn was ckĺicked
    label.addEventListener('click', () => {
      handleRadioBtn(label)
      for (let l = 0; l < btns.length; l++) {
        btns[l].id = '0'
        btns[l].style.borderColor = 'black'
        btns[l].style.backgroundColor = 'rgba(0, 60, 255, 0.349)'
        btns[l].style.border = '1px solid'
      }
      answerField.style.borderColor = 'black'
      answerField.style.backgroundColor = 'white'
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

/**
 * Toggle the selection for the clicked radio button.
 * Update visual indicators and enable/disable the submit button based on the selection.
 * @param {HTMLElement} label - The label element associated with the radio button.
 */
function handleRadioBtn (label) {
  // Toggle the selection for the clicked button
  label.id = label.id === '1' ? '0' : '1'

  // Add visual indicators based on the selected state
  label.style.borderColor = label.id === '1' ? 'green' : 'red'
  label.style.backgroundColor = label.id === '1' ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 60, 255, 0.349)'
  label.style.border = label.id === '1' ? '2px solid' : '1px solid'

  // Enable/disable the submit button based on the question type
  // Use the boolean result directly instead of a ternary expression
  // answerBtn.disabled = label.id === '1' ? false : true
  answerBtn.disabled = !(label.id === '1')
}

/**
 * returns the button checked from the radio buttons.
 * @returns {string} the alternative chisen.
 */
function getCheckedBtn () {
  for (let i = 0; i < btns.length; i++) {
    if (btns[i].id === '1') {
      return btns[i].name
    }
  }
  return ''
}

/**
 * the function that is called when the user wins or loses.
 * @param {string} message is the message to be shown when gane is over.
 */
function gameOver (message) {
  clearInterval(timer)
  clearInterval(progressTimer)

  result.innerHTML = message
  hideShow('show', resultDiv)
  hideShow('hide', timeH2)
  hideShow('hide', questionContainer)
  displayResults()
}

document.getElementById('Highscore-btn').addEventListener('click', function () {
  displayResults()
})

/**
 * displays the results as a table in the result div.
 */
function displayResults () {
  // look at list from localstorage and add the values to the list exsisting here.
  const savedScores = JSON.parse(localStorage.getItem('highScoreList'))
  if (savedScores != null) {
    savedScores.forEach(result => highScoreList.push(result))
  }

  // sort the list and get only the first 5 objects.
  highScoreList.sort((a, b) => a.time - b.time)
  highScoreList = highScoreList.slice(0, 5)
  localStorage.setItem('highScoreList', JSON.stringify(highScoreList))

  // create a table element
  const table = document.getElementById('score-table')
  table.replaceChildren()

  // create a table header with the column names
  const thead = document.createElement('thead')
  const tr = document.createElement('tr')
  tr.innerHTML = '<th>name</th><th>Time</th>'
  thead.appendChild(tr)
  table.appendChild(thead)

  // create a table body and add a row for each score in the highScoreList
  const tbody = document.createElement('tbody')
  highScoreList.forEach(result => {
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${result.name}</td><td>${result.time}</td>`
    tbody.appendChild(tr)
  })
  table.appendChild(tbody)

  // add the table to the result div
  resultDiv.appendChild(table)
  hideShow('show', resultDiv)
}

/**
 * Clear score before new page.
 */
function clearHighScore () {
  localStorage.removeItem('highScoreList')
}

window.addEventListener('load', () => {
  clearHighScore()
})

/**
 * restarts the game.
 */
restartBtn.addEventListener('click', e => {
  e.preventDefault()

  highScoreList = []

  resetProgressBar()
  if (questionContainer.style.display === 'none') {
    hideShow('hide', resultDiv)
  }

  hideShow('show', nameForm)
  hideShow('show', timeH2)
})

/**
 * It checks what type of key is pressed.
 * @param {event} event handles which event is choicen.
 */
function handleKeyDown (event) {
  switch (event.key) {
    case 'Enter':
      handleEnterKey()
      break
    case 'ArrowUp':
      event.preventDefault()
      handleArrowUpKey()
      break
    case 'ArrowDown':
      event.preventDefault()
      handleArrowDownKey()
      break
  }
}

// Event listener for keydown
document.addEventListener('keydown', handleKeyDown)

/**
 * Handle the 'Enter' key press event.
 * If the active element is the start button, initiate the quiz.
 * If the active element is a radio button label.
 * click on the radio button and focus on it.
 */
function handleEnterKey () {
  const activeElement = document.activeElement

  if (activeElement.id === 'start') {
    startQuiz()
  } else if (activeElement.classList.contains('label')) {
    handleRadioBtn(activeElement)
    activeElement.querySelector('input[type="radio"]').focus()
    const radioBtn = activeElement.querySelector('input[type="radio"]')
    radioBtn.focus()
  }
}

/**
 * Handles when keyboard  Arrowup key is used to navigate through page.
 */
function handleArrowUpKey () {
  const currentElement = document.activeElement
  const allFocusableElements = document.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])')
  const currentIndex = Array.from(allFocusableElements).indexOf(currentElement)

  const previousIndex = (currentIndex - 1 + allFocusableElements.length) % allFocusableElements.length
  const previousElement = allFocusableElements[previousIndex]

  previousElement.focus()
}

/**
 * Handles the keyboard down key for
 */
function handleArrowDownKey () {
  const currentElement = document.activeElement
  const allFocusableElements = document.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])')
  const currentIndex = Array.from(allFocusableElements).indexOf(currentElement)

  const nextIndex = (currentIndex + 1) % allFocusableElements.length
  const nextElement = allFocusableElements[nextIndex]

  nextElement.focus()
}
