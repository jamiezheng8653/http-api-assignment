const http = require('http');
//to parse query strings from url
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//recompile the body of a request, then calsl the appropriate handler once complete
const parseBody = (request, response, handler) => {
    //store request packets
    const body = [];

    //reassemble body from packets 
    //Error handling
    request.on('error', (err) => {
        console.dir(err);
        response.statusCode = 400;
        response.end();
    });

    //when a piece of the body is recieved, add to body array. 
    // packets will always arrive in the correct order
    request.on('data', (chunk) => {
        body.push(chunk);
    });

    //when all parts of the request are recieved, 
    // combine all array elements in body into one object 
    // and stringify it. Parse the content according to header type
    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const type = request.headers['content-type'];
        if(type === 'application/x-www-form-urlencoded'){
            request.body = query.parse(bodyString);
        }
        else if (type === 'application/json'){
            request.body = JSON.parse(bodyString);
        }
        else{
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({error: 'invalid data format'}));
            return response.end();
        }

        //call handler function. Proceed like a GET request
        handler(request, response);
    });
};

//handle POST requests
const handlePost = (request, response, parsedUrl) => {
    //parse according to reflective handler function
    switch(parsedUrl.pathname){
        case '/style.css':
            parseBody(request, response, htmlHandler.getCSS);
            break;
        case '/success':
            parseBody(request, response, jsonHandler.success);
            break;
        case '/badRequest':
            parseBody(request, response, jsonHandler.badRequest);
            break;
        case '/unauthorized':
            parseBody(request, response, jsonHandler.unauthorized);
            break;
        case '/forbidden':
            parseBody(request, response, jsonHandler.forbidden);
            break;
        case '/internal':
            parseBody(request, response, jsonHandler.internal);
            break;
        case '/notImplemented':
            parseBody(request, response, jsonHandler.notImplemented);
            break;
        case '/':
            parseBody(request, response, htmlHandler.getIndex);
            break;
        //case notFound:
        default:
            parseBody(request, response, jsonHandler.notFound);
            break;
    }
};

//handle GET requests
const handleGet = (request, response, parsedUrl, type = null, valid = null, loggedIn = null) => {
    //route to correct method based on url or selected type
    switch(parsedUrl.pathname){
        case '/style.css':
            htmlHandler.getCSS(request, response);
            break;
        case '/success':
            jsonHandler.success(request, response, type);
            break;
        case '/badRequest':
            jsonHandler.badRequest(request, response, type, valid);
            break;
        case '/unauthorized':
            jsonHandler.unauthorized(request, response, type, loggedIn);
            break;
        case '/forbidden':
            jsonHandler.forbidden(request, response, type);
            break;
        case '/internal':
            jsonHandler.internal(request, response, type);
            break;
        case '/notImplemented':
            jsonHandler.notImplemented(request, response, type);
            break;
        case '/':
            htmlHandler.getIndex(request, response);
            break;
        //case notFound:
        default:
            jsonHandler.notFound(request, response, type);
            break;
    }

}

const urlStruct = {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/success': jsonHandler.success,
    '/badRequest': jsonHandler.badRequest,
    '/unauthorized': jsonHandler.unauthorized,
    '/forbidden': jsonHandler.forbidden,
    '/internal': jsonHandler.internal,
    '/notImplemented': jsonHandler.notImplemented,
    notFound: jsonHandler.notFound,
};

// Handle requests
const onRequest = (request, response) => {
    //parse information from the url
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    //check if the method was POST
    if(request.method === 'POST'){
        handlePost(request, response, parsedUrl);
    }
    //else assume GET
    else {
        handleGet(request, response, parsedUrl);
    }

    //route based on the path that the user went to
    if (urlStruct[parsedUrl.pathname]){
        return urlStruct[parsedUrl.pathname](request, response);
    };

    return urlStruct.notFound(request, response);
};

//start server
http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1: ${port}`);
});