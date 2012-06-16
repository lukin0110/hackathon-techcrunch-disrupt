var MS = MS || {};


MS._resultToLoad = 0;


/**
 * @private
 */
MS._load = function()
{
    //1. Initializing the MusicScanner Div
    var div = MS.ensureDiv("_MusicDiscovery");
    div.innerHTML = '<div class="MusicDiscoveryInner" id="_MusicDiscoveryInner">'
        + '<p class="MusicDiscoveryLoading" id="_MusicDiscoveryLoading">Loading ...</p>'
        //+ '<div class="MusicDiscoveryThanks">Thanks to ...<ul style="margin-left:20px"><li><a href="http://www.face.com" target="_blank">face.com</a></li><li><a href="http://www.echonest.com" target="_blank">echonest.com</a></li></ul></div>'
        + '</div>';

    //2. Ensure the popup
    var divPopup = MS.ensureDiv("_MusicPopup");
    divPopup.innerHTML = '<div class="MusicPopupContent">'
        + '<a href="javascript:void(0);" id="_MusicPopupClose" class="MusicPopupClose">Close</a>'
        + '<div id="_MusicPopupContainer"></div></div>';

    $("#_MusicPopupClose").click(function(){
        $('#_MusicOverlay').hide();
        $('#_MusicPopup').hide();
    });

    //3. By default hide the popup
    $(divPopup).hide();
};


/**
 * http://assets.rollingstone.com/assets/images/video/eddie-vedder-and-jimmy-fallon-balls-in-your-mouth-20110909/square.jpg
 *
 * @private
 */
MS._scanImages = function()
{
    var allstr = "";
    var url_array = new Array();
    var current_str = "";
    var current_first = true;
    var counter = 0;


    jQuery.each($("img"), function(i, val)
    {
        var src = val.getAttribute("src");

        if(MS._isValidImageSource(src))
        {
            MS.log(" " + i + ", " + val + ", " + val.getAttribute("src"));

            if(!current_first)
            {
                current_str += ",";
            }

            allstr += src;
            current_str += src;
            current_first = false;
            counter++;

            if(counter>12)
            {
                url_array.push(current_str);
                current_str="";
                current_first=true;
                counter=0;
            }
        }
    });

    if(counter!=13 && counter!=0)
    {
        url_array.push(current_str);
    }

    MS._resultToLoad = url_array.length;


    //Fetch all the urls
    //http://api.face.com/faces/recognize.json?api_key=4b4b4c6d54c37&api_secret=&urls=http://farm3.static.flickr.com/2527/3942842476_33341616f2_b.jpg&uids=friends@facebook.com&user_auth=fb_user:571756321,fb_session:
    for(var j=0;j<url_array.length;j++)
    {
        var urls = url_array[j];
        MS._scanImageUrls(urls, j);
    }
};


/**
 *
 * @param urls
 */
MS._scanImageUrls = function(urls, index)
{
    var url = 'http://api.face.com/faces/recognize.json?api_key=' + MS.facePublicKey
        + '&api_secret=' + MS.faceSecretKey
        + '&urls=' + urls
        + '&uids=all@maarten';

    $.getJSON(url, function(data){
        MS.log("Flow " + index + " = " + JSON.stringify(data));

        if(data["status"]!="success")
        {
            MS.log("BIG FAT ERROR: could not handle the given url");
        }
        else
        {
            MS._handleResult(data);
        }
    });
};


/**
 *
 * @param src
 */
MS._isValidImageSource = function(src)
{
    try
    {
        if (src.indexOf("http") > -1 && src.indexOf("doubleclick") === -1 && src.indexOf("&") === -1 && src.indexOf("?") === -1)
        {
            return true;
        }
    }
    catch(e)
    {
        // void
    }

    return false;
};


/**
 *
 * @param json
 */
