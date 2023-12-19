from datetime import datetime
#from server import app
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()

bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(20), unique=True, nullable=False)
    family_name = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    city = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def __init__(self,  firstname, family_name, gender, city, country, email, password):
        self.firstname = firstname
        self.family_name = family_name
        self.gender = gender
        self.city = city 
        self.country = country
        self.email = email
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
    
    def change_password(self, newpassword):
        self.password = bcrypt.generate_password_hash(newpassword).decode('utf-8')

    def get_user_data(self):
        return {
                'email':self.email,
                'firstname':self.firstname,
                'family name':self.family_name,
                'gender':self.gender,
                'city':self.city,
                'country':self.country
                }




    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"
    

class AuthToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __init__(self, jti):
        self.jti = jti

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(120))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    author = db.relationship('User', foreign_keys=[author_id],backref=db.backref('posted_messages', lazy=True))
    recived_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recived_user = db.relationship('User', foreign_keys=[recived_user_id],backref=db.backref('recived_messages', lazy=True))

    def __init__(self, message, author_id, recived_user_id): 
        self.message = message
        self.author_id = author_id
        self.recived_user_id = recived_user_id 


    def __repr__(self):
        return f"Message ('{self.message}'), Author('{self.author.name}'), Recived ('{self.recived_user.name}')"
    
    def json_format(self):
        return {
                'Message':self.message,
                'Author':self.author,
                }