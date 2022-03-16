
/* Don't warn when opening about:config ***/
user_pref("browser.aboutConfig.showWarning", false);


/* EXPERIMENTAL ***/
user_pref("dom.ipc.processCount", 1);
user_pref("dom.ipc.processCount.webIsolated", 1);
user_pref("dom.suspend_inactive.enabled", true);


/* Reduce read/write operation of Firefox ***/
user_pref("browser.cache.disk.enable", false);
user_pref("browser.cache.memory.enable", true);
user_pref("browser.cache.memory.capacity", 1048576);
user_pref("browser.sessionstore.interval", 15000000);


/* QoL Misc ***/
// do not close even after closing the last tab
user_pref("browser.tabs.closeWindowWithLastTab", false);
// disable Pocket integration
user_pref("extensions.pocket.enabled", false);
// disable warning when entering full-screen mode
user_pref("full-screen-api.warning.timeout", 0);
// disable firefox accounts
user_pref("identity.fxaccounts.enabled", false);
// monitor refresh rate
user_pref("layout.frame_rate", 144);
// temporary fix for pulseaudio instability
user_pref("media.volume_scale", "2");
// disable narration on reader mode
user_pref("narrate.enabled", false);
// choose container instead
user_pref("privacy.userContext.newTabContainerOnLeftClick.enabled", true);
// disable pop-up when pressing alt key
user_pref("ui.key.menuAccessKeyFocuses", false);


/* General ***/
// Open links in tabs instead of new windows
user_pref("browser.link.open_newwindow", 2);
// Confirm before quitting with Ctrl+Q
user_pref("browser.warnOnQuitShortcut", false);
// DRM Content - Uncomment if needed
/*
user_pref("media.eme.enabled", true);
user_pref("media.gmp-widevinecdm.visible", true);
user_pref("media.gmp-widevinecdm.enabled", true);
***/
// Enable picture-in-picture video controls
user_pref("media.videocontrols.picture-in-picture.video-toggle.enabled", false);
// Control media via keyboard, headset, or virtual interface
user_pref("media.hardwaremediakeys.enabled", false);
// Recommend extension as you browse
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false);
// Recommend features as you browse
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false);
// Network Settings
// enable custom DNS over HTTPS address
user_pref("network.trr.mode", 2);
// custom address to point DNS over HTTPS
user_pref("network.trr.uri", "127.0.0.1");
// custom address to point DNS over HTTPS
//user_pref("network.trr.custom_uri", "127.0.0.1");


/* Home ***/
// Homepage and new windows
user_pref("browser.startup.homepage", "about:blank");
// New tabs
user_pref("browser.newtabpage.enabled", false);
// Web Search
user_pref("browser.newtabpage.activity-stream.showSearch", false);
// Shortcuts
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
// Recent Activity
user_pref("browser.newtabpage.activity-stream.section.highlights.includeBookmarks", false);
user_pref("browser.newtabpage.activity-stream.section.highlights.includeDownloads", false);
user_pref("browser.newtabpage.activity-stream.section.highlights.includePocket", false);
user_pref("browser.newtabpage.activity-stream.section.highlights.includeVisited", false);


/* Search ***/
// Search Suggestions
user_pref("browser.search.suggest.enabled", false);
user_pref("browser.urlbar.showSearchSuggestionsFirst", false);


/* Privacy & Security ***/
// Enhanced Tracking Protection
user_pref("browser.contentblocking.category", "strict");
// Send websites a "Do Not Track" signal
user_pref("privacy.donottrackheader.enabled", true);
// Logins and Passwords
user_pref("signon.rememberSignons", false);
user_pref("signon.autofillForms", false);
user_pref("signon.generation.enabled", false);
// Set time range from 'Last Hour' to 'Everything' in 'Clear History'
user_pref("privacy.sanitize.timeSpan", 0);
// Check all the boxes by default in 'Clear History'
user_pref("privacy.cpd.cache", true);
user_pref("privacy.cpd.cookies", true);
user_pref("privacy.cpd.formdata", true);
user_pref("privacy.cpd.history", true);
user_pref("privacy.cpd.offlineApps", true);
user_pref("privacy.cpd.sessions", true);
user_pref("privacy.cpd.siteSettings", true);
// Address Bar
user_pref("browser.urlbar.suggest.bookmark", false);
user_pref("browser.urlbar.suggest.engines", false);
user_pref("browser.urlbar.suggest.history", false);
user_pref("browser.urlbar.suggest.openpage", false);
user_pref("browser.urlbar.suggest.searches", false);
user_pref("browser.urlbar.suggest.topsites", false);
// Firefox Data Collection and Use
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("browser.discovery.enabled", false);
user_pref("app.shield.optoutstudies.enabled", false);
// Enable HTTPS only mode
user_pref("dom.security.https_only_mode", true);


