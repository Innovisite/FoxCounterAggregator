 /*
  * Service for setting up all the layouts (animations parameters, colors, etc.)
  **/
 (function() {
   angular.module('adminLTE', []).service('LayoutService', function() {

    this.sideBarCollapsed = false;

     /* --------------------
      * - AdminLTE Options -
      * --------------------
      * Modify these options to suit your implementation
      */
     var options = {
       //Add slimscroll to navbar menus
       //This requires you to load the slimscroll plugin
       //in every page before app.js
       navbarMenuSlimscroll: true,
       navbarMenuSlimscrollWidth: "3px", //The width of the scroll bar
       navbarMenuHeight: "200px", //The height of the inner menu
       //General animation speed for JS animated elements such as box collapse/expand and
       //sidebar treeview slide up/down. This options accepts an integer as milliseconds,
       //'fast', 'normal', or 'slow'
       animationSpeed: 0,
       //Sidebar push menu toggle button selector
       sidebarToggleSelector: "[data-toggle='offcanvas']",
       //Activate sidebar push menu
       sidebarPushMenu: true,
       //Activate sidebar slimscroll if the fixed layout is set (requires SlimScroll Plugin)
       sidebarSlimScroll: true,
       //Enable sidebar expand on hover effect for sidebar mini
       //This option is forced to true if both the fixed layout and sidebar mini
       //are used together
       sidebarExpandOnHover: false,
       //BoxRefresh Plugin
       enableBoxRefresh: true,
       //Bootstrap.js tooltip
       enableBSToppltip: true,
       BSTooltipSelector: "[data-toggle='tooltip']",
       //Enable Fast Click. Fastclick.js creates a more
       //native touch experience with touch devices. If you
       //choose to enable the plugin, make sure you load the script
       //before AdminLTE's app.js
       enableFastclick: true,                           
       //The standard screen sizes that bootstrap uses.
       //If you change these in the variables.less file, change
       //them here too.
       screenSizes: {
         xs: 480,
         sm: 768,
         md: 992,
         lg: 1200
       }
     };

     /* Init()
      * =======
      * Init all UI methods
      */
     this.init = function() {

       //Fix for IE page transitions
       $("body").removeClass("hold-transition");

       //Easy access to options
       var o = options;

       //Activate the layout maker
       this.layout.activate();

       //Enable sidebar tree view controls
       this.tree('.sidebar');      

       //Add slimscroll to navbar dropdown
       if (o.navbarMenuSlimscroll && typeof $.fn.slimscroll != 'undefined') {
         $(".navbar .menu").slimscroll({
           height: o.navbarMenuHeight,
           alwaysVisible: false,
           size: o.navbarMenuSlimscrollWidth
         }).css("width", "100%");
       }

       //Activate sidebar push menu
       if (o.sidebarPushMenu) {
         this.pushMenu.activate(options.sidebarToggleSelector);
       }

       //Activate Bootstrap tooltip
       if (o.enableBSToppltip) {
         $('body').tooltip({
           selector: o.BSTooltipSelector
         });
       }       

       //Activate fast click
       if (o.enableFastclick && typeof FastClick != 'undefined') {
         FastClick.attach(document.body);
       } 
     }     

     /* Layout
      * ======
      * Fixes the layout height in case min-height fails.
      *
      * @type Object
      * @usage $.AdminLTE.layout.activate()
      *        $.AdminLTE.layout.fix()
      *        $.AdminLTE.layout.fixSidebar()
      */
     this.layout = {
       activate: function() {
         var _this = this;
         _this.fix();
         _this.fixSidebar();
         $(window, ".wrapper").resize(function() {
           _this.fix();
           _this.fixSidebar();
         });
       },
       fix: function() {
         //Get window height and the wrapper height
         var neg = $('.main-header').outerHeight() + $('.main-footer').outerHeight();
         var window_height = $(window).height();
         var sidebar_height = $(".sidebar").height();
         //Set the min-height of the content and sidebar based on the
         //the height of the document.
         if ($("body").hasClass("fixed")) {
           $(".content-wrapper, .right-side").css('min-height', window_height - $('.main-footer').outerHeight());
         } else {
           var postSetWidth;
           if (window_height >= sidebar_height) {
             $(".content-wrapper, .right-side").css('min-height', window_height - neg);
             postSetWidth = window_height - neg;
           } else {
             $(".content-wrapper, .right-side").css('min-height', sidebar_height);
             postSetWidth = sidebar_height;
           }           

         }
       },
       fixSidebar: function() {
         //Make sure the body tag has the .fixed class
         if (!$("body").hasClass("fixed")) {
           if (typeof $.fn.slimScroll != 'undefined') {
             $(".sidebar").slimScroll({
               destroy: true
             }).height("auto");
           }
           return;
         } else if (typeof $.fn.slimScroll == 'undefined' && window.console) {
           window.console.error("Error: the fixed layout requires the slimscroll plugin!");
         }
         //Enable slimscroll for fixed layout
         if (options.sidebarSlimScroll) {
           if (typeof $.fn.slimScroll != 'undefined') {
             //Destroy if it exists
             $(".sidebar").slimScroll({
               destroy: true
             }).height("auto");
             //Add slimscroll
             $(".sidebar").slimscroll({
               height: ($(window).height() - $(".main-header").height()) + "px",
               color: "rgba(0,0,0,0.2)",
               size: "3px"
             });
           }
         }
       }
     };

     /* PushMenu()
      * ==========
      * Adds the push menu functionality to the sidebar.
      *
      * @type Function
      * @usage: this.pushMenu("[data-toggle='offcanvas']")
      */
     this.pushMenu = {
       activate: function(toggleBtn) {
         //Get the screen sizes
         var screenSizes = options.screenSizes;

         //Enable sidebar toggle
         $(document).on('click', toggleBtn, function(e) {
           e.preventDefault();
/*
           //Enable sidebar push menu
           if ($(window).width() > (screenSizes.sm - 1)) {
             if ($("body").hasClass('sidebar-collapse')) {
               $("body").removeClass('sidebar-collapse').trigger('expanded.pushMenu');
             } else {
               $("body").addClass('sidebar-collapse').trigger('collapsed.pushMenu');
             }
           }
           //Handle sidebar push menu for small screens
           else {
             if ($("body").hasClass('sidebar-open')) {
               $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');
             } else {
               $("body").addClass('sidebar-open').trigger('expanded.pushMenu');
             }
           }*/
         });

         $(".content-wrapper").click(function() {
           //Enable hide menu when clicking on the content-wrapper on small screens
           if ($(window).width() <= (screenSizes.sm - 1) && $("body").hasClass("sidebar-open")) {
             $("body").removeClass('sidebar-open');
           }
         });

         //Enable expand on hover for sidebar mini
         if (options.sidebarExpandOnHover || ($('body').hasClass('fixed') && $('body').hasClass('sidebar-mini'))) {
           this.expandOnHover();
         }
       },
       expandOnHover: function() {
         var _this = this;
         var screenWidth = options.screenSizes.sm - 1;
         //Expand sidebar on hover
         $('.main-sidebar').hover(function() {
           if ($('body').hasClass('sidebar-mini') && $("body").hasClass('sidebar-collapse') && $(window).width() > screenWidth) {
             _this.expand();
           }
         }, function() {
           if ($('body').hasClass('sidebar-mini') && $('body').hasClass('sidebar-expanded-on-hover') && $(window).width() > screenWidth) {
             _this.collapse();
           }
         });
       },
       expand: function() {
         $("body").removeClass('sidebar-collapse').addClass('sidebar-expanded-on-hover');
       },
       collapse: function() {
         if ($('body').hasClass('sidebar-expanded-on-hover')) {
           $('body').removeClass('sidebar-expanded-on-hover').addClass('sidebar-collapse');
         }
       }
     };


     /* Tree()
      * ======
      * Converts the sidebar into a multilevel
      * tree view menu.
      *
      * @type Function
      * @Usage: $.AdminLTE.tree('.sidebar')
      */
     this.tree = function(menu) {
       var _this = this;
       var animationSpeed = options.animationSpeed;
       $(menu).on('click', 'li a', function(e) {

         //Get the clicked link and the next element
         var $this = $(this);
         var checkElement = $this.next();

         //Check if the next element is a menu and is visible
         if ((checkElement.is('.treeview-menu')) && (checkElement.is(':visible')) && (!$('body').hasClass('sidebar-collapse'))) {
           //Close the menu
           checkElement.slideUp(animationSpeed, function() {
             checkElement.removeClass('menu-open');
             //Fix the layout in case the sidebar stretches over the height of the window
             //_this.layout.fix();
           });
           checkElement.parent("li").removeClass("active");
         }
         //If the menu is not visible
         else if ((checkElement.is('.treeview-menu')) && (!checkElement.is(':visible'))) {
           //Get the parent menu
           var parent = $this.parents('ul').first();
           //Close all open menus within the parent
           // var ul = parent.find('ul:visible').slideUp(animationSpeed);
           //Remove the menu-open class from the parent
           // ul.removeClass('menu-open');
           //Get the parent li
           var parent_li = $this.parent("li");

           //Open the target menu and add the menu-open class
           checkElement.slideDown(animationSpeed, function() {
             //Add the class active to the parent li
             checkElement.addClass('menu-open');
             // parent.find('li.active').removeClass('active');
             parent_li.addClass('active');
             //Fix the layout in case the sidebar stretches over the height of the window
             _this.layout.fix();
           });
         }
         //if this isn't a link, prevent the page from being redirected
         if (checkElement.is('.treeview-menu')) {
           e.preventDefault();
         }
       });
     };
    
   });

 }());