MS._handleResult = function(json)
{
    var array = json["photos"];
    MS._resultToLoad--;

    for(var i=0;i<array.length;i++)
    {
        var photo = array[i];
        var tags = array[i]["tags"];

        for(var j=0;j<tags.length;j++)
        {
            var tag = tags[j];
            var uids = tags[j]["uids"];

            for(var k=0;k<uids.length;k++)
            {
                var uid = uids[k]["uid"];
                //var _name = MS.getItem(uid);
                var _arr = uid.split("@");
                //var _name = MS.musicMap[uid];
                var _name = MS.getItem(uid);

                if(_name != undefined)
                {
                    MS.log("Winner = " + uid + ", " + MS.musicMap[_arr[0]]);
                    var src = photo["url"];

                    var _width = photo["width"]/100 * tag["width"];
                    var _height = photo["height"]/100 * tag["width"];

                    var _top = (photo["height"]/100 * tag["center"]["y"]) - (_height/2);
                    var _left = (photo["width"]/100 * tag["center"]["x"]) - (_width/2);
                    var _factor = 50/_width;

                    MS.log("Coords = (" + _width + ", " + _height + ", " + _factor + ")");

                    var _id = "_azerty_" + new Date().getTime();
                    var html = '<div class="clearfix">'
                        + '<div class="left" style="width:50px;height:50px;overflow:hidden;margin-right:10px;">'
                        +       '<a href="javascript:void(0);" id="' + _id + '"><img src="' + src + '" width="' + (photo["width"]*_factor) + '" style="margin-top:-' + (_top*_factor) + 'px;margin-left:-' + (_left*_factor) + 'px;"/></a>'
                        + '</div>'
                        + '<div class="left MusicDiscoveryArtistMeta" id="_MusicDiscoveryArtistMeta_' + _id + '"><h2>' + _name + '</h2></div>'
                        + '</div>'
                        + '<div class="MusicDiscoveryArtist" id="_MusicDiscoveryArtist_' + _id + '"></div>';

                    $(html).insertBefore("#_MusicDiscoveryLoading");

                    $("#" + _id).click(function(){
                        var _src = $(this).find("img")[0].getAttribute("src");
                        $("#_MusicPopupContainer").html('<img src="' + _src + '"/>');
                        var left = ($(window).width()-$('#_MusicPopup').width())/2;
                        var top = ($(window).height()-$('#_MusicPopup').height())/6;
                        $('#_MusicPopup').css('left',left + 'px');
                        $('#_MusicPopup').css('top',top + 'px');
                        $('#_MusicPopup').show();
                    });

                    //Load the info from Echo Nest, profile, similar, etc ...
                    MS._loadInfo(_name, _id);
                }
            }
        }
    }

    if(MS._resultToLoad===0)
    {
        $("#_MusicDiscoveryLoading").remove();
    }
};


/**
 * http://developer.echonest.com/api/v4/artist/search?api_key=N6E4NIOVYMTHNDM8J&format=json&name=eddie%20vedder&results=1
 * {"response": {"status": {"version": "4.2", "code": 0, "message": "Success"}, "artists": [{"name": "Eddie Vedder", "id": "AR3RK011187FB3CE3B"}]}}
 *
 *
 */
MS._loadInfo = function(artist, divId)
{
    var url = "http://developer.echonest.com/api/v4/artist/search?api_key=" + MS.echoNestKey + "&format=json&name=" + artist + "&results=1";

    try
    {
        $.getJSON(url, function(data)
        {
            MS.log(JSON.stringify(data));
            var _echoNestId = data["response"]["artists"][0]["id"];
            var _profileUrl = "http://developer.echonest.com/api/v4/artist/profile?api_key=" + MS.echoNestKey + "&id=" + _echoNestId + "&bucket=songs&bucket=urls&bucket=terms&format=json";
            //http://developer.echonest.com/api/v4/artist/profile?api_key=N6E4NIOVYMTHNDM8J&id=ARH6W4X1187B99274F&bucket=songs&bucket=urls&bucket=terms&format=json

            $.getJSON(_profileUrl, function(data)
            {
                //id="_MusicDiscoveryArtist_' + _id + '"
                MS.log("Profile = " + JSON.stringify(data));
                var artist = data["response"]["artist"];
                var _done = {};
                var _counter = 0;
                var _str = "<ul>";

                for(var i=0;i<artist["songs"].length && _counter<3;i++)
                {
                    var _title = artist["songs"][i]["title"];

                    if(!_done[_title])
                    {
                        _str += "<li>" + _title + "</li>";
                        _done[_title] = true;
                        _counter++;
                    }
                }
                $("#_MusicDiscoveryArtist_" + divId).html(_str);

                var _meta = '<p><a target="_blank" href="' + artist["urls"]["lastfm_url"] + '">Last.fm</a> - <a target="_blank" href="' + artist["urls"]["wikipedia_url"] + '">Wikipedia</a></p>';
                $("#_MusicDiscoveryArtistMeta_" + divId).append(_meta);


                var _terms = '<p style="width:220px;overflow:hidden;">';

                for(var j=0;j<artist["terms"].length && j<4;j++)
                {
                    var _term = artist["terms"][j]["name"];
                    _terms += _term + ", ";
                }

                _terms += "</p>";
                $("#_MusicDiscoveryArtistMeta_" + divId).append(_terms);
            });
        });
    }
    catch(e)
    {
        MS.log("BIG FAT ERROR: could not load Echo Nest Information");
    }
};



