import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

with open("dataset_gastos.json", "r", encoding="utf-8") as f:
    datos = json.load(f)

textos = [item["texto"].strip().lower() for item in datos]
categorias = [item["categoria"] for item in datos]

X_train, X_test, y_train, y_test = train_test_split(
    textos,
    categorias,
    test_size=0.2,
    random_state=42,
    stratify=categorias,
)

modelo = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("clf", LogisticRegression(max_iter=1000)),
])

modelo.fit(X_train, y_train)
precision = modelo.score(X_test, y_test)
print(f"Precisión en prueba: {precision * 100:.1f}%\n")

joblib.dump(modelo, "clasificador_gastos.joblib")

pruebas = ["pan", "helado", "funda", "funda de celular", "fundas de basura", "bus", "netflix"]
for p in pruebas:
    pred = modelo.predict([p.lower()])[0]
    prob = max(modelo.predict_proba([p.lower()])[0]) * 100
    print(f"'{p}' -> {pred} ({prob:.1f}%)")