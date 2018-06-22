var Profile = require("./profile.js");
var renderer = require('./renderer.js');
const querystring = require('querystring');
var commonHeaders = {'Content-Type': 'text/plain'};

// Handle http route GET / and POST / i.e. home
function home(request, response) {
    // if url == "/" && GET
    if(request.url === "/") {
        if(request.method.toLowerCase() === 'get') {
            //show search
            response.setHeader('Content-Type', 'text/html');
            renderer.view('header', {}, response);
            renderer.view('search', {}, response);
            renderer.view('footer', {}, response);
            response.end();
        } else {
            // if url == "/" && Post
            // get the post data from body
            request.on("data", function(postBody) {
                var body = "" + postBody;
                // extract the username
                var query = querystring.parse(postBody.toString());
                response.writeHead(303, {"Location": "/" + query.username });
                response.end();
                //redirect to /:username
            })
        }
    }
}

// Handle http route get /:username i.e. /chalkers
function user(request, response) {
    //if url == "/..."
    var username = request.url.replace("/","");
    if(username.length > 0) {
        response.setHeader('Content-Type', 'text/html');
        renderer.view('header', {}, response);

        //get json from treehouse
        var studentProfile = new Profile(username);
        //on "end"
        studentProfile.on("end", function(profileJSON) {
            //show profile

            //Store the values which we need
            var values = {
                avatarUrl: profileJSON.gravatar_url,
                username: profileJSON.profile_name,
                badges: profileJSON.badges.length,
                javascriptPoints: profileJSON.points.JavaScript
            }
            // simple response
            renderer.view('profile', values, response);
            renderer.view('footer', {}, response);
            response.end();
        });  

        //on error
        studentProfile.on("error", function(error){
            //show error
            renderer.view('error', {errorMessage: error.message}, response);
            renderer.view('search', {}, response);
            renderer.view('footer', {}, response);
            response.end();
        });
    }
}

module.exports.home = home;
module.exports.user = user;