//response with a json object
//takes request, response, status code and object to send
const responseJSON = (request, response, status, object) => {
    console.log(object);
    const content = JSON.stringify(object);

    //Headers to contain metadata
    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    };

    //send response with json object
    response.writeHead(status, headers);

    //Don't write the body when a HEAD request is made
    if(request.method !== 'HEAD') {
        response.write(content);
    }

    response.end();
};

//response with XML
const responseXML = (request, response, status, object) => {
    console.log(object);

    const headers = {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(object, 'utf8'),
    };

    //sent response with XML
    response.writeHead(status, headers);

    //don't write when a HEAD request is made
    if(request.method !== 'HEAD'){
        response.write(object);
    }

    response.end();
}

//404 not found requests with message
const notFound = (request, response, type = null) => {
    //create error message for response
    const json = {
        message: 'The page you are looking for was not found.',
        id: 'notFound',
    };
    const xml = '<response><message>The page you are looking for was not found</message><id>notFound</id></response>';

    //return 404 error message
    switch(type){
        case 'text/xml':
            responseXML(request, response, 404, xml);
            break;
        case 'application/json':
        default:
            responseJSON(request, response, 404, json);
            break;
    }
};

//200 success
const success = (request, response, type = null) => {
    const json = {
        message: 'This is a successful response'
    };
    const xml = '<response><message>This is a successful message</message></response>';

    switch(type){
        case 'text/xml':
            responseXML(request, response, 200, xml);
            break;

        case 'application/json':
        default:
            responseJSON(request, response, 200, json);
            break;    
    }
}

//badRequest error
const badRequest = (request, response, type = null, queryParameter = null) => {
    let statusCode;
    let json;
    let xml;
    //if missing the query parameter ?valid=true, status 400
    if (queryParameter) {
        json = {
            message: 'Missing valid query parameter set to true',
            id: 'badRequest',
        }
        xml = '<response><message>Missing valid query parameter set to true</message><id>badRequest</id></response>';
        statusCode = 400;
    }
    //if has query parameter ?valid=true, status 200
    else{
        json = {
            message: 'This request has the required parameters',
        }
        xml = '<response><message>This request has the required parameters</message></response>';
        statusCode = 200
    }

    switch(type){
        case 'text/xml':
            responseXML(request, response, statusCode, xml);
            break;

        case 'application/json':
        default:
            responseJSON(request, response, statusCode, json);
            break;    
    }

}

//unauthorized error 
const unauthorized = (request, response, type = null, queryParameter = null) => {
    let statusCode;
    let json;
    let xml;

    //if missing query parameter ?loggedIn=yes, status 401
    if (queryParameter) {
        json = {
            message: 'Missing loggedIn query parameter set to yes',
            id: 'unauthorized',
        }
        xml = '<response><message>Missing loggedIn queryParameter set to yet</message><id>unauthorized</id></response>';
        statusCode = 401;
    }
    //if has query parameter ?loggedIn=yes, status 200
    else{
        json = {
            message: 'You have successfully viewed the content',
        }
        xml = '<response><message>You have successfully viewed the content</message></response>';
        statusCode = 200
    }

    switch(type){
        case 'text/xml':
            responseXML(request, response, statusCode, xml);
            break;
        
        case 'application/json':
        default:
            responseJSON(request, response, statusCode, json);
            break;    
    }}

//forbidden error status 403
const forbidden = (request, response, type = null) => {
    //create error message for response
    const json = {
        message: 'You do not have access to this content',
        id: 'forbidden',
    };
    const xml = '<response><message>You do not have access to this content</message><id>forbidden</id></response>';


    //return error message
    switch(type){
        case 'text/xml':
            responseXML(request, response, 403, xml);
            break;

        case 'application/json':
        default:
            responseJSON(request, response, 403, json);
            break;
    }
}

//internal error status 500
const internal = (request, response, type = null) => {
    //create error message for response
    const json = {
        message: 'Internal server error, something went wrong.',
        id: 'internalError',
    };
    const xml = '<response><message>Internal server error, something went wrong</message><id>internalError</id></response>';


    //return error message
    switch(type){
        case 'text/xml':
            responseXML(request, response, 500, xml);
            break;

        case 'application/json':
        default:
            responseJSON(request, response, 500, json);
            break;    
    }
}

//notImplemented error status 501
const notImplemented = (request, response, type = null) => {
    //create error message for response
    const json = {
        message: 'A get request for this page has not been implemented yet. Check again later for updated content',
        id: 'notImplemented',
    };
    const xml = '<response><message>A get request for this page has not been implemented yet. Check again later for updated content</message><id>notImplemented</id></response>';


    //return error message
    switch(type){
        case 'text/xml':
            responseXML(request, response, 501, xml);
            break;

        case 'application/json':
        default:
            responseJSON(request, response, 501, json);
            break;
    }
}

//exports
module.exports = {
    notFound, 
    success, 
    badRequest, 
    unauthorized, 
    forbidden, 
    internal, 
    notImplemented
}