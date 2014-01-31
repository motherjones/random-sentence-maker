var headline_hed;
var data;
var share_buttons_container;
var dust_templates = 1;
var url;

var process_data = function(response) {
    console.log(response);
    var data = {};
    for (var i = 0; i < response.length; i++) {
        for (var j in response[i]) {
            data[j] = data[j] || [];
            if ( response[i][j] ) {
                data[j].push( response[i][j] )
            }
        }
    }
    console.log(data);
    return data;
}

var register_templates = function() {
    for (var i = 0; i < templates.length; i++) {
        console.log(i);
        var compiled_tooltip = dust.compile(templates[i], (i + 1));
        dust.loadSource(compiled_tooltip);
        dust_templates++;
    }
}

var init_headline_generator = function() {
    var headline_element = jQuery('#generated_headline');
    headline_hed = jQuery('<h1></h1>');
    headline_element.append(headline_hed);
    var create_headline_form = jQuery('<form action="#generated_headline"></form>');
    create_headline_form.append(jQuery('<label for="generate_headline_button"></label>'));
    create_headline_form.append(jQuery('<input type="submit" value="Hit Me"></input>'));
    create_headline_form.bind('submit', function() {
        display_new_headline();
        return false;
    });
    share_buttons_container = jQuery('<div id="share_buttons_container"></div>');

    var headline_form_container = jQuery('<div class="headline_form_container"></div>');
    headline_form_container.append(create_headline_form);
    headline_element.after(headline_form_container);
    headline_form_container.after(share_buttons_container);
    jQuery('#headline_generator_container').bind('mouseover', function() {
        jQuery(document).bind('keydown', keydown_handler);
    });
    jQuery('#headline_generator_container').bind('mouseout', function() {
        jQuery(document).unbind('keydown', keydown_handler);
    });
};

var keydown_handler = function(e) {
    if (e.keyCode === 37) {
        display_new_headline();
    } else if (e.keyCode === 39) {
        display_new_headline();
    } else if (e.keyCode === 32) {
        display_new_headline();
    } else if (e.keyCode === 13) {
        display_new_headline();
    }
    return false;
}

var display_new_headline = function() {
    var dust_template = Math.ceil(Math.random() * (dust_templates - 1));
    
    var query = '?tmp=' + dust_template;
    var dust_context = {};
    var i = 0;
    for (var col in data) {
        var num = Math.floor(Math.random() * data[col].length)
        query += '&' + i + '=' + num;
        dust_context[col] = data[col][num];
        i++;
    }

    console.log(query);
    dust.render(dust_template, dust_context, function(err, out) {
        console.log(err);
        headline_hed.html(out);
        set_twitter_text(out, query);
        set_facebook_text(out, query);
        window.history.pushState(query, document.title, query);
    });
}

var set_twitter_text = function(hed, query) {
    jQuery('#headline_generator_container .hed-twitter-share-button').remove()
    share_buttons_container.append('<a class="hed-twitter-share-button" target="blank" href="https://twitter.com/intent/tweet?original_referer=&source=tweetbutton&text='
        + encodeURI(hed)
        + ' ' + url + query
        + '&via=MotherJones'
        +'">TWEET</a>'
    );
} 

var set_facebook_text = function(hed, query) {
    jQuery('#headline_generator_facebook_like').remove();
    share_buttons_container.append(
        jQuery('<a id="headline_generator_facebook_like" target="_blank" '
            + 'href="https://www.facebook.com/dialog/feed?app_id='
            + fb_app_id
            + '&link=' + encodeURI(url + query)
            + '&picture=' + encodeURI(fb_picture)
            + '&caption=' + encodeURI(hed)
            + '&description=' + encodeURI(fb_description)
            + '&redirect_uri=' + encodeURI(url)
            + '">FACEBOOK</a>'
        )
    );
}

var check_query = function() {
    if (!document.location.search) {
        display_new_headline();
        return
    }
    var params = document.location.search.split('&');
    var keys = [];
    for (var i in data) {
        keys.push(i);
    }
    if (params.length - 1 !== keys.length) {
        display_new_headline();
        return
    }
    var dust_template = params.shift().replace(/^.*=/, '');
    var dust_context = {};
    for (var i=0; i < params.length; i++) {
        dust_context[keys[i]] = data[keys[i]][ params[i].replace(/^.*=/, '') ];
    }
    dust.render(dust_template, dust_context, function(err, out) {
        headline_hed.html(out);
        set_twitter_text(out, document.location.search);
        set_facebook_text(out, document.location.search);
    })
}

var start_random_sentence_maker = function(spreadsheet, proxy) {
    url = shorturl || document.location;
    var tt_options = { 
        key: spreadsheet,
        simpleSheet: true,
        callback: function(response) {
            data = process_data(response)
            register_templates();
            init_headline_generator();
            check_query();
        }
    };
    if (proxy) {
        tt_options.proxy = proxy;
    }
    Tabletop.init(tt_options);
}
