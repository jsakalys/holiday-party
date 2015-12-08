var $ = require('cheerio')
var request = require('request')
var express = require('express');
var Item = require('../models/item');
var router = express.Router();    

router.get("/", function(req, res) {
    var searchURL = "http://www.marthastewart.com/1129106/super-easy-christmas-cookie-recipes/@center/276951/christmas-cookies";
    request(searchURL, function (err, resp, html){
        if(!err && resp.statusCode == 200) {
            var parsedHTML = $.load(html);
            var recipes = parsedHTML("body").find(".gallery-slide");
            if (recipes.length) {
                var recipe;
                for (var i=0;i<recipes.length;i++) {
                    recipe = $(recipes[i]);
                    var name = recipe.find(".gallery-slide-title").text();
                    var permalink = recipe.find(".gallery-slide-cta").children().length;
                    var description = recipe.find(".gallery-slide-dek p").text();
                    var img = recipe.find(".gallery-slide-image").attr("src");
                    Item.create({
                        type: 'cookie',
                        name: name,
                        permalink: permalink,
                        description: description,
                        img: img
                    });
                };
                res.send({
                    type: 'cookie',
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