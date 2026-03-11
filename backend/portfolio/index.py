import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
}

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def check_admin(headers):
    token = headers.get('X-Admin-Token', headers.get('x-admin-token', ''))
    return token == ADMIN_TOKEN and ADMIN_TOKEN != ''

def handler(event, context):
    """API для управления портфолио: получение, создание, обновление, удаление проектов"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}

    if method == 'GET':
        show_all = params.get('all', 'false') == 'true'
        if show_all and not check_admin(headers):
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
        return get_projects(params)

    if not check_admin(headers):
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}

    if method == 'POST':
        return create_project(event)
    elif method == 'PUT':
        return update_project(event)
    elif method == 'DELETE':
        return delete_project(params)

    return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

def get_projects(params):
    show_all = params.get('all', 'false') == 'true'
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if show_all:
                cur.execute("SELECT id, title, category, image, guests, date, is_visible, sort_order, created_at, updated_at FROM portfolio ORDER BY sort_order ASC")
            else:
                cur.execute("SELECT id, title, category, image, guests, date FROM portfolio WHERE is_visible = true ORDER BY sort_order ASC")
            rows = cur.fetchall()
            for row in rows:
                if 'created_at' in row and row['created_at']:
                    row['created_at'] = row['created_at'].isoformat()
                if 'updated_at' in row and row['updated_at']:
                    row['updated_at'] = row['updated_at'].isoformat()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(rows, ensure_ascii=False)}
    finally:
        conn.close()

def create_project(event):
    body = json.loads(event.get('body', '{}'))
    title = body.get('title', '').strip()
    category = body.get('category', '').strip()
    image = body.get('image', '').strip()
    guests = body.get('guests', 0)
    date = body.get('date', '').strip()

    if not title or not category:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'title and category are required'})}

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM portfolio")
            next_order = cur.fetchone()['next_order']
            cur.execute(
                "INSERT INTO portfolio (title, category, image, guests, date, sort_order) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, title, category, image, guests, date, is_visible, sort_order",
                (title, category, image, guests, date, next_order)
            )
            row = cur.fetchone()
            conn.commit()
        return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps(row, ensure_ascii=False)}
    finally:
        conn.close()

def update_project(event):
    body = json.loads(event.get('body', '{}'))
    pid = body.get('id')
    if not pid:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id is required'})}

    fields = []
    values = []
    for key in ['title', 'category', 'image', 'guests', 'date', 'is_visible', 'sort_order']:
        if key in body:
            fields.append(key + " = %s")
            values.append(body[key])

    if not fields:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'No fields to update'})}

    fields.append("updated_at = NOW()")
    values.append(pid)

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "UPDATE portfolio SET " + ", ".join(fields) + " WHERE id = %s RETURNING id, title, category, image, guests, date, is_visible, sort_order",
                values
            )
            row = cur.fetchone()
            conn.commit()
        if not row:
            return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(row, ensure_ascii=False)}
    finally:
        conn.close()

def delete_project(params):
    pid = params.get('id')
    if not pid:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id is required'})}

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM portfolio WHERE id = %s", (pid,))
            conn.commit()
            if cur.rowcount == 0:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}
    finally:
        conn.close()