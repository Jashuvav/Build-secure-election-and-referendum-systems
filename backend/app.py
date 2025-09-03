from app import create_app, db
from app.models import User, Category, Tag, LostItem, FoundItem, Claim
import os

app = create_app()

@app.cli.command()
def create_tables():
    """Create database tables."""
    db.create_all()
    print("Database tables created.")

@app.cli.command()
def init_db():
    """Initialize database with sample data."""
    db.create_all()
    
    # Create sample categories
    categories = [
        Category(name='Electronics', description='Phones, laptops, tablets, etc.', icon='📱', color='#3B82F6'),
        Category(name='Wallet & Cards', description='Wallets, ID cards, credit cards', icon='💳', color='#EF4444'),
        Category(name='Jewelry', description='Rings, necklaces, watches', icon='💍', color='#F59E0B'),
        Category(name='Clothing', description='Jackets, bags, shoes', icon='👕', color='#10B981'),
        Category(name='Documents', description='Passports, certificates, papers', icon='📄', color='#8B5CF6'),
        Category(name='Keys', description='House keys, car keys, keychains', icon='🔑', color='#F97316'),
        Category(name='Other', description='Miscellaneous items', icon='❓', color='#6B7280')
    ]
    
    for category in categories:
        existing = Category.query.filter_by(name=category.name).first()
        if not existing:
            db.session.add(category)
    
    db.session.commit()
    print("Database initialized with sample data.")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)