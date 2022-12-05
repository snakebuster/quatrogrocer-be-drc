create table quatro_user(
    user_id serial primary key,
    email varchar not null,
    password varchar not null,
    first_name varchar(30), 
    last_name varchar(30),
    date_of_birth varchar(30),
    gender varchar,
    phone_number int,
    user_credit float
);

create table quatro_product(
    product_id serial primary key, 
    product_name varchar not null,
    product_description varchar not null, 
    product_category varchar not null, 
    product_price float not null, 
    product_quantity int not null,
    product_image varchar
);

create table quatro_product_discount(
    discount_product_id serial primary key, 
    discount_product_name varchar not null,
    discount_product_description varchar not null, 
    discount_product_category varchar not null, 
    discount_product_price float not null, 
    discount_product_quantity int not null,
    discount_product_image varchar
);

create table quatro_address(
    address_id serial primary key,
    user_id int constraint user_id_address references quatro_user(user_id) on delete cascade,
     address_line_1 varchar(50) not null, 
     address_line_2 varchar(50) not null, 
     address_line_3 varchar(50) not null, 
     postcode varchar not null, 
     state text not null 
);

create table quatro_transaction(
product_id int,
discount_product_id int, 
user_id int, 
discount_product_name varchar,
discount_product_price float,
product_name varchar, 
product_price float,
product_quantity int, 
transaction_total float generated always as(product_quantity * product_price) stored,
transaction_total_discount float generated always as(product_quantity * discount_product_price) stored,
payment_status boolean,
transaction_timestamp timestamp,
product_image varchar,
discount_product_image varchar);

create table quatro_cart(
user_id int not null, 
product_id int, 
discount_product_id int,
product_quantity int not null);
-- SQL


update quatro_transaction
 set discount_product_price = 
 (select quatro_product_discount.discount_product_price from quatro_product_discount 
 where quatro_transaction.product_id = quatro_product_discount.discount_product_id);