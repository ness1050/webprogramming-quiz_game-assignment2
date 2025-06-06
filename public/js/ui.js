/* Author Naseem qurbanali */

const nameForm = document.getElementById('name-form');


/**
 * Display's warningSign when the user trie to start the Quiz without providing any name!
 */
function displayWarningSign() {
    const warningSign = document.createElement('span');
    warningSign.textContent = '⚠️ Please enter your name to start the quiz';
    warningSign.classList.add('warning-sign');
    nameForm.appendChild(warningSign);
}


/**
 * Removes existing warning displayed,
 */
function removeWarningSign() {
    const existingWarningSign = document.querySelector('.warning-sign');
    if (existingWarningSign) {
        existingWarningSign.remove();
    }
}

/**
 * Rule being displayed for 6 Seconds
 */
function hideRule() {
    const rulDiv = document.getElementById('rule');
    setTimeout(function() {
        hideShow('hide', rulDiv)
    }, 6000)
}

/**
 * hide or shows the element in the page based on the action button.
 * @param {action} action is to hide or show an element
 * @param {element} element element is to apply the style on 
 */
function hideShow(action, element) {
    (action === 'hide') ? element.style.display = 'none' : element.style.display = 'block'
}