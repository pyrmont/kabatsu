/*
*  second_publication.js
*
*  @requires moment
*  @requires string
*
*  This file is an example of what a publication file might look like.
*/

var Moment = require('moment');
var SuperString = require('string');

/* 
*  @class SecondPublicationArticle
*
*  The SecondPublicationArticle class represents an article in the Second Publication and inherits from the Article class.
*/
var Article = require('./../include/Article.js');

function SecondPublicationArticle() {
    Article.apply(this, Array.prototype.slice.call(arguments));
}

SecondPublicationArticle.prototype = new Article();

/* 
*  @class SecondPublication
*
*  The SecondPublication class represents an issue of the Second Publication and inherits from the Publication class.
*/
var Publication = require('./../include/Publication.js');

function SecondPublication() {
    Publication.apply(this, Array.prototype.slice.call(arguments));
    this.name = 'Second Publication';
    this.uris = { 'home': 'http://www.example.com/', 'toc': 'http://www.example.com/toc/index.html' };
    this.slug = 'fp';
    this.included_sections = [ 'Local' ];
};

SecondPublication.prototype = new Publication();

second_publication = new SecondPublication();
module.exports = first_publications;
