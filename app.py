from flask import Flask, render_template, request, redirect
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///qalbi.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)

# User model for authentication
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    earnings = db.Column(db.Float, default=0.0)
    completed_surveys = db.Column(db.Integer, default=0)
    join_date = db.Column(db.String(20), nullable=False)

# Survey model
class Survey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    survey_type = db.Column(db.String(50), nullable=False)
    reward = db.Column(db.Float, nullable=False)
    completed_date = db.Column(db.String(20), nullable=False)

# Initialize database
with app.app_context():
    db.create_all()
    if not Post.query.first():
        demo = Post(title="Ku soo dhawaaw!", content="Qalbiga Nadiifta waa meel aad ku helayso xigmad, qisooyin iyo ducooyin qalbiga taabanaya.")
        db.session.add(demo)
        db.session.commit()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register", methods=["POST"])
def register():
    from datetime import datetime
    try:
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Check if user exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return {"success": False, "message": "Isticmaalahan waa jira!"}

        # Create new user
        new_user = User(
            username=username,
            email=email,
            password=password,
            join_date=datetime.now().strftime('%Y-%m-%d')
        )

        db.session.add(new_user)
        db.session.commit()

        return {"success": True, "message": "Guuleysta! Xisaab cusub ayaa la sameeyay!"}

    except Exception as e:
        return {"success": False, "message": "Cilad ayaa dhacday!"}

@app.route("/authenticate", methods=["POST"])
def authenticate():
    try:
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username, password=password).first()

        if user:
            return {"success": True, "message": "Guuleysta! Dashboard-ka ayaad u waregi doontaa!"}
        else:
            return {"success": False, "message": "Username ama password qaldan!"}

    except Exception as e:
        return {"success": False, "message": "Cilad ayaa dhacday!"}

@app.route("/start-survey", methods=["POST"])
def start_survey():
    try:
        survey_type = request.form.get('survey_type')
        reward = float(request.form.get('reward'))

        # Here you would save survey completion to database
        # For now just return success
        return {"success": True, "message": f"Survey completed! ${reward} earned!"}

    except Exception as e:
        return {"success": False, "message": "Error completing survey"}

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

@app.route("/admin")
def admin():
    posts = Post.query.all()
    return render_template("admin.html", posts=posts)

@app.route("/admin/add", methods=["GET", "POST"])
def add():
    if request.method == "POST":
        title = request.form["title"]
        content = request.form["content"]
        new_post = Post(title=title, content=content)
        db.session.add(new_post)
        db.session.commit()
        return redirect("/")
    return render_template("add_post.html")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)