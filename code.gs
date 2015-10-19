// config
var ACC_TOKEN = "<Your Personal access tokens>";
var OWNER = "<ORGANISATION>";
var REPO = "<REPOSITORY>";


function sendHttpPost(issue_data) {  
  var raw_payload = {
    "title": issue_data.title, 
    "body" : issue_data.body +"\n\nwritten by "+ issue_data.owner
  }

  var payload = JSON.stringify(raw_payload);
      
  var options =
      {
        "method" : "POST",
        "payload" : payload
      };
  
  var x = UrlFetchApp.fetch("https://api.github.com/repos/"+OWNER+"/"+REPO+"/issues?access_token="+ACC_TOKEN, options);
  return '{"thank you"}'
}


function makeResponse(e, type){
  var s  = JSON.stringify({type: type, params: e});
  Logger.log(s);
  
  var ret = e.parameter.text.split(" ")
  var ret_hash = {
    "title": ret[0],
    "body":  ret[1],
    "owner": e.parameter.user_name
  }
                  
  return ret_hash
}

function doGet(e) {
  return sendHttpPost( makeResponse(e, "GET") );
}
function doPost(e) {
  return sendHttpPost( makeResponse(e,"POST") );
}
