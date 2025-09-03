from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG') or 'default'
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Enable CORS
    CORS(app)
    
    # Create upload directory
    upload_dir = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Register blueprints
    from app.auth import bp as auth_bp
    from app.auth import routes as auth_routes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from app.items import bp as items_bp
    app.register_blueprint(items_bp, url_prefix='/api/items')
    
    return app

# Import models to ensure they are registered with SQLAlchemy
from app import models