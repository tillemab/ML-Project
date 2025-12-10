/**
 * Load the models from the JSON file and classifies the comments on the page
 */
fetch(chrome.runtime.getURL("models.json"))
    .then(response => response.json())
    .then(data => {
        console.log("Models retrieved from the JSON file.");
        load_models(data);

        // Initial spam detection on page load
        detect_spam();

        // Also run it whenever new comments are loaded
        const observer = new MutationObserver(detect_spam);
        observer.observe(document.body, {childList: true, subtree: true});
    })
    .catch(error => console.error("Could not load the models:", error));


/**
 * Detect spam comments on the page and highlight them
 */
function detect_spam() {

    // Retrieve all of the comments on the page
    const comments = document.querySelectorAll("#content-text");

    // Detect if each comment is spam and highlight it if so
    comments.forEach(comment => {

        const text = comment.textContent.trim();

        // Detect if the comment is spam
        let is_spam = predict_spam(text);

        // If the comment is spam, make the background red
        if (is_spam) comment.style.backgroundColor = "rgba(255, 0, 0, 0.5)";

    });
    
}