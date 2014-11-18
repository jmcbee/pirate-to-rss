'use strict';

var request = require('superagent');
var express = require('express');
var RSS = require('rss');
var util = require('util');
var cheerio = require('cheerio');
var app = express();

app
  .get('/', function(req, res) {
    res.send('<h1>PirateBay Search to RSS</h1>');
  })
  .get('/rss', generateRSS)
  .listen(process.env.PORT || 8080);

function generateRSS(req, res) {
  var query = req.param('q');
  if (!query) return res.status(400).end();

  request
    .get(util.format('https://thepiratebay.se/search/%s/0/7/0', query))
    .end(function(err, result) {
      var $, rss;
      if (err) return console.log(err);
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
      res.send(rss.xml('  '));
    });
}
