import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64
import html
import re

def _decode_base64_url(data: str) -> bytes:
    data = data.replace('-', '+').replace('_', '/')
    # Pad base64 if needed
    padding = 4 - (len(data) % 4)
    if padding and padding < 4:
        data += '=' * padding
    return base64.b64decode(data)


def _html_to_text(html_content: str) -> str:
    # Remove scripts/styles
    text = re.sub(r"<script[^>]*>[\s\S]*?</script>", " ", html_content, flags=re.IGNORECASE)
    text = re.sub(r"<style[^>]*>[\s\S]*?</style>", " ", text, flags=re.IGNORECASE)
    # Break lines on common block tags
    text = re.sub(r"<(br|p|div|li|tr|h[1-6])[^>]*>", "\n", text, flags=re.IGNORECASE)
    # Remove all tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Unescape entities
    text = html.unescape(text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_body_from_payload(payload: dict) -> str:
    # Prefer plain text
    def walk(parts):
        for part in parts:
            mime = part.get('mimeType')
            body = part.get('body', {})
            data = body.get('data')
            if mime == 'text/plain' and data:
                try:
                    return _decode_base64_url(data).decode('utf-8', errors='ignore')
                except Exception:
                    continue
            # dive recursively
            if part.get('parts'):
                inner = walk(part['parts'])
                if inner:
                    return inner
        # If plain not found, try first html
        for part in parts:
            mime = part.get('mimeType')
            data = part.get('body', {}).get('data')
            if mime == 'text/html' and data:
                try:
                    html_bytes = _decode_base64_url(data)
                    return _html_to_text(html_bytes.decode('utf-8', errors='ignore'))
                except Exception:
                    continue
        return ""

    if payload.get('parts'):
        text = walk(payload['parts'])
        if text:
            return text
    # Single part
    mime = payload.get('mimeType')
    data = payload.get('body', {}).get('data')
    if data:
        try:
            decoded = _decode_base64_url(data).decode('utf-8', errors='ignore')
            if mime == 'text/html':
                return _html_to_text(decoded)
            return decoded
        except Exception:
            return ""
    return ""


def get_emails(access_token: str, max_results: int = 20, page_token: str | None = None):
    """
    Busca emails do Gmail com suporte a paginação.
    Retorna um dicionário com campos: { 'emails': [...], 'nextPageToken': str | None }.
    """
    creds = Credentials(token=access_token)
    service = build('gmail', 'v1', credentials=creds)

    # Call the Gmail API com paginação
    list_kwargs = {
        'userId': 'me',
        'labelIds': ['INBOX'],
        'maxResults': max_results,
    }
    if page_token:
        list_kwargs['pageToken'] = page_token

    results = service.users().messages().list(**list_kwargs).execute()
    messages = results.get('messages', [])

    emails_data = []
    if messages:
        for message in messages:
            msg = service.users().messages().get(userId='me', id=message['id'], format='full').execute()
            payload = msg['payload']
            headers = payload['headers']
            subject = next((d['value'] for d in headers if d['name'] == 'Subject'), None)
            sender = next((d['value'] for d in headers if d['name'] == 'From'), None)
            date_header = next((d['value'] for d in headers if d['name'] == 'Date'), '')

            try:
                body = _extract_body_from_payload(payload) or msg.get('snippet', '')
            except Exception:
                body = msg.get('snippet', '')

            emails_data.append({
                'id': message['id'],
                'subject': subject,
                'sender': sender,
                'snippet': msg.get('snippet', ''),
                'body': body,
                'date': date_header,
                'isRead': 'UNREAD' not in (msg.get('labelIds') or []),
                'classification': None
            })

    return {
        'emails': emails_data,
        'nextPageToken': results.get('nextPageToken')
    }


def add_label(access_token: str, message_id: str, label_name: str) -> None:
    """Adiciona (criando se necessário) uma label a uma mensagem."""
    creds = Credentials(token=access_token)
    service = build('gmail', 'v1', credentials=creds)

    # Lista labels existentes
    labels_list = service.users().labels().list(userId='me').execute().get('labels', [])
    label_id = None
    for lbl in labels_list:
        if lbl.get('name') == label_name:
            label_id = lbl.get('id')
            break
    if not label_id:
        created = service.users().labels().create(userId='me', body={
            'name': label_name,
            'labelListVisibility': 'labelShow',
            'messageListVisibility': 'show'
        }).execute()
        label_id = created.get('id')

    # Aplica a label na mensagem
    service.users().messages().modify(userId='me', id=message_id, body={
        'addLabelIds': [label_id]
    }).execute()