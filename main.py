# This flask app uses single file for models
# and a separate file for endpoints
# by Kanan Asadov

from flask import Flask, render_template, request, redirect, session, url_for, g

# Configure flask app
app = Flask(__name__)
app.secret_key = 'secretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommersetask.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import models
from models import db, User, Product, \
    Review_Product, Order, Shopping_Cart, \
    Category, fav_products_association

db.init_app(app)
with app.app_context():
    db.create_all()
    db.session.commit()

# USER SIDE


# Get user object from db before each request
@app.before_request
def before_request():
    g.user = None

    if 'user_id' in session:
        user = User.query.filter_by(id=session['user_id']).first()
        g.user = user


# Index page returns profile if user is logged in
# Login page if not logged in
@app.route('/', methods=['POST', 'GET'])
def index():
    if g.user:
        return redirect(url_for('profile'))

    return redirect(url_for('login'))


# Login endpoint
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        # Pop user from session
        session.pop('user_id', None)

        # Match user and put id into session
        # Then redirect to profile if matched
        try:
            user = User.query.filter_by(username=request.form['username'],
                                        password=request.form['password'])\
                .first()
            if user:
                session['user_id'] = user.id
                return redirect(url_for('profile'))
            return redirect(url_for('login'))
        except KeyError:
            return redirect(url_for('login'))
    else:
        return render_template("login.html")


# Profile endpoint
@app.route('/profile')
def profile():
    if not g.user:
        return redirect(url_for('login'))

    return render_template('profile.html', orders=g.user.orders, fav_products=g.user.fav_products)


# Product buy endpoint
@app.route('/product/<int:product_id>/buy', methods=["GET", "POST"])
def buy_product(product_id):
    if not g.user:
        return redirect(url_for('login'))

    if request.method == 'POST':
        order = Order(user_id=g.user.id, product_id=product_id, status="Preparing")
        ordered_product = Product.query.filter_by(id=product_id).first()
        ordered_product.stock -= 1
        try:
            db.session.add(order)
            db.session.commit()
        except Exception:
            db.session.rollback()
        finally:
            return redirect(url_for('profile'))
    return render_template('buy.html')


# Product page
@app.route('/product/<int:product_id>', methods=["GET", "POST"])
def product(product_id):
    if not g.user:
        return redirect(url_for('login'))

    product = Product.query.filter_by(id=product_id).first()

    if request.method == "POST":
        if 'add_to_cart' in request.form:
            cart = Shopping_Cart(user_id=g.user.id, product_id=product_id)
            db.session.add(cart)
            db.session.commit()
        elif 'add_to_fav' in request.form:
            g.user.fav_products.append(Product.query.filter_by(id=product_id).first())
            db.session.commit()
        elif 'remove_from_fav' in request.form:
            g.user.fav_products.remove(Product.query.filter_by(id=product_id).first())
            db.session.commit()
        else:
            reviews = Review_Product.query.all()
            avg_rating = 0

            for r in reviews:
                avg_rating += r.rating

            avg_rating += int(request.form["rating"])

            avg_rating /= len(reviews) + 1
            product.rating = avg_rating
            review = Review_Product(user_id=g.user.id,
                                    product_id=product_id,
                                    review_text=request.form["review"],
                                    rating=request.form["rating"])

            try:
                db.session.add(review)
                db.session.commit()
            except Exception:
                db.session.rollback()
                categories = Category.query.all()
                is_favorite = any(p.id == product_id for p in g.user.fav_products)

                return render_template('product.html', product=product,
                                       categories=categories,
                                       parent=categories[product.category_id - 1],
                                       dialog=True,
                                       is_favorite=is_favorite)

    categories = Category.query.all()
    is_favorite = any(p.id == product_id for p in g.user.fav_products)
    return render_template('product.html', product=product,
                           categories=categories,
                           parent=categories[product.category_id - 1],
                           is_favorite=is_favorite)


# Shopping cart endpoint
@app.route('/shopping_cart', methods=["GET", "POST"])
def shopping_cart_page():
    if not g.user:
        return redirect(url_for('login'))

    if request.method == "POST":
        if "buy" in request.form:
            for item in g.user.shopping_cart:
                db.session.add(Order(user_id=g.user.id, product_id=item.product_id, status="Preparing"))
                ordered_product = Product.query.filter_by(id=item.product_id).first()
                ordered_product.stock -= 1
                Shopping_Cart.query.filter_by(id=item.id).delete()

            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
            finally:
                return redirect(url_for('profile'))
        else:
            id_to_remove = list(request.form.keys())[list(request.form.values()).index("Remove")]
            Shopping_Cart.query.filter_by(id=id_to_remove).delete()
            db.session.commit()
    return render_template('shopping_cart.html')


# Products endpoint
@app.route('/products', methods=['GET', 'POST'])
def products():
    if not g.user:
        return redirect(url_for('login'))

    products = []
    if request.method == "POST":
        pass
    else:
        products = Product.query.all()

    categories = Category.query.all()
    return render_template("products.html", products=products,
                           categories=categories)


# ADMIN/STORE SIDE


# Admin login endpoint
@app.route('/admin_login', methods=['GET', 'POST'])
def admin_login():
    if request.method == "POST":
        session.pop('admin_id', None)
        try:
            if request.form['username'] == 'admin' and request.form['password'] == 'admin':
                session['admin_id'] = 'someid'
                return redirect(url_for('sales'))
            return redirect(url_for('admin_login'))
        except KeyError:
            return redirect(url_for('admin_login'))

    else:
        return render_template("admin_login.html")


# Sales endpoint
@app.route('/sales', methods=['GET', 'POST'])
def sales():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))

    if request.method == "POST":
        sale = Order.query.filter_by(id=request.form['id']).first()
        if sale.status == "Preparing":
            sale.status = "On the way"
        elif sale.status == "On the way":
            sale.status = "Delivered"
        db.session.commit()

    orders = Order.query.all()
    return render_template("sales.html", sales=orders)


# Stock management endpoint
@app.route('/stock_management', methods=['GET', 'POST'])
def stock_management():
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))
    if request.method == "POST":
        if "add_stock" in request.form:
            product = Product.query.filter_by(id=request.form['id']).first()
            product.stock += 10
        elif "remove" in request.form:
            p = Product.query.filter_by(id=request.form['id']).first()
            p.users_who_fav.clear()
            p.users_who_fav = []
            Product.query.filter_by(id=request.form['id']).delete()
            Shopping_Cart.query.filter_by(product_id=request.form['id']).delete()
            Order.query.filter_by(product_id=request.form['id']).delete()
        else:
            new_product = Product(stock=request.form["stock"],
                              height=request.form["height"],
                              width=request.form["width"],
                              length=request.form["length"],
                              brand=request.form["brand"],
                              rating=0,
                              category_id=request.form["category"])

            db.session.add(new_product)
        db.session.commit()

    products = Product.query.all()
    categories = Category.query.all()

    return render_template("stock_management.html", products=products, categories=categories)


if __name__ == '__main__':
    app.run(debug=True)