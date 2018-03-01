//write functions here
function Ctrler(){
    this.N = 0;
    this.cur_anno_idx = 0;
    this.originX;
    this.originY;
    this.im = new Image();
    // use cat icon for demo
    //var cat_id = 17;
    //this.im.src = STATIC_ROOT + '/images/categories/'+cat_id+'.png';
    this.zoomLevel = 0;
}
// center icon
Ctrler.prototype.centerIcon = function(){
    var stage_ui = window.controller_ui.s.stage_ui;
    var imWid = stage_ui.size['width'];
    var imHei = stage_ui.size['height'];
    var bbox = window.controller_ui.s.stage_ui.bbox;
    var zoom =   ctrler.getZoomFactor();
    origin = ctrler.getOrigin();
    // compute new origin
    stage_ui.translate_delta(0.3* imWid- imWid/2/zoom - origin['x'], 0.5*imHei- imHei/2/zoom - origin['y']);
    setTimeout(function(){ctrler.renderHint();}, 300);
}
Ctrler.prototype.zoomAtCenter = function(delta){
    var stage_ui = window.controller_ui.s.stage_ui;
    var imWid = stage_ui.size['width'];
    var imHei = stage_ui.size['height'];
    var p = new Object();
    p['x'] = imWid/2
    p['y'] = imHei/2
    stage_ui.zoom_delta(delta,p);
}
//render hint
Ctrler.prototype.renderHint = function(){
    var stage_ui = window.controller_ui.s.stage_ui;
    var imWid = stage_ui.size['width'];
    var imHei = stage_ui.size['height'];
    var ctx = $('canvas')[0].getContext('2d');
    var icon_size=20;

    for (i=0; i < ctrler.N; i++){
        /*
        var x = Anno[i][0];
        var y = Anno[i][1];
        var left = x * imWid;
        var top =  y * imHei;
        var container = $('#mt-container');
        var offsetX = parseFloat(container.position().left);
        var offsetY = parseFloat(container.position().top );
        */
        // adjust with new zoom and origin
        var origin = ctrler.getOrigin();
        var zoom =   ctrler.getZoomFactor();
        //left = (left - origin['x'])*zoom;
        //top  = (top  - origin['y'])*zoom;
        // if (left >0 && left < Math.min($(window).width()-icon_size/2, imWid*zoom) &&
        //     top > 0 && top < Math.min( $(window).width()-icon_size/2, imHei*zoom)){
        for (k = 0; k < polys.length; k++){
            ctx.beginPath();
            vertex = polys[k];
            ctx.moveTo((vertex[0]*imWid - origin['x'])*zoom, (vertex[1]*imHei-origin['y'])*zoom);
            for (j=2; j< vertex.length; j+=2){
                ctx.lineTo((vertex[j]*imWid - origin['x'])*zoom, (vertex[j+1]*imHei-origin['y'])*zoom);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(0,0,255, 0.5)';
            ctx.stroke();
            ctx.fill();
        }
        //ctx.drawImage(ctrler.im, left-15, top-15, 30, 30);
        // }
    }

}
Ctrler.prototype.getOrigin = function(){
    return window.controller_ui.s.stage_ui.origin
}
Ctrler.prototype.getZoomFactor = function(){
    return window.controller_ui.s.stage_ui.get_zoom_factor()
}
Ctrler.prototype.getPolys = function(){
    // polygon points:
    return window.controller_ui.s.closed_polys
}
Ctrler.prototype.submitNoObj = function(){
      if (!mt_submit_ready) {
        return;
      }
      window.show_modal_loading("Submitting...", 0);
      var data = $.extend(true, {
                    screen_width: screen.width,
                    screen_height: screen.height,
                    time_load_ms: window.time_load_ms
                  }, data);
      var ans = JSON.stringify(data);
      var duration = ($.now()-init_time)/1000;
      var resp =
        {'ans':ans,
         'duration': duration,
         'assignmentId':$('#assignmentId').val(),
         'workerId': $('#workerId').val(),
         'hitId': $('#hitId').val(),
         'isObj': 0,
        };
        $("input[name='duration']").val(duration)
        $("input[name='ans']").val(ans);
        $("input[name='isObj']").val(0);
        $('#mturk_form').submit();
}
Ctrler.prototype.submit_form = function(data_callback) {
      var data, feedback;
      if (!mt_submit_ready) {
        return;
      }
      //window.show_modal_loading("Submitting...", 0);
      data = data_callback();
      if (window.ask_for_feedback) {
        feedback = typeof window.get_modal_feedback === "function" ? window.get_modal_feedback() : void 0;
      }
      if ((feedback != null) && !$.isEmptyObject(feedback)) {
        data.feedback = JSON.stringify(feedback);
      }
      console.log("submit data:");
      console.log(data);
      //debugger;
      var data = $.extend(true, {
                    screen_width: screen.width,
                    screen_height: screen.height,
                    time_load_ms: window.time_load_ms
                  }, data);
      var ans = JSON.stringify(data);
      var duration = ($.now()-init_time)/1000;
      var resp =
        {'ans':ans,
         'duration': duration,
         'assignmentId':$('#assignmentId').val(),
         'workerId': $('#workerId').val(),
         'hitId': $('#hitId').val(),
         'isObj': 1,
        };
        $("input[name='duration']").val(duration)
        $("input[name='ans']").val(ans);
        $("input[name='isObj']").val(1);
       // $('#mturk_form').submit();
       if(window.min_shapes == 0){
           //change text to next, change min shapes = 1
           window.min_shapes = 1;
           $( "#btn-submit" ).html('Next');
       }
       else{
           //send poly data
           //...
       }
       //grab image

       //check for start or next


       //when user clicks next, go to next image
        $("#mt-container").empty();
        window.template_args = { //@aji-note change image
            photo_url: "vendor/images/demo/cat.jpg",
            photo_id: 3
        };
        template_args.width = $('#mt-container').width() - 4;
        template_args.height = $(window).height() - $('#mt-top-nohover').height() - 16;
        template_args.container_id = 'mt-container';
        $('#poly-container').width(template_args.width).height(template_args.height);
        window.controller_ui = new ControllerUI(template_args);
        //render hint
        /*
        polys = [[0.17821553290059533,0.4564724718351938,0.1601562393003034,0.4472112956299159,0.14904282785396986,0.4342456489425268,0.14904282785396986,0.42313223749619333,0.13654023997684467,0.4064621203266931,0.135151063546053,0.36015623930030344,0.14765365142317816,0.3119981230328583,0.1448752985615948,0.28977130014019126,0.13237271068446962,0.2656922420064687,0.1309835342536779,0.24531765435485722,0.13654023997684467,0.21753412573902353,0.15043200428476153,0.21197742001585673,0.18377223862376202,0.24161318387274608,0.21711247296276254,0.2527265953190796,0.29351717665630533,0.2397609486316905,0.3171331759797641,0.2397609486316905,0.3449167045955978,0.228647537185357,0.40048376182726525,0.24902212483696842,0.4477157604741826,0.228647537185357,0.5074503469982252,0.22679530194430142,0.5769091685378096,0.22679530194430142,0.6533138722313524,0.25643106580119074,0.7102701058938116,0.28051012393491337,0.775561398141021,0.3231115344791918,0.8519661018345637,0.3879397679161372,0.8589119839885221,0.46573364804047174,0.8630795132808972,0.5416752929237507,0.8561336311269389,0.5805722329859179,0.8575228075577305,0.6213214082891407,0.8533552782653554,0.6528094073870856,0.8186258674955632,0.6435482311818077,0.7936206917413128,0.6435482311818077,0.7422211638020204,0.673183995038697,0.7269402230633119,0.673183995038697,0.5991359914304766,0.6305825844944186,0.5921901092765182,0.6046512911196404,0.6005251678612683,0.5916856444322514,0.5991359914304766,0.5639021158164177,0.6171952850307686,0.5527887043700841,0.6033035207228516,0.5379708224416394,0.5519039927835593,0.5287096462363615,0.5116178762906003,0.5046305881026389,0.45049411333576606,0.4675858832815273,0.4199322318583489,0.4472112956299159,0.39214870324251516,0.41016659080880424,0.34213835173401447,0.39720094412141516,0.268512000902055,0.38423529743402607,0.22266917868592925,0.39905317936247076,0.20738823794722072,0.4305411784604156,0.1879397679161371,0.45276800135308265]];
        ctrler.renderHint();
        window.controller_ui.s.stage_ui.layer.afterDrawFunc = ctrler.renderHint
        */
    }
Ctrler.prototype.addListener = function(){
    $('#btn-zoom-in').bind('click', function(e){
        ctrler.zoomAtCenter(600);
        ctrler.zoomLevel++;
        ctrler.renderHint();
        return stop_event(e);
    });
    $('#btn-zoom-out').bind('click', function(e){
        ctrler.zoomAtCenter(-600);
        ctrler.renderHint();
        return stop_event(e);
    });
    $('#btn-move').bind('click', function(e){
        ctrler.centerIcon();
        return stop_event(e);
        //return stop_event(ev);
    });
    $(document).keydown(function(ev){
        if (ev.keyCode == 77 || ev.keyCode == 109){
            $('#btn-move').trigger('click');
        }else if(ev.keyCode == 73 || ev.keyCode == 105){
            $('#btn-zoom-in').trigger('click');
        }else if(ev.keyCode == 79 || ev.keyCode == 111){
            $('#btn-zoom-out').trigger('click');
        }else if(ev.keyCode == 37 || ev.keyCode == 38){
        }
    } );
    $('#btn-submit-noobj').bind('click', ctrler.submitNoObj);
    $(document).keypress( function(ev){
        if (ev.keyCode == 37 || ev.keyCode == 38){
            setTimeout(function(){
                ctrler.renderHint();}, 100);
        }
    });
}
// polygonal comparison
function isPointInPoly(poly, pt){
    nvert = poly.length
    var c = false;
    for(i = 0, j = nvert - 1; i < nvert; j = i++){
        if ( (poly[i]['y'] > pt['y'] )!=(poly[j]['y']>pt['y']) &&
             (pt['x'] < (poly[j]['x']-poly[i]['x']) * (pt['y']-poly[i]['y']) / (poly[j]['y']-poly[i]['y']) + poly[i]['x'] )){
            c = !c;
        }
    }
    return c;
}

function accOfOverlappedPolygons(poly1, poly2){
    var bbox = getbboxOfPolys(poly1, poly2);
    var intersection = 0;
    var union = 0;
    var poly1Pixel = 0;
    var poly2Pixel = 0;
    for (var i = bbox['x_min']; i < bbox['x_max']; i++){
        for (var j = bbox['y_min']; j < bbox['y_max']; j++){
            var pt = new Object();
            pt = {'x':i, 'y':j};
            var inPoly1 = isPointInPoly(poly1, pt);
            var inPoly2 = isPointInPoly(poly2, pt);
            if (inPoly1 || inPoly2){
                union++;
            }
            if (inPoly1){
                poly1Pixel++;
            }
            if(inPoly1 ^ inPoly2){
                intersection++;
            }
        }
    }
    return intersection/poly1Pixel;
}
function getbboxOfPolys(poly1, poly2){
    bbox1 =getbbox(poly1);
    bbox2 =getbbox(poly2);
    var bbox = new Object();
    bbox['x_min'] = Math.min(bbox1['x_min'], bbox2['x_min']);
    bbox['y_min'] = Math.min(bbox1['y_min'], bbox2['y_min']);
    bbox['x_max'] = Math.max(bbox1['x_max'], bbox2['x_max']);
    bbox['y_max'] = Math.max(bbox1['y_max'], bbox2['y_max']);
    return bbox
}
function getbbox(poly){
    var x_min=1000000, x_max=0, y_min=100000, y_max = 0;
    for (var i=0; i<poly.length; i++){
        if (x_min > poly[i]['x']){x_min = poly[i]['x'];};
        if (x_max < poly[i]['x']){x_max = poly[i]['x'];};
        if (y_min > poly[i]['y']){y_min = poly[i]['y'];};
        if (y_max < poly[i]['y']){y_max = poly[i]['y'];};
    }
    return {'x_min':x_min, 'x_max':x_max, 'y_min':y_min, 'y_max':y_max,}
}
// windows
var ctrler;
$(window).load(function(){
    // append a invisible annotation
    // set up things
    ctrler = new Ctrler();
    ctrler.N = 1;
    // redner things
    ctrler.renderHint();
    // ctrler.centerIcon();
    ctrler.addListener();
    window.controller_ui.s.stage_ui.layer.afterDrawFunc = ctrler.renderHint
});
