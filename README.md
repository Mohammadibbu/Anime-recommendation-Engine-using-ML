# Anime Recommendation Engine using Machine Learning
# Sakura Suggest

This project is an Anime Recommendation Engine built using machine learning techniques, specifically utilizing cosine similarity for recommendations. It provides personalized anime recommendations based on user preferences and past interactions.

## Features

- **Cosine Similarity**: Measures the similarity between users' preferences and anime features.
- **Firebase Integration**: Uses Firebase as the backend database to store user data and interactions.
- **Web Interface**: Interactive web interface for users to get recommendations.

## Installation

### Prerequisites

- Python 3.6 or higher
- Flask
- pandas
- scikit-learn
- numpy
- Firebase Admin SDK

### Steps

1. Navigate to the project directory:
    ```bash
    cd Anime-recommendation-Engine-using-ML
    ```
2. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
3. Set up Firebase:
    - Follow the instructions on the [Firebase Console](https://console.firebase.google.com/) to create a project and obtain the `serviceAccountKey.json` file.
    - Place the `serviceAccountKey.json` file in the project directory.

## Usage

1. Run the application:
    ```bash
    python app.py
    ```
2. Open your browser and go to `http://127.0.0.1:5000/` to access the web interface.

## Project Structure

- `app.py`: Main application script.
- `anime.csv`: Dataset containing information about various anime.
- `data.csv`: Dataset containing user interaction data.
- `serviceAccountKey.json`: Firebase service account key.
- `templates/`: HTML templates for the web interface.
- `static/`: Static files (CSS, JavaScript) for the web interface.

## Machine Requirements

- Python 3.6 or higher
- A modern code editor like Visual Studio Code
- Web browser (Chrome, Firefox, etc.)

live site: https://anime-recommendation-engine-using-ml-khmb.onrender.com/
