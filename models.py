from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()


# Favorite product association
fav_products_association = db.Table('fav_products', db.Model.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'))
)


# Category table
class Category(db.Model):
    __tablename__ = "category"
    id = db.Column(db.Integer(), primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    name = db.Column(db.String(255))
    products = db.relationship("Product", backref="category")

    def __init__(self, parent_id):
        self.parent_id = parent_id

    def __repr__(self):
        return "<Category '{}'>".format(self.id)


# Shopping cart table
class Shopping_Cart(db.Model):
    __tablename__ = "shopping_cart"
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'))
    user = db.relationship("User", back_populates="shopping_cart")

    def __init__(self, user_id, product_id):
        self.user_id = user_id
        self.product_id = product_id

    def __repr__(self):
        return "<Shopping_Cart '{}'>".format(self.id)


# Review_product association class
class Review_Product(db.Model):
    __tablename__ = "review_product"
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'), primary_key=True)
    review_text = db.Column(db.String(255))
    rating = db.Column(db.Integer())
    user = db.relationship("User")
    review = db.relationship("Product", back_populates="reviews")

    def __init__(self, user_id, product_id, review_text, rating):
        self.user_id = user_id
        self.product_id = product_id
        self.review_text = review_text
        self.rating = rating

    def __repr__(self):
        return "<Review '{}'>".format(self.review)


# Order association class
class Order(db.Model):
    __tablename__ = "order"
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id', ondelete='CASCADE'))
    status = db.Column(db.String(255))
    order = db.relationship("User", back_populates="orders")

    def __init__(self, user_id, product_id, status):
        self.user_id = user_id
        self.product_id = product_id
        self.status = status

    def __repr__(self):
        return "<Order '{}'>".format(self.user_id)


# User class
class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(255))
    password = db.Column(db.String(255))
    name = db.Column(db.String(255))
    surname = db.Column(db.String(255))
    address = db.Column(db.String(255))
    fav_products = db.relationship("Product", secondary=fav_products_association)
    shopping_cart = db.relationship('Shopping_Cart', back_populates='user')
    orders = db.relationship('Order', back_populates='order')

    def __init__(self, username, password, name, surname, address):
        self.username = username
        self.password = password
        self.name = name
        self.surname = surname
        self.address = address

    def __repr__(self):
        return "<User '{}'>".format(self.username)


# Product class
class Product(db.Model):
    __tablename__ = 'product'

    id = db.Column(db.Integer(), primary_key=True)
    stock = db.Column(db.Integer())
    height = db.Column(db.Float())
    width = db.Column(db.Float())
    length = db.Column(db.Float())
    brand = db.Column(db.String(255))
    rating = db.Column(db.Float())
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"))
    reviews = db.relationship('Review_Product', back_populates='review', passive_deletes=True)
    order = db.relationship('Order', backref="product", passive_deletes=True)
    shopping_cart = db.relationship('Shopping_Cart', backref="product", passive_deletes=True)
    users_who_fav = db.relationship("User", secondary=fav_products_association)

    def __init__(self, stock, height, width, length, brand, rating, category_id):
        self.stock = stock
        self.height = height
        self.width = width
        self.length = length
        self.brand = brand
        self.rating = rating
        self.category_id = category_id

    def __repr__(self):
        return "<Product '{}'>".format(self.id)

