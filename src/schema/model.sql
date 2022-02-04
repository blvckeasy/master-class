create database  master_class;

create table users (
    id serial not null primary key,
    name varchar(50) not null,
    surname varchar(50) not null,
    phone varchar(15) not null,
    category int not null references categories(id)
);

create table admin (
    id serial not null primary key,
    username varchar(25) not null,
    password varchar(25) not null,
    avatar TEXT
    
);

create table cards (
    id serial not null primary key,
    user_id int not null references users(id),
    title varchar(200) not null,
    sap_category_id int not null references sap_categories(id),
    views int not null default 0,
    card_image text not null,
    date timestamp not null,
    short_info text not null,
    long_info text not null,
    status boolean not null,
    location text,
    confirmation_number smallint not null DEFAULT 1,
    card_created_at timestamptz not null,
    card_deleted_at timestamptz
);

create table categories(
    id serial not null primary key,
    category varchar(100) not null
);

create table sap_categories(
    id serial not null primary key,
    category_id int not null references categories(id),
    name varchar(100) not null
);

insert into categories (category) values ('IT');
insert into categories (category) values ('Ta`lim');
insert into categories (category) values ('Business');
insert into categories (category) values ('Marketing');


insert into sap_categories (category_id, name) values (1, 'Javascript');
insert into sap_categories (category_id, name) values (1, 'Golang');
insert into sap_categories (category_id, name) values (2, 'Matematika');
insert into sap_categories (category_id, name) values (3, 'Pullarni boshqarish');
insert into sap_categories (category_id, name) values (3, 'Moliyalashtirish');
insert into sap_categories (category_id, name) values (3, 'Kursni kotarish');