# Acct4

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.6.

As the name suggests, this is the fourth version of my accounts keeping SPA.

## Design

This is for my personal use, and it's something I use pretty much every day. So the answer to 
most any "why did you do it that way?" question is "because that's what I wanted."

## History

* Version 1: small, simple, read-only Handlebars-based JavaScript, HTML, CSS
* Version 2: still small, simple, Angular 1 based, still read-only
* Version 3: Angular 2 based, more self-contained but some important functionality never got done
* Version 4: Angular 2 based, (almost) completely self-contained, new database structure

Version 4 came about when I decided to complete and extend version 3, and quickly came to the
conclusion that a (mostly) complete rewrite was in order.

## Structure

### Middle tier

The app communicates with a pretty simple Perl CGI script that lives in the `cgi-bin` folder
of my Apache installation. This is just a REST implementation for accessing the database.
The middle tier Perl code lives under the `acct4/perl` folder.

### Database tier

I'm using MySQL for my database instance. All the table, view, procedure, and function scripts
can be found under the `acct4/sql` folder.

## What's missing

### Delete

In spite of this basically being a CRUD application, I didn't implement any delete functionality,
pretty much because I've never had need of it, and I can always just drop into the CLI if I
really need to delete something.

### Saving searches?

Currently the last search is stored in browser local storage, which allows the user to return
to the search page and modify (debug) the search parameters. It might be useful to let the
user save named searches to the database. On the other hand, because the search results page
gets the search parameters from query parameters, the browser bookmarks basically do this already.

### Additional search parameters

* Search on amount (min or max)