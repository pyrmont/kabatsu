/*
*  first_publication.js
*
*  @requires moment
*  @requires string
*
*  This file is an example of what a publication file might look like.
*/

var Moment = require('moment');
var SuperString = require('string');

/* 
*  @class FirstPublicationArticle
*
*  The FirstPublicationArticle class represents an article in the First Publication and inherits from the Article class.
*/
var Article = require('./../include/Article.js');

function FirstPublicationArticle() {
    Article.apply(this, Array.prototype.slice.call(arguments));
}

FirstPublicationArticle.prototype = new Article();

/*
*  @method extractContent
*
*  This function extracts the content from the article webpage.
*/
FirstPublicationArticle.prototype.extractContent = function() {
    var paragraphs = this.dom('article > p').toArray();
    
    for (var i = 0, len = paragraphs.length, content = ''; i < len; i++) {
        var paragraph = SuperString(this.dom(paragraphs[i]).text()).trim().s;
        content = content + '<p>' + paragraph + '</p>' + "\n";
    }
    
    this.content = content;
};

/* 
*  @class FirstPublication
*
*  The FirstPublication class represents an issue of the First Publication and inherits from the Publication class.
*/
var Publication = require('./../include/Publication.js');

function FirstPublication() {
    Publication.apply(this, Array.prototype.slice.call(arguments));
    this.name = 'First Publication';
    this.uris = { 'home': 'http://www.example.com/', 'toc': 'http://www.example.com/toc/index.html' };
    this.slug = 'fp';
    this.included_sections = [ 'World' ];
};

FirstPublication.prototype = new Publication();

/*
*  @method extractDate
*
*  This function extracts the date from the table of contents webpage.
*/
FirstPublication.prototype.extractDate = function() {
    var date = SuperString(this.dom('div.date').text()).trim().s;
    this.date = (new Moment(date, 'MMMM DD, YYYY')).format('D MMMM YYYY');
};

/*
*  @method extractLinks
*
*  This function sets the selectors and then calls the parent method.
*/
FirstPublication.prototype.extractLinks = function() {
    var selectors = ['a.headline'];
    Publication.prototype.extractLinks.call(this, selectors);
};

/*
*  @method extractArticles
*
*  This function extracts the articles from the table of contents webpage.
*/
FirstPublication.prototype.extractArticles = function() {
    var elements = this.dom('div.headlines').toArray();
    var section_element, section, story_elements = null;
    var articles = [];
    
    for (var i = 0, outer_len = elements.length; i < outer_len; i++) {
        section_element = this.dom(elements[i]).find('h2.section');
        section = SuperString(section_element.text()).trim().s;

        if (this.included_sections.indexOf(section) == -1) { continue; }
        
        story_elements = this.dom(elements[i]).find('div.article');
        
        for (var j = 0, inner_len = story_elements.length; j < inner_len; j++) {
            var story = story_elements[j];

            var link_elements = this.dom(story).find('a.headline');
            var link = link_elements.attr('href');

            var title = SuperString(link_elements.text()).trim().s;

            var byline_elements = this.dom(story).find('div.byline');
            var byline = SuperString(byline_elements.text()).trim().s;

            var uris = { 'original' : link, 'retrieve' : link, 'citation' : link, 'display' : display, 'local' : '/' + this.slug + '/' + SuperString(title).slugify().s + '.html' };

            var authors = byline.split(/, | and /);

            byline = (authors.length == 1) ? authors[0] : authors.slice(0, -1).join(', ') + ' and ' + authors.slice(-1);
            byline = 'By ' + byline;

            var id = articles.length;

            article = new FirstPublicationArticle(this, id, uris, section, title, authors, byline);
            articles.push(article);
            }
        }
    }
    
    this.articles = articles;
}

first_publication = new FirstPublication();
module.exports = first_publications;
