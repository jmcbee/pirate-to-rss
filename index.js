'use strict';

var request = require('superagent');
var express = require('express');
var RSS = require('rss');
var util = require('util');
var cheerio = require('cheerio');
var md = require('marked');
var fs = require('fs');
var app = express();
var readme;

app
  .get('/', function(req, res, next) {
    if (readme) return res.send(readme);
    fs.readFile(__dirname + '/README.md', function(err, file) {
      if (err) return next(err);
      readme = '<!doctype html><html><head><link rel="stylesheet" ' +
               'href="//rawgit.com/sindresorhus/github-markdown-css/gh-pages/' +
               'github-markdown.css"><title>PirateBay Search to RSS</title>' +
               '</head><body class="markdown-body">' + md(file.toString()) +
               '</body></html>';
      res.send(readme);
    });
  })
  .get('/rss', generateRSS)
  .listen(process.env.PORT || 8080);

function generateRSS(req, res, next) {
  var query = req.param('q');
  if (!query) return res.status(400).end();

  request
    .get(util.format('https://thepiratebay.se/search/%s/0/7/0', query))
    .end(function(err, result) {
      var $, rss;
      if (err) return next(err);
      $ = cheerio.load(result.text);
      rss = new RSS({
        title: query,
        link: ''
      });
      $('#searchResult td:nth-child(2)').each(function() {
        var item = $(this);
        rss.item({
          title: item.find('.detName a').text(),
          url: item.children('a').attr('href')
        });
      });
      res.type('text/xml').send(rss.xml('  '));
    });
}
