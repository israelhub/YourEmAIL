from flask import Flask, request, jsonify
from flask_cors import CORS

# Imports atualizados com nomes mais limpos
from services import gemini, gmail
from config.settings import CORS_ALLOWED_ORIGINS, DEBUG, PORT

app = Flask(__name__)
# Configura CORS conforme .env
if CORS_ALLOWED_ORIGINS == "*":
    CORS(app, resources={r"/api/*": {"origins": "*"}})
else:
    CORS(app, resources={r"/api/*": {"origins": CORS_ALLOWED_ORIGINS}})

@app.route('/api/classify', methods=['POST'])
def classify_email():
    data = request.get_json(force=True, silent=True) or {}
    email_content = data.get('email_content')
    subject = data.get('subject')
    guidelines = data.get('guidelines')
    if not email_content:
        return jsonify({'error': 'Missing email_content'}), 400

    try:
        cls = gemini.classify_email(email_content, subject, guidelines)
        result = gemini.generate_response(cls, email_content, subject)
        # garante que o campo classification exista no payload de retorno
        if 'classification' not in result:
            result = { **result, 'classification': cls }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails', methods=['GET'])
def get_emails():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid Authorization header'}), 401
    access_token = auth_header.split(' ')[1]

    try:
        max_results = int(request.args.get('maxResults', '20'))
        page_token = request.args.get('pageToken')
        data = gmail.get_emails(access_token, max_results, page_token)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails/<message_id>/label', methods=['POST'])
def add_label(message_id: str):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid Authorization header'}), 401
    access_token = auth_header.split(' ')[1]

    data = request.get_json(force=True, silent=True) or {}
    label = data.get('label')
    if not label:
        return jsonify({'error': 'Missing label'}), 400
    try:
        gmail.add_label(access_token, message_id, label)
        return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/classify-only', methods=['POST'])
def classify_only():
    """Classifica como 'Produtivo' ou 'Improdutivo' sem gerar resposta completa."""
    data = request.get_json(force=True, silent=True) or {}
    content = data.get('email_content')
    subject = data.get('subject')
    guidelines = data.get('guidelines')
    if not content:
        return jsonify({'error': 'Missing email_content'}), 400
    try:
        cls = gemini.classify_email(content, subject, guidelines)
        return jsonify({'classification': cls})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-reply', methods=['POST'])
def generate_reply():
    """Gera sugestão de resposta sob demanda para um e-mail já classificado."""
    data = request.get_json(force=True, silent=True) or {}
    classification = data.get('classification')
    content = data.get('email_content')
    subject = data.get('subject')
    if not classification or not content:
        return jsonify({'error': 'Missing classification or email_content'}), 400
    try:
        result = gemini.generate_response(classification, content, subject)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/classify-batch', methods=['POST'])
def classify_batch():
    """Classifica em lote uma lista de e-mails (somente Produtivo/Improdutivo),
    retornando um mapa {id: classification}. Não gera corpo de resposta.
    """
    data = request.get_json(force=True, silent=True) or {}
    emails = data.get('emails') or []  # cada item: {id, body, subject}
    guidelines = data.get('guidelines')
    if not isinstance(emails, list):
        return jsonify({'error': 'Invalid payload: emails must be a list'}), 400
    try:
        result = {}
        for item in emails:
            try:
                content = (item or {}).get('body') or (item or {}).get('content') or ''
                subject = (item or {}).get('subject')
                msg_id = (item or {}).get('id')
                if not msg_id or not content:
                    continue
                cls = gemini.classify_email(content, subject, guidelines)
                result[msg_id] = cls
            except Exception:
                # falha individual não derruba o lote
                continue
        return jsonify({'classifications': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=DEBUG, port=PORT)
