from flask import Flask, render_template, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

app = Flask(__name__)

def load_anime_data(file_path):
    df = pd.read_csv(file_path)
    df['title'] = df['title'].str.lower()  # Normalize the title to lowercase
    return df

def get_cosine_similarity(df, title):
    count_vectorizer = CountVectorizer()
    count_matrix = count_vectorizer.fit_transform(df['genre'])
    cosine_sim = cosine_similarity(count_matrix, count_matrix)
    
    anime_indices = pd.Series(df.index, index=df['title']).drop_duplicates()
    
    # Normalize the title to lowercase for matching
    title = title.lower().strip()
    
    if title not in anime_indices:
        matches = process.extract(title, df['title'].tolist(), limit=1)
        if matches and matches[0][1] >= 80:  
            similar_name = matches[0][0]
            suggestion = f"Did you mean {similar_name}?"
            return suggestion
        else:
            return "Title not found."
    
    idx = anime_indices[title]
    
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:6]  # Get top 5 anime

    anime_indices = [i[0] for i in sim_scores]
    return df.iloc[anime_indices]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    title = request.form['title']
    anime_data = load_anime_data('data.csv')
    recommendations = get_cosine_similarity(anime_data, title)
    
    if isinstance(recommendations, str):
        return jsonify({'message': recommendations})
    
    return jsonify(recommendations.to_dict(orient='records'))

@app.route('/feedback')
def feed():
    return render_template('feedback.html')

if __name__ == '__main__':
    app.run(debug=True)
