
/* Author nq222af */

/**
 * send get and post requests deppending on the params given.
 * @param {url} url - is the URL where to send the request to.
 * @param {object} opition if it is a post then the opition is the json to send including the headers and the data.
 * @returns {Promise<Request>} A Promise that resolves to the Response object.
 */
async function fetching (url, opition = null) {
  if (opition === null) {
    return await fetch(url)
  } else {
    return await fetch(url, opition)
  }
}
