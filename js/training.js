var MS = MS || {};
MS.training = MS.training || {};


MS.training._load = function()
{
    MS.log("Training day ...");

    //http://api.face.com/faces/train.json?api_key=4b4b4c6d54c37&api_secret=&uids=friends@facebook.com&callback_url=http://somecallback.face.com/
    var url = 'http://api.face.com/faces/train.json?api_key=' + MS.facePublicKey + '&api_secret=' + MS.faceSecretKey + '&uids=all@maarten&callback=http://musicscanner.appspot.com/trainingdone';

    $.getJSON(url, function(data){
        MS.log("faces.train = " + JSON.stringify(data));
    });
};


MS.training._load();


