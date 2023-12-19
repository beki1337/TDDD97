from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from user import User, AuthToken, db, Message

 


app = Flask(__name__)





app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
jwt = JWTManager(app)
db.init_app(app)


@app.route('/test',methods=['GET'])
def test():
     print(db.session.get(User, 1))
     return jsonify({"msg": "Invalid username or password"}), 200


@app.route('/sign_in',methods=['POST'])
def sign_in():

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Invalid username or password"}), 401
    elif not user.check_password(password):
        return jsonify({"msg": "Invalid username or password"}), 401
    expires = timedelta(hours=1)
    access_token = create_access_token(identity=user.id,expires_delta=expires)
    return jsonify(access_token=access_token),200


@app.route('/sign_up',methods=['POST'])
def sign_up():
    data = request.get_json()
    username = data.get('firstname')
    password = data.get('password')
    family_name = data.get('family_name')
    gender = data.get('gender')
    city = data.get('city') 
    country = data.get('country')
    email = data.get('email')

    if len(password) < 6:
        return jsonify({"msg": "The password is to short is to short"}), 401
    

    user = User(username, family_name, gender, city, country, email, password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg":"User created"}),200


@app.route('/sign_out',methods=['GET'])
@jwt_required()
def sign_out():
    jti = get_jwt()['jti']
    token = AuthToken(jti)
    db.session.add(token)
    db.session.commit()
    return jsonify({"msg": "Token revoked"}), 200


@app.route('/change_password',methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    current_password = data.get("password")
    new_password = data.get("new_password")
    if not user.check_password(current_password):
        return jsonify({"msg": "The provied password was wrong"}), 401
    elif len(new_password) < 6:
        return jsonify({"msg": "The new password was to short"}), 401
    user.change_password(new_password)

    return jsonify({"msg": "Updated password"}), 201

@app.route('/user_data', methods=['GET'])
@jwt_required()
def get_user_data_by_token():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if user == None:
        return jsonify({"msg": "No user with that id"}), 401
    return jsonify({"msg":user.get_user_data()})


@app.route('/user_data/<string:email>', methods=['GET'])
@jwt_required()
def get_user_data_by_email(email):
    user = User.query.filter_by(email=email).first()
    if user == None:
        return jsonify({"msg": "No user with that id"}), 401
    return jsonify({"msg":user.get_user_data()})



@app.route('/messages', methods=['GET'])
@jwt_required()
def get_user_messages_by_token(email):
    user = User.query.filter_by(email=email).first()
    if user == None:
        return jsonify({"msg": "No user with that id"}), 401
    
    recived_messages = user.recived_messages
    return jsonify({"msg":[message.json_format() for message in  recived_messages ]})
    
    
    
@app.route('/messages/<string:email>', methods=['GET'])
def get_user_messages_by_email(email):
    user = User.query.filter_by(email=email).first()
    if user == None:
        return jsonify({"msg": "No user with that id"}), 401
    recived_messages = user.recived_messages
    return jsonify({"msg":[message.json_format() for message in  recived_messages ]})
    



@app.route('/post_message/<int:recive_id>', methods=['POST'])
@jwt_required()
def post_message(recive_id):
    data = request.get_json()
    user_id = get_jwt_identity()
    if db.session.get(User, recive_id) == None:
        return jsonify({"msg": "No user with that id"}), 401
    message =  data.get("message")
    message = Message(message, user_id, recive_id)
    db.session.add(message)
    db.session.commit()
    return jsonify({"msg": "Message added"}), 200





@jwt.token_in_blocklist_loader
def check_if_token_vaild(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return AuthToken.query.filter_by(jti=jti).first() is not None


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)