/**
 * This method recieves message from the background page.
 * It invokes a full page scan or a single scan on an image
 *
 *     //2. Scan the images
 *     MS._scanImages();
 */
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse)
    {
        if(request["type"] === "all")
        {
            try
            {
                MS._load();
                MS._scanImages();
            }
            catch(e)
            {
                alert("Error loading: " + e);
            }
        }
        else if(request["type"] === "image")
        {
            try
            {
                var url = request["url"];
                MS._resultToLoad = 1;

                MS._load();
                MS._scanImageUrls(url, 0);
            }
            catch(e)
            {
                alert("Error loading: " + e);
            }
        }
    }
);





/*
{"response": {"status": {"version": "4.2", "code": 0, "message": "Success"},
"artist": {
"songs": [{"id": "SOHJOLH12A6310DFE5", "title": "Karma Police"}, {"id": "SOPQLBY12A6310E992", "title": "Creep"}, {"id": "SOIPLPY1316771418D", "title": "Creep"}, {"id": "SOAROML1316771494B", "title": "Creep"}, {"id": "SOHVYYK13167714710", "title": "Paranoid Android"}, {"id": "SOCXYSG12A6310DFE1", "title": "Paranoid Android"}, {"id": "SOVRMZV13167715633", "title": "No Surprises"}, {"id": "SOMMDKV1307A43581F", "title": "Lotus Flower"}, {"id": "SOXZVWD1316771449E", "title": "Fake Plastic Trees"}, {"id": "SOFLDOK12A8C13E8F7", "title": "Fake Plastic Trees"}, {"id": "SORMEZZ12B0B80619B", "title": "High & Dry"}, {"id": "SODJXJY12AB018257D", "title": "High And Dry"}, {"id": "SOSMSCH12AB017D60A", "title": "Reckoner [Backing Vocals Stem]"}, {"id": "SOMSLUW12AB017D615", "title": "Reckoner [Guitars Stem]"}, {"id": "SOCRPLE12AB017D618", "title": "Reckoner [Lead Vocal Stem]"}],
"terms": [{"frequency": 0.9999727597795328, "name": "british pop", "weight": 1.0}, {"frequency": 0.9999727597795328, "name": "experimental rock", "weight": 0.987092193588624}, {"frequency": 1.0, "name": "rock", "weight": 0.7878709820820097}, {"frequency": 0.7210381064764432, "name": "england", "weight": 0.7592040355748003}, {"frequency": 0.6110972184660562, "name": "indietronica", "weight": 0.687349294075432}, {"frequency": 0.3648955753286865, "name": "grunge", "weight": 0.46397766647045874}, {"frequency": 0.4989105756117072, "name": "electronica", "weight": 0.4552764050556908}, {"frequency": 0.46036978789087774, "name": "alternative rock", "weight": 0.449490155621854}, {"frequency": 0.5301639348217853, "name": "electronic", "weight": 0.445329932970891}, {"frequency": 0.47573770357138634, "name": "jazz", "weight": 0.4426511844827473}, {"frequency": 0.4185677470041126, "name": "experimental", "weight": 0.39742358568051755}, {"frequency": 0.3609995703284514, "name": "acoustic", "weight": 0.3973636958766076}, {"frequency": 0.2680300005660414, "name": "political", "weight": 0.39175816130245145}, {"frequency": 0.20631634080489106, "name": "heavy", "weight": 0.38420198789361926}, {"frequency": 0.41399649026456015, "name": "alternative", "weight": 0.3706825114094805}, {"frequency": 0.29059786063498766, "name": "guitar", "weight": 0.3704097067815496}, {"frequency": 0.26515999836032417, "name": "beautiful", "weight": 0.3702030690452318}, {"frequency": 0.27598538309377113, "name": "piano", "weight": 0.365800783795113}, {"frequency": 0.32557560798490615, "name": "instrumental", "weight": 0.3495061109612721}, {"frequency": 0.38530825664522855, "name": "pop", "weight": 0.34936624353270335}, {"frequency": 0.2885418844806437, "name": "classical", "weight": 0.34877579042063767}, {"frequency": 0.15132304669695382, "name": "epic", "weight": 0.34456217387563925}, {"frequency": 0.0954742125621912, "name": "contemporary classical music", "weight": 0.31328137438303877}, {"frequency": 0.0954742125621912, "name": "orchestra", "weight": 0.31328137438303877}, {"frequency": 0.17664828411168879, "name": "composer", "weight": 0.3115409189837443}, {"frequency": 0.07566152334847691, "name": "solo", "weight": 0.2982390697287356}, {"frequency": 0.07566152334847691, "name": "emotional", "weight": 0.2982390697287356}, {"frequency": 0.1711357359106681, "name": "mellow", "weight": 0.29819986846791124}, {"frequency": 0.19512364807279647, "name": "country", "weight": 0.29793239467983545}, {"frequency": 0.2772263191263076, "name": "ambient", "weight": 0.29781687298279474}, {"frequency": 0.15132304669695382, "name": "dark", "weight": 0.29644028978803727}, {"frequency": 0.2027837671836466, "name": "noise", "weight": 0.2959954861071877}, {"frequency": 0.29734577983387656, "name": "indie", "weight": 0.27702000872581856}, {"frequency": 0.26660994847285935, "name": "punk", "weight": 0.2761395728846958}, {"frequency": 0.07566152334847691, "name": "progressive rock", "weight": 0.18222421674201764}], "id": "ARH6W4X1187B99274F",
"urls": {"lastfm_url": "http://www.last.fm/music/Radiohead", "aolmusic_url": "http://music.aol.com/artist/radiohead/biography", "myspace_url": "http://www.myspace.com/radiohead", "amazon_url": "http://www.amazon.com/gp/search?ie=UTF8&keywords=Radiohead&tag=httpechonecom-20&index=music", "wikipedia_url": "http://en.wikipedia.org/wiki/Radiohead", "itunes_url": "http://itunes.com/Radiohead", "mb_url": "http://musicbrainz.org/artist/a74b1b7f-71a5-4011-9441-d0b5e4122711.html"}, "name": "Radiohead"}}}
 */









