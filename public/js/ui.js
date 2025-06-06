/* Author Naseem qurbanali */

const nameForm = document.getElementById('name-form');


function displayWarningSign() {
    const warningSign = document.createElement('span');
    warningSign.textContent = '⚠️ Please enter your name to start the quiz';
    warningSign.classList.add('warning-sign');
    nameForm.appendChild(warningSign);
}

