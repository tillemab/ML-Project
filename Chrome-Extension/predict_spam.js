let models = null;

/**
 * Stores the loaded model to the global variable
 * @param {Object} model_data 
 */
function load_models(model_data) {
    models = model_data;
    console.log("Models successfully loaded!")
}

/**
 * Predict if the given text is a spam comment or not
 * @param {string} text The text of the comment to classify
 * @returns {boolean} True if the comment is spam, false otherwise
 */
function predict_spam(text) {

    // Make sure the model is loaded, otherwise return false early
    if (models === null) {
        console.error("Models not loaded yet!");
        return false;
    }

    // =========================================================================
    // Preprocess the Input Text
    // =========================================================================

    // Split the text into words
    let words = text.toLowerCase().split(" ");

    // Create input data based on the word frequencies
    let data = [];
    for (let i = 0; i < models['words'].length; i++) {
        data.push(0);
        let current_word = models['words'][i];
        for (let j = 0; j < words.length; j++) {
            if (words[j] === current_word) {
                data[i] += 1;
            }
        }
    }

    // =========================================================================
    // Model 1. Naive Bayes
    // =========================================================================

    const nb_model = models['nb_model'];

    let nb_top_class = null;
    let nb_top_score = -1;

    const target_classes = Object.keys(nb_model);

    for (let c = 0; c < target_classes.length; c++) {
        let current_class = target_classes[c];
        let class_score = 1;

        for (let i = 0; i < data.length; i++) {
            let X = data[i];
            let mean = nb_model[current_class]['mean'][i];
            let variance = nb_model[current_class]['var'][i];

            // Calculate the Normal Distribution Probability
            let exponent = -1 * (X - mean) ** 2 / (2 * variance)
            let denominator = Math.sqrt(2 * Math.PI * variance)
            class_score *= Math.exp(exponent) / denominator
        }

        // Check if this is the top class so far
        if (class_score > nb_top_score) {
            nb_top_score = class_score;
            nb_top_class = current_class;
        }

    }

    // =========================================================================
    // Model 2. Logistic Regression
    // =========================================================================

    // Retrieve the betas from the loaded models
    const lr_model = models['lr_model'];

    let lr_score = lr_model[0];
    for (let i = 0; i < data.length; i++) {
        lr_score += data[i] * lr_model[i + 1];
    }

    // Apply the Sigmoid Function
    lr_score = 1 / (1 + Math.exp(-1 * (lr_score)));

    // =========================================================================
    // Calculate the Final Result and Classify the Text
    // =========================================================================

    // Retrieve the vote weights for both models
    const nb_weight = models['nb_weight'];
    const lr_weight = models['lr_weight'];

    // Vote to determine the final score
    const final_score = lr_score * lr_weight + nb_top_class * nb_weight;

    return Math.round(final_score) === 1;

}