# tenktek-assignment

This is a simple e-commerce application built with flask+html.

Styling was not important for this task, so the pages are only a skeleton.

Details that need to be known to test:

Go to '/login' for user login.
There are 2 users in the system

username: kenan, password: 123 | username: joe, password 321
Login into one user, order products, add some to favorite, review some and add to shopping cart.
Then log out and do the same for second user. When you go back to the first user the shoppin cart elements will still be there.

Go to '/admin_login' for store login
username: admin, password: admin

You can change shipment status of orders, create new products, add stock and delete products.
When you delete a product the orders, reviews and favorites related to that product will also be deleted.
