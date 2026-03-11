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
    """API для управления отзывами: получение, создание, обновление, удаление"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}

    if method == 'GET':
        show_all = params.get('all', 'false') == 'true'
        if show_all and not check_admin(headers):
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}
        return get_testimonials(params)
    
    if not check_admin(headers):
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Unauthorized'})}

    if method == 'POST':
        return create_testimonial(event)
    elif method == 'PUT':
        return update_testimonial(event)
    elif method == 'DELETE':
        return delete_testimonial(params)

    return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

def get_testimonials(params):
    show_all = params.get('all', 'false') == 'true'
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if show_all:
                cur.execute("SELECT id, name, position, quote, rating, is_visible, created_at, updated_at FROM testimonials ORDER BY created_at DESC")
            else:
                cur.execute("SELECT id, name, position, quote, rating FROM testimonials WHERE is_visible = true ORDER BY created_at DESC")
            rows = cur.fetchall()
            for row in rows:
                if 'created_at' in row and row['created_at']:
                    row['created_at'] = row['created_at'].isoformat()
                if 'updated_at' in row and row['updated_at']:
                    row['updated_at'] = row['updated_at'].isoformat()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(rows, ensure_ascii=False)}
    finally:
        conn.close()

def create_testimonial(event):
    body = json.loads(event.get('body', '{}'))
    name = body.get('name', '').strip()
    position = body.get('position', '').strip()
    quote = body.get('quote', '').strip()
    rating = body.get('rating', 5)

    if not name or not quote:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'name and quote are required'})}

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO testimonials (name, position, quote, rating) VALUES (%s, %s, %s, %s) RETURNING id, name, position, quote, rating, is_visible",
                (name, position, quote, rating)
            )
            row = cur.fetchone()
            conn.commit()
        return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps(row, ensure_ascii=False)}
    finally:
        conn.close()

def update_testimonial(event):
    body = json.loads(event.get('body', '{}'))
    tid = body.get('id')
    if not tid:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id is required'})}

    fields = []
    values = []
    for key in ['name', 'position', 'quote', 'rating', 'is_visible']:
        if key in body:
            fields.append(key + " = %s")
            values.append(body[key])

    if not fields:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'No fields to update'})}

    fields.append("updated_at = NOW()")
    values.append(tid)

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "UPDATE testimonials SET " + ", ".join(fields) + " WHERE id = %s RETURNING id, name, position, quote, rating, is_visible",
                values
            )
            row = cur.fetchone()
            conn.commit()
        if not row:
            return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(row, ensure_ascii=False)}
    finally:
        conn.close()

def delete_testimonial(params):
    tid = params.get('id')
    if not tid:
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id is required'})}

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM testimonials WHERE id = %s", (tid,))
            conn.commit()
            if cur.rowcount == 0:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}
    finally:
        conn.close()