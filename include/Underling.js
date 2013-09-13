/*
*  Underling.js
*
*  @requires fs
*  @requires ncp
*  @requires request
*
*  The Underling class retrieves the information from each of the publication websites and saves it locally in the
*  output directory.
*/

var FS = require('fs');
var NCP = require('ncp');
var Path = require('path');
var Request = require('request');

/*
*  @class Underling
*
*  @param {string} output_dir - The output directory (defaults to 'output').
*  @param {string} template_dir - The template directory (defaults to 'templates').
*  @param {string} assets_slug - The assets slug (defaults to 'assets').
*/

function Underling(output_dir, template_dir, assets_slug) {
    var path = Path.join(__dirname, '..');
    this.publications = require('./../publications/publications.js');
    this.output_dir = (output_dir) || 'output';
    this.output_dir = path + '/' + this.output_dir;
    this.template_dir = (template_dir) || 'templates';
    this.template_dir = path + '/' + this.template_dir;
    this.assets_slug = (assets_slug) || 'assets';
};

/*
*  @method retrieve
*
*  This function: (1) imports an array of Publication objects defined in the publications/ directory; (2) loops over
*  each instance; (3) extracts the articles from a table of contents webpage; (4) outputs an index page;
*  (5) loops over each article; (6) extracts the content from the article webpage; and (7) outputs an article page.
*/
Underling.prototype.retrieve = function() {
    var output_dir = this.output_dir;
    var template_dir = this.template_dir;

    this.publications.forEach(function(publication) {
        Request(publication.uris.toc, function(error, response, body) {

            if (!error && response.statusCode == 200) {
                publication.setDirectories(output_dir, template_dir); // TODO: Use .bind() on Request to avoid this issue.
                publication.setDOM(body);
                publication.extractDate();
                publication.extractArticles();
                publication.cache(); // Save the publication to 'output/<publication.slug>/index.html'.

                publication.articles.forEach(function(article) {
                    Request(article.uris['retrieve'], function(error, response, body) {

                        if (!error && response.statusCode == 200) {
                            article.setDOM(body);
                            article.extractContent();
                            article.cache(); // Save the article to 'output/<publication.slug>/<SuperString(article.title).slugify>.html'.
                        } else { // TODO: Write better error handling.
                            console.log('Error ' + response.statusCode + ': There was an error retrieving the content for the article "' + article.title +'" in ' + publication.name + '.');
                        }
                    }).setMaxListeners(200);
                });
            } else { // TODO: Write better error handling.
                console.log('Error ' + response.statusCode + ': There was an error retrieving the TOC for ' + publication.name + '.');
            }
        });
    });
};

/*
*  @method setup
*
*  This function deletes the existing output directory (including all files) and recreates it ready for retrieval.
*/
Underling.prototype.setup = function() {

    removeDir = function(dirPath) {

        try { var files = FS.readdirSync(dirPath); }
        catch(e) { return; }

        if (files.length > 0) {

            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];

                if (FS.statSync(filePath).isFile()) {
                    FS.unlinkSync(filePath);
                } else {
                    removeDir(filePath);
                }
            }
        }

        FS.rmdirSync(dirPath);
    };

    removeDir(this.output_dir);

    if (!FS.existsSync(this.output_dir)) { FS.mkdirSync(this.output_dir); }

    NCP(this.template_dir + '/' + this.assets_slug, this.output_dir + '/' + this.assets_slug, function(err) {});
};

module.exports = Underling;