var MS = MS || {};
MS.tag = MS.tag || {};


MS.tag._scannedImages = new Array();
MS.tag._currentIndex = 0;


MS.tag._loadTag = function()
{
    //1. Ensure the required div elements
    MS.ensureDiv("_MusicOverlay");
    var div = MS.ensureDiv("_MusicPopup");
    div.innerHTML = '<div class="MusicPopupContent">' +
        '<a href="javascript:void(0);" id="_MusicPopupClose" class="MusicPopupClose">Close</a>' +
        '<a href="javascript:void(0);" id="_MusicPopupPrevious" class="MusicPopupPrevious">Previous</a>' +
        '<a href="javascript:void(0);" id="_MusicPopupNext" class="MusicPopupNext">Next</a>' +
        '<div id="_MusicPopupContainer"></div></div>';

    //2. Attach close action
    $("#_MusicPopupClose").click(function(){
        $('#_MusicOverlay').hide();
        $('#_MusicPopup').hide();
    });

    //3. Attach previous action
    $("#_MusicPopupPrevious").click(function()
    {
        if(MS.tag._currentIndex>0)
        {
            MS.tag._currentIndex--;
            MS.tag._loadImage(MS.tag._currentIndex);
        }
        else
        {
            $('#_MusicOverlay').hide();
            $('#_MusicPopup').hide();
        }
    });

    //4. Attach next action
    $("#_MusicPopupNext").click(function()
    {
        if(MS.tag._currentIndex+1<MS.tag._scannedImages.length)
        {
            MS.tag._currentIndex++;
            MS.tag._loadImage(MS.tag._currentIndex);
        }
        else
        {
            $('#_MusicOverlay').hide();
            $('#_MusicPopup').hide();
        }
    });


    //5. Set the height & width of the page overlay
    $('#_MusicOverlay').css('height',$(document).height() + 'px');
    $('#_MusicOverlay').css('width',$(document).width() + 'px');

    //6. Placing the modal window
    var left = ($(window).width()-$('#_MusicPopup').width())/2;
    var top = ($(window).height()-$('#_MusicPopup').height())/6;
    $('#_MusicPopup').css('left',left + 'px');
    $('#_MusicPopup').css('top',top + 'px');

    //7. Show the divs anyway
    $('#_MusicOverlay').show();
    $('#_MusicPopup').show();
};


MS.tag._scanImages = function()
{
    jQuery.each($("img"), function(i, val)
    {
        var src = val.getAttribute("src");

        if(src.indexOf("http")>-1)
        {
            MS.tag._scannedImages.push(src);
        }
    });
};


MS.tag._loadImage = function(index)
{
    //1. Fetch the image
    var src = MS.tag._scannedImages[index];

    //2. Placing the image
    $("#_MusicPopupContainer").html('<div class="MusicPopupImg" id="_MusicPopupImg"><img id="_MusicPopupImgSrc" src="' + src + '"/></div>');

    //3. Fetching face.com info
    //   Calculating where the tag needs to be placed
    var url = "http://api.face.com/faces/detect.json?api_key=" + MS.facePublicKey + "&api_secret=" + MS.faceSecretKey+ "&urls=" + src;

    $.getJSON(url, function(data)
    {
        MS.log("faces.detect = " + JSON.stringify(data));

        try
        {
            var width = $("#_MusicPopupImgSrc").width();
            var height = $("#_MusicPopupImgSrc").height();
            MS.log("Img : (" + width + "," + height + ")");

            var tags = data["photos"][0]["tags"];

            for(var i=0;i<tags.length;i++)
            {
                MS.tag._createTagWindow(tags[i], width, height);
            }
        }
        catch(e)
        {
            MS.log("Error: " + e)
        }
    });
};


