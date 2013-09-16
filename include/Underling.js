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
var Mustache = require('mustache');
var NCP = require('ncp');
var Path = require('path');
var Request = require('request');

/*
*  @class Underling
*
*  @param {String} [output_dir] - The output directory (defaults to 'output').
*  @param {String} [template_dir] - The template directory (defaults to 'templates').
*  @param {String} [assets_slug] - The assets slug (defaults to 'assets').
*/

function Underling(output_dir, template_dir, assets_slug) {
    var path = Path.join(__dirname, '..');
    this.publications = require('./../publications/publications.js');
    this.output_dir = (output_dir) || 'output';
    this.output_dir = path + '/' + this.output_dir;
    this.template_dir = (template_dir) || 'templates';
    this.template_dir = path + '/' + this.template_dir;
    this.assets_slug = (assets_slug) || 'assets';

    this.completed = 0;
};

/*
*  @method retrieve
*
*  This function: (1) imports an array of Publication objects defined in the publications/ directory; (2) loops over
*  each instance; (3) extracts the articles from a table of contents webpage; (4) outputs an index page;
*  (5) loops over each article; (6) extracts the content from the article webpage; and (7) outputs an article page.
*/
Underling.prototype.retrieve = function() {
    var underling = this;
    var num_completed = 0;

    this.publications.forEach(function(publication) {
        Request(publication.uris.toc, function(error, response, body) {

            if (!error && response.statusCode == 200) {
                publication.setDirectories(underling.output_dir, underling.template_dir);
                publication.setDOM(body);
                publication.extractDate();
                publication.extractArticles();
                publication.cache(); // Save the publication to 'output/<publication.slug>/index.html'.
                
                num_completed++;
                if (num_completed == underling.publications.length) { underling.cache(); }

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
*  @method cache
*  
*  This function creates an index for all the publications.
*/
Underling.prototype.cache = function() {
    if (!FS.existsSync(this.output_dir)) { FS.mkdirSync(this.output_dir + '/' + this.slug); } // TODO: Throw error if output_dir not set.

    var template = FS.readFileSync(this.template_dir + '/top.html.mustache', { encoding: "utf-8" });
    var output = Mustache.render(template, { publications: this.publications });
    FS.writeFileSync(this.output_dir + '/index.html', output);
}

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