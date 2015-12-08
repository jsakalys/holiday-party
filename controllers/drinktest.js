var $ = require('cheerio')
var request = require('request')
var express = require('express');
var Item = require('../models/item');
var router = express.Router();    

router.get("/", function(req, res) {
    var searchURL = "http://allrecipes.com/recipes/933/holidays-and-events/christmas/drinks/";
    request(searchURL, function (err, resp, html){
        if(!err && resp.statusCode == 200) {
            var parsedHTML = $.load(html);
            var recipes = parsedHTML("body").find(".grid-col--fixed-tiles"); // .salvattore-grid
            if (recipes.length) {
                var recipe;
                for (var i=0;i<recipes.length;i++) {
                    recipe = $(recipes[i]);
                    var name = recipe.children().attr("data-name");
                    if (name){
                        name = name.slice(1,name.length-1);
                    }
                    var permalink = 'http://allrecipes.com' + recipe.find("a").attr("href");
                    var description = recipe.find(".grid-col__rec-image").attr("alt");
                    var img = recipe.find(".grid-col__rec-image").attr("data-original-src");
                    if (name && permalink && description && img) {
                        Item.create({
                            type: 'drink',
                            name: name,
                            permalink: permalink,
                            description: description,
                            img: img
                        });
                    };
                };
                res.send({
                    type: 'drink',
                    name: name,
                    permalink: permalink,
                    description: description,
                    img: img
                })
            }

        }
    })
});

module.exports = router;