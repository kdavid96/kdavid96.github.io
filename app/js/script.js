$(document).ready(function(){$("body").hide().fadeIn(1500);});

$(document).ready(function(){
    $(window).scroll(function(){
        $(".header").css("opacity", 1 - $(window).scrollTop() / ($('.header').height() / 2));
    });
});