/* Add-ons & Extensions ***/
user_pref("extensions.getAddons.showPane", false);
user_pref("extensions.htmlaboutaddons.discover.enabled", false);
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false);


/* Smooth Scroll ***/
user_pref("apz.allow_zooming", true);
user_pref("apz.force_disable_desktop_zooming_scrollbars", false);
user_pref("apz.paint_skipping.enabled", true);
user_pref("apz.windows.use_direct_manipulation", true);
user_pref("dom.event.wheel-deltaMode-lines.always-disabled", true);
user_pref("general.smoothScroll.currentVelocityWeighting", "1.0");
user_pref("general.smoothScroll.durationToIntervalRatio", 1000);
user_pref("general.smoothScroll.lines.durationMaxMS", 100);
user_pref("general.smoothScroll.lines.durationMinMS", 0);
user_pref("general.smoothScroll.mouseWheel.durationMaxMS", 100);
user_pref("general.smoothScroll.mouseWheel.durationMinMS", 0);
user_pref("general.smoothScroll.msdPhysics.continuousMotionMaxDeltaMS", 12);
user_pref("general.smoothScroll.msdPhysics.enabled", true);
user_pref("general.smoothScroll.msdPhysics.motionBeginSpringConstant", 175);
user_pref("general.smoothScroll.msdPhysics.regularSpringConstant", 1500);
user_pref("general.smoothScroll.msdPhysics.slowdownMinDeltaMS", 10);
user_pref("general.smoothScroll.msdPhysics.slowdownMinDeltaRatio", "1.1");
user_pref("general.smoothScroll.msdPhysics.slowdownSpringConstant", 1000);
user_pref("general.smoothScroll.other.durationMaxMS", 100);
user_pref("general.smoothScroll.other.durationMinMS", 0);
user_pref("general.smoothScroll.pages.durationMaxMS", 100);
user_pref("general.smoothScroll.pages.durationMinMS", 0);
user_pref("general.smoothScroll.pixels.durationMaxMS", 100);
user_pref("general.smoothScroll.pixels.durationMinMS", 0);
user_pref("general.smoothScroll.scrollbars.durationMaxMS", 100);
user_pref("general.smoothScroll.scrollbars.durationMinMS", 0);
user_pref("general.smoothScroll.stopDecelerationWeighting", "1.0");
user_pref("layers.async-pan-zoom.enabled", true);
user_pref("layout.css.scroll-behavior.spring-constant", "250");
user_pref("mousewheel.acceleration.factor", 10);
user_pref("mousewheel.acceleration.start", -1);
user_pref("mousewheel.default.delta_multiplier_x", 100);
user_pref("mousewheel.default.delta_multiplier_y", 100);
user_pref("mousewheel.default.delta_multiplier_z", 100);
user_pref("mousewheel.min_line_scroll_amount", 0);
user_pref("mousewheel.system_scroll_override.enabled", true);
user_pref("mousewheel.system_scroll_override.horizontal.factor", 200);
user_pref("mousewheel.system_scroll_override.vertical.factor", 200);
user_pref("mousewheel.system_scroll_override_on_root_content.enabled", false);
user_pref("mousewheel.transaction.timeout", 1500);
user_pref("toolkit.scrollbox.horizontalScrollDistance", 4);
user_pref("toolkit.scrollbox.verticalScrollDistance", 3);


/* Telemetry & Privacy ***/
user_pref("app.normandy.enabled", false);
user_pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false);
user_pref("browser.newtabpage.activity-stream.feeds.discoverystreamfeed", false);
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
user_pref("browser.newtabpage.activity-stream.feeds.snippets", false);
user_pref("browser.newtabpage.activity-stream.feeds.telemetry", false);
user_pref("browser.newtabpage.activity-stream.showSponsored", false);
user_pref("browser.newtabpage.activity-stream.telemetry", false);
user_pref("browser.ping-centre.telemetry", false);
user_pref("browser.tabs.crashReporting.sendReport", false);
user_pref("corroborator.enabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("extensions.abuseReport.enabled", false);
user_pref("toolkit.telemetry.archive.enabled", false);
user_pref("toolkit.telemetry.bhrPing.enabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.firstShutdownPing.enabled", false);
user_pref("toolkit.telemetry.newProfilePing.enabled", false);
user_pref("toolkit.telemetry.server", "data:,");
user_pref("toolkit.telemetry.shutdownPingSender.enabled", false);
user_pref("toolkit.telemetry.unified", false);
user_pref("toolkit.telemetry.updatePing.enabled", false);
