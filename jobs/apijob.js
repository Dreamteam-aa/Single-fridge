axios.get("https://test-es.edamam.com/search?q=tomate,pan&app_id=3fa5082a&app_key=3293e695ea7945afe407438a27f2f775")
          .then(response => {
              /*
            res.render('recipes/resultsapi', {
                recipes: response.data.recipes
            });
            */
           console.log(response.data);
          })
          .catch(function (error) {
            console.log(error)
            next(error);
});