/*

{
    no_training_set: [
      "345252654@facebook.com",
      "3123414633634@facebook.com"
    ]
    photos: [
        {
            url: "http://farm3.static.flickr.com/2527/3942842476_33341616f2_b.jpg",
            pid: "F@2f9d1c8f44d03e82367d7d8737556342_4b4b4c6d54c37",
            width: 1024,
            height: 680,
            tags: [
                {
                    tid: "TEMP_F@2f9d1c8f44d03e82367d7d8737556342_4b4b4c6d54c37_44.53_42.06_2",
                    threshold: 60,
                    uids: [
                        {
                            uid: "571756321@facebook.com",
                            confidence: 97
                        },
                        {
                            uid: "812697177@facebook.com",
                            confidence: 23
                        },
                        {
                            uid: "749410444@facebook.com",
                            confidence: 21
                        },
                        ...
                    ],
                    label: "",
                    confirmed: false,
                    manual: false,
                    width: 6.84,
                    height: 10.29,
                    center: {
                        x: 44.53,
                        y: 42.06
                    },
                    eye_left: {
                        x: 43.38,
                        y: 40.84
                    },
                    eye_right: {
                        x: 45.77,
                        y: 40.97
                    },
                    mouth_left: {
                        x: 43.42,
                        y: 44.74
                    },
                    mouth_center: {
                        x: 44.74,
                        y: 45.23
                    },
                    mouth_right: {
                        x: 45.78,
                        y: 44.7
                    },
                    nose: {
                        x: 45.15,
                        y: 43.42
                    },
                    yaw: 42.48,
                    roll: 2.07,
                    pitch: -3.71,
                    attributes: {
                        gender: {
                            value: "male",
                            confidence: 34
                        },
                        glasses: {
                            value: "false",
                            confidence: 95
                        },
                        smiling: {
                            value: "true",
                            confidence: 61
                        }
                    }
                }
            ]
        }
    ],
    status: "success",
    usage: {
      used: 1,
      remaining: 199,
      limit: 200,
      reset_time_text: "Wed, 03 Mar 2010 13:46:40 +0000",
      reset_time: "1267624000"
   }
}

    */