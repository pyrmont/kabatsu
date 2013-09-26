/*
*  Article.js
*
*  @requires cheerio
*  @requires fs
*  @requires mustache
*  @requires string
*
*  The Article class represents an article. It can be either called on its own or extended.
*/

var Cheerio = require('cheerio');
var FS = require('fs');
var Mustache = require('mustache');
var SuperString = require('string');

/*
*  @class Article
*
*  @param {Publication} publication - The publication this article appears in.
*  @param {Number} id - The position within the list of articles for this publication.
*  @param {String[]} uris - An associative array of URIs (required original, retrieve, citation, display, local)
*
*  @param {String} [section] - The section of the publication in which the article appeared.
*  @param {String} [title] - The title of the article.
*  @param {String[]} [authors] - The author(s) that wrote the article.
*  @param {String} [byline] - A byline featuring the names of the authors.
*  @param {Cheerio} [dom] - The DOM of the article.
*  @param {String} [content] - The content of the article (in HTML).
*/
function Article(publication, id, uris, section, title, authors, byline, dom, content) {
    this.publication = publication;
    this.id = id;
    this.uris = uris;

    this.section = section;
    this.title = title;
    this.authors = authors;
    this.byline = byline;
    this.dom = dom;
    this.content = content;
}

/*
*  @method setDOM
*
*  @param {String} html - The HTML for the article.
*
*  This function sets the this.dom variable using cheerio.js.
*/
Article.prototype.setDOM = function(html) {
    this.dom = Cheerio.load(html);
};

/*
*  @method cache
*
*  This function saves the article page to the publication's directory inside the output directory. The page
*  is generated based on the article.html.mustache template in templates/.
*/
Article.prototype.cache = function() {
    if (!FS.existsSync(this.publication.output_dir + '/' + this.publication.slug)) { FS.mkdirSync(this.publication.output_dir + '/' + this.publication.slug); }

    var prev = (this.id > 0) ? this.publication.articles[this.id - 1].uris.local : null;
    var next = (this.id + 1 <  this.publication.articles.length) ? this.publication.articles[this.id + 1].uris.local : null;
    var template = FS.readFileSync(this.publication.template_dir + '/article.html.mustache', { encoding: "utf-8" });
    var output = Mustache.render(template, { publication: this.publication, article: this, index: '/' + this.publication.slug + '/', prev: prev, next: next });
    FS.writeFileSync(this.publication.output_dir + this.uris.local, output);
}

/*
*  @method extractSection
*
*  This function extracts the section from the webpage.
*/
Article.prototype.extractSection = function() {
    this.section = ''; // TODO: Complete this function to properly retrieve this information.
};

/*
*  @method extractTitle
*
*  This function extracts the title from the webpage.
*/
Article.prototype.extractTitle = function() {
    this.title = ''; // TODO: Complete this function to properly retrieve this information.
};

/*
*  @method extractAuthors
*
*  This function extracts the authors from the webpage.
*/
Article.prototype.extractAuthors = function() {
    this.authors = []; // TODO: Complete this function to properly retrieve this information.
    this.byline = ''; // TODO: Complete this function to properly retrieve this information.
};

/*
*  @method extractContent
*
*  This function extracts the content from the webpage.
*/
Article.prototype.extractContent = function() {
    this.content = ''; // TODO: Complete this function to properly retrieve this information.
};

module.exports = Article;