from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship
import json

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    google_id = db.Column(db.String(100), unique=True)
    full_name = db.Column(db.String(200))
    profile_picture = db.Column(db.String(500))
    phone = db.Column(db.String(20))
    bio = db.Column(db.Text)
    location = db.Column(db.String(200))
    is_verified = db.Column(db.Boolean, default=False)
    reputation_score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    lost_items = relationship('LostItem', backref='user', lazy='dynamic')
    found_items = relationship('FoundItem', backref='user', lazy='dynamic')
    collaboration_posts = relationship('CollaborationPost', backref='author', lazy='dynamic')
    sent_messages = relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy='dynamic')
    received_messages = relationship('Message', foreign_keys='Message.recipient_id', backref='recipient', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'location': self.location,
            'reputation_score': self.reputation_score,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(100))
    color = db.Column(db.String(7))  # Hex color code
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color
        }

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

# Association table for many-to-many relationship between items and tags
item_tags = db.Table('item_tags',
    db.Column('item_id', db.Integer, db.ForeignKey('lost_item.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

found_item_tags = db.Table('found_item_tags',
    db.Column('item_id', db.Integer, db.ForeignKey('found_item.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class LostItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    location_lost = db.Column(db.String(500))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    date_lost = db.Column(db.DateTime)
    reward_amount = db.Column(db.Float, default=0)
    contact_info = db.Column(db.String(500))
    images = db.Column(db.Text)  # JSON array of image URLs
    status = db.Column(db.String(20), default='active')  # active, found, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    qr_code_url = db.Column(db.String(500))
    
    # Relationships
    category = relationship('Category', backref='lost_items')
    tags = relationship('Tag', secondary=item_tags, backref='lost_items')
    claims = relationship('Claim', backref='lost_item', lazy='dynamic')
    
    def get_images(self):
        return json.loads(self.images) if self.images else []
    
    def set_images(self, image_list):
        self.images = json.dumps(image_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'user_id': self.user_id,
            'category': self.category.to_dict() if self.category else None,
            'location_lost': self.location_lost,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'date_lost': self.date_lost.isoformat() if self.date_lost else None,
            'reward_amount': self.reward_amount,
            'contact_info': self.contact_info,
            'images': self.get_images(),
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'qr_code_url': self.qr_code_url,
            'tags': [tag.to_dict() for tag in self.tags],
            'user': self.user.to_dict() if self.user else None
        }

class FoundItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    location_found = db.Column(db.String(500))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    date_found = db.Column(db.DateTime)
    contact_info = db.Column(db.String(500))
    images = db.Column(db.Text)  # JSON array of image URLs
    status = db.Column(db.String(20), default='available')  # available, claimed, returned
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship('Category', backref='found_items')
    tags = relationship('Tag', secondary=found_item_tags, backref='found_items')
    claims = relationship('Claim', backref='found_item', lazy='dynamic')
    
    def get_images(self):
        return json.loads(self.images) if self.images else []
    
    def set_images(self, image_list):
        self.images = json.dumps(image_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'user_id': self.user_id,
            'category': self.category.to_dict() if self.category else None,
            'location_found': self.location_found,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'date_found': self.date_found.isoformat() if self.date_found else None,
            'contact_info': self.contact_info,
            'images': self.get_images(),
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'tags': [tag.to_dict() for tag in self.tags],
            'user': self.user.to_dict() if self.user else None
        }

class Claim(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lost_item_id = db.Column(db.Integer, db.ForeignKey('lost_item.id'))
    found_item_id = db.Column(db.Integer, db.ForeignKey('found_item.id'))
    claimant_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    claimant = relationship('User', backref='claims')
    
    def to_dict(self):
        return {
            'id': self.id,
            'lost_item_id': self.lost_item_id,
            'found_item_id': self.found_item_id,
            'claimant_id': self.claimant_id,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'claimant': self.claimant.to_dict() if self.claimant else None
        }

class CollaborationPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50))  # project, skill-sharing, networking, etc.
    skills_required = db.Column(db.Text)  # JSON array
    skills_offered = db.Column(db.Text)  # JSON array
    location = db.Column(db.String(200))
    is_remote = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='open')  # open, in-progress, completed, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_skills_required(self):
        return json.loads(self.skills_required) if self.skills_required else []
    
    def set_skills_required(self, skills_list):
        self.skills_required = json.dumps(skills_list)
    
    def get_skills_offered(self):
        return json.loads(self.skills_offered) if self.skills_offered else []
    
    def set_skills_offered(self, skills_list):
        self.skills_offered = json.dumps(skills_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'author_id': self.author_id,
            'type': self.type,
            'skills_required': self.get_skills_required(),
            'skills_offered': self.get_skills_offered(),
            'location': self.location,
            'is_remote': self.is_remote,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': self.author.to_dict() if self.author else None
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    message_type = db.Column(db.String(20), default='text')  # text, image, system
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'content': self.content,
            'is_read': self.is_read,
            'message_type': self.message_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'sender': self.sender.to_dict() if self.sender else None
        }

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50))  # claim, message, match, collaboration
    is_read = db.Column(db.Boolean, default=False)
    data = db.Column(db.Text)  # JSON data for additional info
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship('User', backref='notifications')
    
    def get_data(self):
        return json.loads(self.data) if self.data else {}
    
    def set_data(self, data_dict):
        self.data = json.dumps(data_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'data': self.get_data(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reported_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    lost_item_id = db.Column(db.Integer, db.ForeignKey('lost_item.id'))
    found_item_id = db.Column(db.Integer, db.ForeignKey('found_item.id'))
    collaboration_post_id = db.Column(db.Integer, db.ForeignKey('collaboration_post.id'))
    reason = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reporter = relationship('User', foreign_keys=[reporter_id], backref='reports_made')
    reported_user = relationship('User', foreign_keys=[reported_user_id], backref='reports_received')
    
    def to_dict(self):
        return {
            'id': self.id,
            'reporter_id': self.reporter_id,
            'reported_user_id': self.reported_user_id,
            'lost_item_id': self.lost_item_id,
            'found_item_id': self.found_item_id,
            'collaboration_post_id': self.collaboration_post_id,
            'reason': self.reason,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }