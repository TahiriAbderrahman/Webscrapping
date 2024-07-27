Web Scraping and Text Analysis Project
This project involves scraping web content from various URLs, pre-processing the text data, creating an inverted index and incidence matrix, and performing both boolean and TF-IDF based queries. The project leverages web scraping tools, natural language processing (NLP) techniques, and machine learning for text analysis.

Requirements
Before running the script, make sure you have the following Python packages installed:

urllib
spacy
string
scikit-learn (sklearn)
numpy
BeautifulSoup (bs4)
You can install the required packages using the following command:

bash
Copier le code
pip install spacy scikit-learn numpy beautifulsoup4
Additionally, download the necessary spaCy model by running:

bash
Copier le code
python -m spacy download en_core_web_sm
Files
web_scraping_text_analysis.py: Main script to run the web scraping and text analysis.
document_1.txt to document_10.txt: Text files containing the scraped content from the URLs.
Usage
Running the Script
Save the script as web_scraping_text_analysis.py.

Open a terminal or command prompt and navigate to the directory containing the script.

Run the script using the following command:

bash
Copier le code
python web_scraping_text_analysis.py
Functions
preprocess(text): Tokenizes, lemmatizes, and removes stop words and punctuation from the text.
boolean_query(query): Processes boolean queries and returns relevant documents.
text_query(query): Processes TF-IDF based queries and returns relevant documents.
Steps
Scraping Web Content:

The script scrapes content from the specified URLs and saves the text into separate .txt files.
Pre-processing:

The text is tokenized, lemmatized, and stop words and punctuation are removed using spaCy.
Creating Incidence Matrix and Inverted Index:

An incidence matrix and an inverted index are created from the pre-processed tokens.
TF-IDF and Queries:

TF-IDF vectors are computed for the documents.
The script supports both boolean and TF-IDF based queries.
Queries
The script includes example boolean and text queries:

Boolean Queries
python
Copier le code
queries_bool = [
    "disease AND severe",
    "antibody AND plasma AND (cells OR receptors)",
    "antimalarial drugs OR antiviral agents OR immunomodulators",
    "NOT plasma AND risk of infection AND NOT restrictions",
    "(older adults AND antibodies) AND (genomes OR variant)"
]
Text Queries
python
Copier le code
queries_text = [
    "antibody treatments",
    "efficacy and safety of the treatments",
    "family access to hospitals",
    "contact tracing results",
    "genomic analysis of SARS-CoV-2 disease"
]
Output
The script prints the relevant documents for each query to the console.
Notes
Ensure the URLs provided in the urls list are accessible and the content can be scraped.
Modify the URLs as needed to scrape different content.
Adjust the pre-processing and query handling steps if necessary to suit specific requirements.
License
This project is licensed under the MIT License.

Acknowledgments
The spacy library for NLP tasks.
The sklearn library for machine learning tasks.
The BeautifulSoup library for web scraping.
The websites from which the content was scraped.
