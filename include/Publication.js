/*
*  Publication.js
*
*  @requires cheerio
*  @requires fs
*  @requires mustache
*  @requires string
*
*  The Publication class represents a publication. It can be either called on its own or extended.
*/

var Cheerio = require('cheerio');
var FS = require('fs');
var Mustache = require('mustache');
var SuperString = require('string');

/*
*  @class Publication
*
*  @param {String} name - The name of the publication.
*  @param {String[]} uris - An associative array of uris (required home, toc and local).
*  @param {String} slug - The slug name for the publication (used for directory inside output directory).
*  @param {String[]} included_sections - Array of sections that should be included.
*
*  @param {String} [date] - The date of this issue of the publication.
*  @param {Cheerio} [dom] - The DOM of the table of contents.
*  @param {Article[]} [articles] - An array of the Article objects.
*  @param {String[]} [links] - An array of the URIs for the articles.
*  @param {String} [output_dir] - The output directory.
*  @param {String} [template_dir] - The template directory.
*/
function Publication(name, uris, slug, included_sections, output_dir, template_dir, date, dom, articles, links, output_dir, template_dir) {
    this.name = name;
    this.uris = uris;
    this.slug = slug;
    this.included_sections = included_sections;

    this.date = date;
    this.dom = dom;
    this.articles = articles;
    this.links = links;
    this.output_dir = output_dir;
    this.template_dir = template_dir;
};

/*
*  @method setOutput
*
*  @param {String} output_dir - The output directory.
*  @param {String} template_dir - The template directory.
*
*  This function sets the output directory for the publication.
*/
Publication.prototype.setDirectories = function(output_dir, template_dir) {
    this.output_dir = output_dir;
    this.template_dir = template_dir;
}

/*
*  @method setDOM
*
*  @param {String} html - The HTML for the table of contents web page.
*
*  This function sets the this.dom variable using cheerio.js.
*/
Publication.prototype.setDOM = function(html) {
    this.dom = Cheerio.load(html);
};

/*
*  @method cache
*
*  This function saves an index page to the publication's directory inside the output directory. Articles are
*  sorted based on whether they are in a section or not. Articles which are not in a section are added to the
*  no_sections object and articles which are in a sections are added to the sections object. The index page is
*  generated based on the index.html.mustache template in templates/.
*/
Publication.prototype.cache = function() {

    if (!FS.existsSync(this.output_dir + '/' + this.slug)) { FS.mkdirSync(this.output_dir + '/' + this.slug); } // TODO: Throw error if output_dir not set.

    var sections = [];
    var no_sections = [];
    var lookup = [];

    for (var i = 0, j = 0, index = 0, len = this.articles.length; i < len; i++) {
        var article = this.articles[i];

        if (article.section) {

            if (lookup[article.section] === undefined) {
                lookup[article.section] = j;
                j++;
                sections.push({ title: article.section, articles: [] });
            }

            index = lookup[article.section];
            sections[index].articles.push(article);
        } else {
            no_sections.push(article);
        }
    }

    var template = FS.readFileSync(this.template_dir + '/contents.html.mustache', { encoding: "utf-8" });
    var output = Mustache.render(template, { publication: this, no_sections: no_sections, sections: sections });
    FS.writeFileSync(this.output_dir + '/' + this.slug + '/index.html', output);
};

/*
*  @method extractDate
*
*  This function extracts the date for this issue of the publication.
*/
Publication.prototype.extractDate = function() {
    this.date = ''; // TODO: Complete this function to properly retrieve this information.
};

/*
*  @method extractLinks
*
*  @param {String[]} selectors - An array of CSS selectors.
*  @param {String[]} exclusions - An array of exclusions for excluding URIs from being included.
*
*  This function extracts the article URIs from the table of contents for this issue of the publication.
*  URIs are selected on the basis of running a search throught this.dom element for items that match the 
*  selectors provided. Searching this.dom is done using cheerio.js, so selectors should be in a format that 
*  it can understand. URIs that match one of the items inside the exclusions array are not selected.
*/
Publication.prototype.extractLinks = function(selectors, exclusions) {
    var links = [];

    for (var i = 0, len = selectors.length; i < len; i++) {
        elements = this.dom(selectors[i]).toArray();
        elements.forEach(function(element) {
            links.push(element.attribs.href); // TODO: Check the link against the items in the exclusions array.
        });
    }

    this.links = links;
};

module.exports = Publication;