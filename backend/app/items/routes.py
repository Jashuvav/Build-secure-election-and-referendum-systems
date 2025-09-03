from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.items import bp
from app import db
from app.models import LostItem, FoundItem, Category, Tag, Claim, User
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
import qrcode
from io import BytesIO
import base64
from geopy.distance import geodesic
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filename = str(uuid.uuid4()) + '_' + filename
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return filename
    return None

def generate_qr_code(item_id, item_type='lost'):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    data = f"{request.url_root}item/{item_type}/{item_id}"
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    filename = f"qr_{item_type}_{item_id}_{uuid.uuid4().hex}.png"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    
    with open(filepath, 'wb') as f:
        f.write(buffer.getvalue())
    
    return filename

@bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.all()
        return jsonify({
            'categories': [category.to_dict() for category in categories]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    try:
        data = request.get_json()
        
        category = Category(
            name=data['name'],
            description=data.get('description'),
            icon=data.get('icon'),
            color=data.get('color', '#000000')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/tags', methods=['GET'])
def get_tags():
    try:
        tags = Tag.query.all()
        return jsonify({
            'tags': [tag.to_dict() for tag in tags]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/lost', methods=['POST'])
@jwt_required()
def create_lost_item():
    try:
        user_id = get_jwt_identity()
        data = request.form if request.files else request.get_json()
        
        # Create lost item
        lost_item = LostItem(
            title=data['title'],
            description=data['description'],
            user_id=user_id,
            category_id=data['category_id'],
            location_lost=data.get('location_lost'),
            latitude=float(data['latitude']) if data.get('latitude') else None,
            longitude=float(data['longitude']) if data.get('longitude') else None,
            date_lost=datetime.fromisoformat(data['date_lost']) if data.get('date_lost') else None,
            reward_amount=float(data.get('reward_amount', 0)),
            contact_info=data.get('contact_info')
        )
        
        db.session.add(lost_item)
        db.session.flush()  # Get the ID
        
        # Handle image uploads
        images = []
        if request.files:
            for key in request.files:
                if key.startswith('image'):
                    file = request.files[key]
                    filename = save_uploaded_file(file)
                    if filename:
                        images.append(filename)
        
        lost_item.set_images(images)
        
        # Handle tags
        if data.get('tags'):
            tag_names = data['tags'].split(',') if isinstance(data['tags'], str) else data['tags']
            for tag_name in tag_names:
                tag_name = tag_name.strip()
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                lost_item.tags.append(tag)
        
        # Generate QR code
        db.session.commit()
        qr_filename = generate_qr_code(lost_item.id, 'lost')
        lost_item.qr_code_url = qr_filename
        
        db.session.commit()
        
        return jsonify({
            'message': 'Lost item posted successfully',
            'item': lost_item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/found', methods=['POST'])
@jwt_required()
def create_found_item():
    try:
        user_id = get_jwt_identity()
        data = request.form if request.files else request.get_json()
        
        # Create found item
        found_item = FoundItem(
            title=data['title'],
            description=data['description'],
            user_id=user_id,
            category_id=data['category_id'],
            location_found=data.get('location_found'),
            latitude=float(data['latitude']) if data.get('latitude') else None,
            longitude=float(data['longitude']) if data.get('longitude') else None,
            date_found=datetime.fromisoformat(data['date_found']) if data.get('date_found') else None,
            contact_info=data.get('contact_info')
        )
        
        db.session.add(found_item)
        db.session.flush()  # Get the ID
        
        # Handle image uploads
        images = []
        if request.files:
            for key in request.files:
                if key.startswith('image'):
                    file = request.files[key]
                    filename = save_uploaded_file(file)
                    if filename:
                        images.append(filename)
        
        found_item.set_images(images)
        
        # Handle tags
        if data.get('tags'):
            tag_names = data['tags'].split(',') if isinstance(data['tags'], str) else data['tags']
            for tag_name in tag_names:
                tag_name = tag_name.strip()
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                found_item.tags.append(tag)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Found item posted successfully',
            'item': found_item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/lost', methods=['GET'])
def get_lost_items():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category_id = request.args.get('category_id', type=int)
        search = request.args.get('search', '')
        location = request.args.get('location')
        radius = request.args.get('radius', 10, type=float)  # km
        
        query = LostItem.query.filter(LostItem.status == 'active')
        
        if category_id:
            query = query.filter(LostItem.category_id == category_id)
        
        if search:
            query = query.filter(
                db.or_(
                    LostItem.title.contains(search),
                    LostItem.description.contains(search)
                )
            )
        
        # Location-based filtering
        if location and ',' in location:
            lat, lng = map(float, location.split(','))
            # Filter by approximate bounding box first for performance
            lat_range = radius / 111.0  # Approximate km to degrees
            lng_range = radius / (111.0 * abs(np.cos(np.radians(lat))))
            
            query = query.filter(
                LostItem.latitude.between(lat - lat_range, lat + lat_range),
                LostItem.longitude.between(lng - lng_range, lng + lng_range)
            )
        
        items = query.order_by(LostItem.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Further filter by exact distance if location provided
        if location and ',' in location:
            lat, lng = map(float, location.split(','))
            filtered_items = []
            for item in items.items:
                if item.latitude and item.longitude:
                    distance = geodesic((lat, lng), (item.latitude, item.longitude)).kilometers
                    if distance <= radius:
                        item_dict = item.to_dict()
                        item_dict['distance'] = round(distance, 2)
                        filtered_items.append(item_dict)
            result_items = filtered_items
        else:
            result_items = [item.to_dict() for item in items.items]
        
        return jsonify({
            'items': result_items,
            'pagination': {
                'page': items.page,
                'pages': items.pages,
                'per_page': items.per_page,
                'total': items.total
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/found', methods=['GET'])
def get_found_items():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category_id = request.args.get('category_id', type=int)
        search = request.args.get('search', '')
        location = request.args.get('location')
        radius = request.args.get('radius', 10, type=float)
        
        query = FoundItem.query.filter(FoundItem.status == 'available')
        
        if category_id:
            query = query.filter(FoundItem.category_id == category_id)
        
        if search:
            query = query.filter(
                db.or_(
                    FoundItem.title.contains(search),
                    FoundItem.description.contains(search)
                )
            )
        
        # Location-based filtering
        if location and ',' in location:
            lat, lng = map(float, location.split(','))
            lat_range = radius / 111.0
            lng_range = radius / (111.0 * abs(np.cos(np.radians(lat))))
            
            query = query.filter(
                FoundItem.latitude.between(lat - lat_range, lat + lat_range),
                FoundItem.longitude.between(lng - lng_range, lng + lng_range)
            )
        
        items = query.order_by(FoundItem.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Further filter by exact distance if location provided
        if location and ',' in location:
            lat, lng = map(float, location.split(','))
            filtered_items = []
            for item in items.items:
                if item.latitude and item.longitude:
                    distance = geodesic((lat, lng), (item.latitude, item.longitude)).kilometers
                    if distance <= radius:
                        item_dict = item.to_dict()
                        item_dict['distance'] = round(distance, 2)
                        filtered_items.append(item_dict)
            result_items = filtered_items
        else:
            result_items = [item.to_dict() for item in items.items]
        
        return jsonify({
            'items': result_items,
            'pagination': {
                'page': items.page,
                'pages': items.pages,
                'per_page': items.per_page,
                'total': items.total
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/lost/<int:item_id>', methods=['GET'])
def get_lost_item(item_id):
    try:
        item = LostItem.query.get_or_404(item_id)
        return jsonify({'item': item.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/found/<int:item_id>', methods=['GET'])
def get_found_item(item_id):
    try:
        item = FoundItem.query.get_or_404(item_id)
        return jsonify({'item': item.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/suggestions/<int:item_id>', methods=['GET'])
def get_suggestions(item_id):
    try:
        item_type = request.args.get('type', 'lost')  # 'lost' or 'found'
        
        if item_type == 'lost':
            source_item = LostItem.query.get_or_404(item_id)
            target_items = FoundItem.query.filter(FoundItem.status == 'available').all()
        else:
            source_item = FoundItem.query.get_or_404(item_id)
            target_items = LostItem.query.filter(LostItem.status == 'active').all()
        
        if not target_items:
            return jsonify({'suggestions': []}), 200
        
        # Create text corpus for similarity analysis
        source_text = f"{source_item.title} {source_item.description}"
        target_texts = [f"{item.title} {item.description}" for item in target_items]
        all_texts = [source_text] + target_texts
        
        # Calculate TF-IDF similarity
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Calculate cosine similarity
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        # Get top matches
        suggestions = []
        for i, similarity in enumerate(similarities):
            if similarity > 0.1:  # Minimum similarity threshold
                item = target_items[i]
                suggestion = item.to_dict()
                suggestion['similarity_score'] = float(similarity)
                
                # Add distance if both items have coordinates
                if (source_item.latitude and source_item.longitude and 
                    item.latitude and item.longitude):
                    distance = geodesic(
                        (source_item.latitude, source_item.longitude),
                        (item.latitude, item.longitude)
                    ).kilometers
                    suggestion['distance'] = round(distance, 2)
                
                suggestions.append(suggestion)
        
        # Sort by similarity score
        suggestions.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return jsonify({
            'suggestions': suggestions[:10]  # Top 10 suggestions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/claim', methods=['POST'])
@jwt_required()
def create_claim():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        claim = Claim(
            lost_item_id=data.get('lost_item_id'),
            found_item_id=data.get('found_item_id'),
            claimant_id=user_id,
            message=data.get('message', '')
        )
        
        db.session.add(claim)
        db.session.commit()
        
        return jsonify({
            'message': 'Claim submitted successfully',
            'claim': claim.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/my-items', methods=['GET'])
@jwt_required()
def get_my_items():
    try:
        user_id = get_jwt_identity()
        
        lost_items = LostItem.query.filter_by(user_id=user_id).order_by(LostItem.created_at.desc()).all()
        found_items = FoundItem.query.filter_by(user_id=user_id).order_by(FoundItem.created_at.desc()).all()
        
        return jsonify({
            'lost_items': [item.to_dict() for item in lost_items],
            'found_items': [item.to_dict() for item in found_items]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/lost/<int:item_id>/status', methods=['PUT'])
@jwt_required()
def update_lost_item_status(item_id):
    try:
        user_id = get_jwt_identity()
        item = LostItem.query.get_or_404(item_id)
        
        if item.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['active', 'found', 'closed']:
            return jsonify({'error': 'Invalid status'}), 400
        
        item.status = new_status
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'item': item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500