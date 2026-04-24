from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'medhAVI'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/farmers'
db = SQLAlchemy(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'

# --------------------- MODELS ---------------------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(1000))

class Register(db.Model):
    rid = db.Column(db.Integer, primary_key=True)
    farmername = db.Column(db.String(50))
    adharnumber = db.Column(db.String(50))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(50))
    phonenumber = db.Column(db.String(50))
    address = db.Column(db.String(50))
    farming = db.Column(db.String(50))

class Farming(db.Model):
    fid = db.Column(db.Integer, primary_key=True)
    farmingtype = db.Column(db.String(100))

class Addagroproducts(db.Model):
    pid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    email = db.Column(db.String(50))
    productname = db.Column(db.String(100))
    productdesc = db.Column(db.String(300))
    price = db.Column(db.Integer)

# ------------------- LOGIN MANAGER -------------------
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --------------------- ROUTES ---------------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()

        if user and user.password == password:
            login_user(user)
            flash("Login Success", "success")
            return redirect(url_for('dashboard'))  # Redirect to a NEW page
        else:
            flash("Invalid credentials", "danger")
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')  # Create dashboard.html page

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Logged out successfully", "info")
    return redirect(url_for('login'))

# ------------------ RUN ------------------
if __name__== '_main_':
    app.run(debug=True)