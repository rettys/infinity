/*              
 * live-index.js
 * https://github.com/vichan-devel/Tinyboard/blob/master/js/live-index.js
 *      
 * Released under the MIT license
 * Copyright (c) 2014 Marcin Łabanowski <marcin@6irc.net>
 *      
 * Usage:
 *   $config['api']['enabled'] = true;
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/expand.js';
 *   $config['additional_javascript'][] = 'js/live-index.js';
 *              
 */

if (active_page == 'index' && (""+document.location).match(/\/(index\.html)?(\?|$)/))
+function() {
  var board_name = (""+document.location).match(/\/([^\/])\/[^/]*$/)[1];

  var handle_one_thread = function() {
    $(this).find("br.clear").before("<div class='new-posts'>"+_("No new posts.")+"</div>")
  };

  $(function() {
    $("hr:first").before("<hr /><div class='new-threads'>"+_("No new threads.")+"</div>");

    $('div[id^="thread_"]').each(handle_one_thread);
  });

  $(document).on("new_post", function(e, post) {
    if (!$(post).hasClass("reply")) {
      handle_one_thread.bind(post);
    }
  });

  var update_new_threads = function(i) {
    var msg = i ?
      fmt(_("There are {0} new threads."), [i]) :
      _("No new threads.");

    if ($(".new-threads").html() != msg)
      $(".new-threads").html(msg);
  };

  var update_new_posts = function(i, th) {
    var msg = (i>0) ?
      (fmt(_("There are {0} new posts in this thread."), [i])+" <a href='javascript:void(0)'>"+_("Click to expand")+"</a>.") :
      _("No new posts.");

    if ($(th).find(".new-posts").html() != msg) {
      $(th).find(".new-posts").html(msg);
      $(th).find(".new-posts a").click(window.expand_fun);
    }
  };

  setInterval(function() {
    $.getJSON(configRoot+board_name+"/0.json", function(j, x, r) {
      var new_threads = 0;

      j.threads.forEach(function(t) {
	var s_thread = $("#thread_"+t.posts[0].no);

	if (s_thread.length) {
	  var my_posts = s_thread.find(".post.reply").length;

	  var omitted_posts = s_thread.find(".omitted");
	  if (omitted_posts.length) {
	    omitted_posts = omitted_posts.html().match("^[^0-9]*([0-9]+)")[1]|0;
	    my_posts += omitted_posts;
          }

	  my_posts -= t.posts[0].replies|0;
	  my_posts *= -1;
          update_new_posts(my_posts, s_thread);
	}
	else {
	  new_threads++;
	}
      });

      update_new_threads(new_threads);
    });
  }, 2000);
}();
