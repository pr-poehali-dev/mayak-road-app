import json
import os
import math
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    """API для работы с событиями на дороге"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        import psycopg2.extras
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            lat = float(params.get('lat', 55.7558))
            lng = float(params.get('lng', 37.6173))
            radius = float(params.get('radius', 59))
            
            cur.execute("""
                SELECT 
                    e.id, e.type, e.title, e.description,
                    e.latitude, e.longitude, e.helpful_count,
                    e.created_at,
                    u.username, u.first_name, u.last_name, u.photo_url, u.rating
                FROM road_events e
                LEFT JOIN users u ON e.user_id = u.id
                WHERE e.is_active = true
                AND e.created_at > NOW() - INTERVAL '24 hours'
                ORDER BY e.created_at DESC
            """)
            
            events = []
            for row in cur.fetchall():
                distance = calculate_distance(lat, lng, float(row['latitude']), float(row['longitude']))
                
                if distance <= radius:
                    events.append({
                        'id': row['id'],
                        'type': row['type'],
                        'title': row['title'],
                        'description': row['description'],
                        'latitude': float(row['latitude']),
                        'longitude': float(row['longitude']),
                        'distance': round(distance, 1),
                        'helpful_count': row['helpful_count'],
                        'timestamp': row['created_at'].isoformat(),
                        'author': {
                            'name': f"{row['first_name'] or ''} {row['last_name'] or ''}".strip() or row['username'] or 'Аноним',
                            'avatar': row['photo_url'] or '',
                            'rating': float(row['rating']) if row['rating'] else 0.0
                        }
                    })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'events': events}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            user_id = body.get('user_id')
            event_type = body.get('type')
            title = body.get('title')
            description = body.get('description', '')
            latitude = body.get('latitude')
            longitude = body.get('longitude')
            
            if not all([user_id, event_type, title, latitude, longitude]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO road_events (user_id, type, title, description, latitude, longitude)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, event_type, title, description, latitude, longitude))
            
            event_id = cur.fetchone()['id']
            
            cur.execute("""
                UPDATE users SET events_created = events_created + 1
                WHERE id = %s
            """, (user_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'event_id': event_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            event_id = body.get('event_id')
            user_id = body.get('user_id')
            
            if not event_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing event_id or user_id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO event_votes (event_id, user_id)
                VALUES (%s, %s)
                ON CONFLICT (event_id, user_id) DO NOTHING
                RETURNING id
            """, (event_id, user_id))
            
            if cur.fetchone():
                cur.execute("""
                    UPDATE road_events SET helpful_count = helpful_count + 1
                    WHERE id = %s
                """, (event_id,))
                
                cur.execute("""
                    UPDATE users u SET helpful_reports = helpful_reports + 1
                    FROM road_events e
                    WHERE e.id = %s AND u.id = e.user_id
                """, (event_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Вычисление расстояния между двумя точками по формуле гаверсинусов"""
    R = 6371
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c