MS.tag._createTagWindow = function(json, width, height)
{
    try
    {
        var _tagBox = document.createElement("div");
        _tagBox.setAttribute("class", "MusicPopupTag");

        var tagCenter = json["center"];
        var tagHeight = json["height"];
        var tagWidth = json["width"];
        MS.log("Center: (" + tagCenter["x"] + "," + tagCenter["y"] + ")");

        var _tagHeight = height / 100 * tagHeight;
        var _tagWidth = width / 100 * tagWidth;
        var _centerX = width / 100 * tagCenter["x"] - (_tagWidth / 2) - 5;
        var _centerY = height / 100 * tagCenter["y"] - (_tagHeight / 2) - 5;

        MS.log("Center Real: (" + _centerX + "," + _centerY + ")");
        $(_tagBox).css({'top':_centerY + 'px','left':_centerX + 'px', 'height':_tagHeight, 'width':_tagWidth});

        //If everything was ok ... we add the tag box!
        $("#_MusicPopupImg").append(_tagBox);

        $(_tagBox).click(function(){

            //1. Ask who it is
            var name = prompt("Who is this?");
            MS.log("Jawel = " + name);

            $(_tagBox).remove();  // remove the box

            var _spanTop = height / 100 * tagCenter["y"];
            var _spanLeft = width / 100 * tagCenter["x"];

            //2. Create tag HTML
            var span = document.createElement("span");
            span.innerHTML = name;
            span.setAttribute("style", 'background-color:#000;padding:3px;color:#fff;position:absolute;top:' + _spanTop + 'px;left:' + _spanLeft + 'px;');
            $("#_MusicPopupImg").append(span);

            //3. Create the actual tag on face.com
            //  http://api.face.com/tags/save.json?api_key=4b4b4c6d54c37&api_secret= &uid=testing@test.face.com&tids=TMP@d64c477a1e9991e9aec2710c08102982_4b5840ff65801_14.81_44.20_0
            var uid = MS.tag._createUID(name);
            var postUrl = 'http://api.face.com/tags/save.json?api_key=' + MS.facePublicKey
                + '&api_secret=' + MS.faceSecretKey
                + '&uid=' + uid
                + '&tids=' + json['tid'];

            $.getJSON(postUrl, function(data)
            {
                MS.log("tags.save = " + JSON.stringify(data));
                localStorage.setItem(uid, name);

                if(data["status"]==="success")
                {
                    //localStorage.setItem(uid, name);
                }
            });
        });
    }
    catch(e)
    {
        MS.log("Error creating tag window : " + e);
    }
};


/**
 *
 * @param inputStr
 */
MS.tag._createUID = function(inputStr)
{
    var hash = MS.md5(inputStr.toLowerCase());
    //return hash + "@shoplifes.com";
    return hash + "@maarten";
};





/**
 * This method recieves message from the background page.
 * It will load all the images of a page or just a single on
 */
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse)
    {
        if(request["type"] === "all")
        {
            MS.tag._scannedImages = new Array();

            MS.tag._loadTag();
            MS.tag._scanImages();
            MS.tag._loadImage(0);
        }
        else if(request["type"] === "image")
        {
            var url = request["url"];
            MS.tag._scannedImages = new Array();
            MS.tag._scannedImages.push(url);

            MS.tag._loadTag();
            MS.tag._loadImage(0);
        }
    }
);



/*
{
-photos: [
-{
url: http://images.wikia.com/powerrangers/images/f/fe/ActorJohnCho_John_Shea_55027822.jpg
pid: "F@6c2e33ce10af701294c0a9f35b12f0cc_4b4b4c6d54c37"
width: 411
height: 600
-tags: [
-{
tid: "TEMP_F@6c2e33ce10af701294c0a9f35b12f0cc_4b4b4c6d54c37_52.07_45.83_0_1"
recognizable: true
threshold: null
uids: [ ]
gid: null
label: ""
confirmed: false
manual: false
tagger_id: null
width: 48.18
height: 33
-center: {
x: 52.07
y: 45.83
}
-eye_left: {
x: 40.04
y: 38.61
}
-eye_right: {
x: 64.13
y: 37.36
}
-mouth_left: {
x: 44.42
y: 54.46
}
-mouth_center: {
x: 54.82
y: 53.73
}
-mouth_right: {
x: 63.47
y: 52.87
}
-nose: {
x: 54.57
y: 45.86
}
ear_left: null
ear_right: null
chin: null
yaw: 9.74
roll: -4.31
pitch: 8.35
-attributes: {
-glasses: {
value: "false"
confidence: 99
}
-smiling: {
value: "false"
confidence: 66
}
-face: {
value: "true"
confidence: 98
}
-gender: {
value: "male"
confidence: 83
}
-mood: {
value: "happy"
confidence: 34
}
-lips: {
value: "sealed"
confidence: 81
}
}
}
]
}
]
status: "success"
-usage: {
used: 19
remaining: "unlimited"
limit: "unlimited"
reset_time_text: "unlimited"
reset_time: 0
}
}
 */





