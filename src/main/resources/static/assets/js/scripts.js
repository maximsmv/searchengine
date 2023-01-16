'use strict';
(function ($) {

    var px = ''; //'rt--'

    /**
     * Функция для вывода набора jQuery по селектору, к селектору добавляются
     * префиксы
     *
     * @param {string} selector Принимает селектор для формирования набора
     * @return {jQuery} Возвращает новый jQuery набор по выбранным селекторам
     */
    function $x(selector) {
        return $(x(selector));
    }

    /**
     * Функция для автоматического добавления префиксов к селекторы
     *
     * @param {string} selector Принимает селектор для формирования набора
     * @return {string} Возвращает новый jQuery набор по выбранным селекторам
     */
    function x(selector) {
        var arraySelectors = selector.split('.'),
            firstNotClass = !!arraySelectors[0];

        selector = '';

        for (var i = 0; i < arraySelectors.length; i++) {
            if (!i) {
                if (firstNotClass) selector += arraySelectors[i];
                continue;
            }
            selector += '.' + px + arraySelectors[i];
        }

        return selector;
    }

    $(function () {var button = function(){
    return {
        init: function(){
            $('.Site').on('click', 'a.btn[disabled="disabled"]', function(e){
                e.preventDefault();
            });
        }
    };
};
button().init();

/*!
 * jQuery Form Plugin
 * version: 3.37.0-2013.07.11
 * @requires jQuery v1.5 or later
 * Copyright (c) 2013 M. Alsup
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Project repository: https://github.com/malsup/form
 * Dual licensed under the MIT and GPL licenses.
 * https://github.com/malsup/form#copyright-and-license
 */
/*global ActiveXObject */
;(function($) {
"use strict";

/*
    Usage Note:
    -----------
    Do not use both ajaxSubmit and ajaxForm on the same form.  These
    functions are mutually exclusive.  Use ajaxSubmit if you want
    to bind your own submit handler to the form.  For example,

    $(document).ready(function() {
        $('#myForm').on('submit', function(e) {
            e.preventDefault(); // <-- important
            $(this).ajaxSubmit({
                target: '#output'
            });
        });
    });

    Use ajaxForm when you want the plugin to manage all the event binding
    for you.  For example,

    $(document).ready(function() {
        $('#myForm').ajaxForm({
            target: '#output'
        });
    });

    You can also use ajaxForm with delegation (requires jQuery v1.7+), so the
    form does not have to exist when you invoke ajaxForm:

    $('#myForm').ajaxForm({
        delegation: true,
        target: '#output'
    });

    When using ajaxForm, the ajaxSubmit function will be invoked for you
    at the appropriate time.
*/

/**
 * Feature detection
 */
var feature = {};
feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
feature.formdata = window.FormData !== undefined;

var hasProp = !!$.fn.prop;

// attr2 uses prop when it can but checks the return type for
// an expected string.  this accounts for the case where a form 
// contains inputs with names like "action" or "method"; in those
// cases "prop" returns the element
$.fn.attr2 = function() {
    if ( ! hasProp )
        return this.attr.apply(this, arguments);
    var val = this.prop.apply(this, arguments);
    if ( ( val && val.jquery ) || typeof val === 'string' )
        return val;
    return this.attr.apply(this, arguments);
};

/**
 * ajaxSubmit() provides a mechanism for immediately submitting
 * an HTML form using AJAX.
 */
$.fn.ajaxSubmit = function(options) {
    /*jshint scripturl:true */

    // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
    if (!this.length) {
        log('ajaxSubmit: skipping submit process - no element selected');
        return this;
    }

    var method, action, url, $form = this;

    if (typeof options == 'function') {
        options = { success: options };
    }
    else if ( options === undefined ) {
        options = {};
    }

    method = options.type || this.attr2('method');
    action = options.url  || this.attr2('action');

    url = (typeof action === 'string') ? $.trim(action) : '';
    url = url || window.location.href || '';
    if (url) {
        // clean url (don't include hash vaue)
        url = (url.match(/^([^#]+)/)||[])[1];
    }

    options = $.extend(true, {
        url:  url,
        success: $.ajaxSettings.success,
        type: method || 'GET',
        iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
    }, options);

    // hook for manipulating the form data before it is extracted;
    // convenient for use with rich editors like tinyMCE or FCKEditor
    var veto = {};
    this.trigger('form-pre-serialize', [this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
        return this;
    }

    // provide opportunity to alter form data before it is serialized
    if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSerialize callback');
        return this;
    }

    var traditional = options.traditional;
    if ( traditional === undefined ) {
        traditional = $.ajaxSettings.traditional;
    }

    var elements = [];
    var qx, a = this.formToArray(options.semantic, elements);
    if (options.data) {
        options.extraData = options.data;
        qx = $.param(options.data, traditional);
    }

    // give pre-submit callback an opportunity to abort the submit
    if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSubmit callback');
        return this;
    }

    // fire vetoable 'validate' event
    this.trigger('form-submit-validate', [a, this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
        return this;
    }

    var q = $.param(a, traditional);
    if (qx) {
        q = ( q ? (q + '&' + qx) : qx );
    }
    if (options.type.toUpperCase() == 'GET') {
        options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
        options.data = null;  // data is null for 'get'
    }
    else {
        options.data = q; // data is the query string for 'post'
    }

    var callbacks = [];
    if (options.resetForm) {
        callbacks.push(function() { $form.resetForm(); });
    }
    if (options.clearForm) {
        callbacks.push(function() { $form.clearForm(options.includeHidden); });
    }

    // perform a load on the target only if dataType is not provided
    if (!options.dataType && options.target) {
        var oldSuccess = options.success || function(){};
        callbacks.push(function(data) {
            var fn = options.replaceTarget ? 'replaceWith' : 'html';
            $(options.target)[fn](data).each(oldSuccess, arguments);
        });
    }
    else if (options.success) {
        callbacks.push(options.success);
    }

    options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
        var context = options.context || this ;    // jQuery 1.4+ supports scope context
        for (var i=0, max=callbacks.length; i < max; i++) {
            callbacks[i].apply(context, [data, status, xhr || $form, $form]);
        }
    };

    if (options.error) {
        var oldError = options.error;
        options.error = function(xhr, status, error) {
            var context = options.context || this;
            oldError.apply(context, [xhr, status, error, $form]);
        };
    }

     if (options.complete) {
        var oldComplete = options.complete;
        options.complete = function(xhr, status) {
            var context = options.context || this;
            oldComplete.apply(context, [xhr, status, $form]);
        };
    }

    // are there files to upload?

    // [value] (issue #113), also see comment:
    // https://github.com/malsup/form/commit/588306aedba1de01388032d5f42a60159eea9228#commitcomment-2180219
    var fileInputs = $('input[type=file]:enabled[value!=""]', this);

    var hasFileInputs = fileInputs.length > 0;
    var mp = 'multipart/form-data';
    var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

    var fileAPI = feature.fileapi && feature.formdata;
    log("fileAPI :" + fileAPI);
    var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;

    var jqxhr;

    // options.iframe allows user to force iframe mode
    // 06-NOV-09: now defaulting to iframe mode if file input is detected
    if (options.iframe !== false && (options.iframe || shouldUseFrame)) {
        // hack to fix Safari hang (thanks to Tim Molendijk for this)
        // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
        if (options.closeKeepAlive) {
            $.get(options.closeKeepAlive, function() {
                jqxhr = fileUploadIframe(a);
            });
        }
        else {
            jqxhr = fileUploadIframe(a);
        }
    }
    else if ((hasFileInputs || multipart) && fileAPI) {
        jqxhr = fileUploadXhr(a);
    }
    else {
        jqxhr = $.ajax(options);
    }

    $form.removeData('jqxhr').data('jqxhr', jqxhr);

    // clear element array
    for (var k=0; k < elements.length; k++)
        elements[k] = null;

    // fire 'notify' event
    this.trigger('form-submit-notify', [this, options]);
    return this;

    // utility fn for deep serialization
    function deepSerialize(extraData){
        var serialized = $.param(extraData, options.traditional).split('&');
        var len = serialized.length;
        var result = [];
        var i, part;
        for (i=0; i < len; i++) {
            // #252; undo param space replacement
            serialized[i] = serialized[i].replace(/\+/g,' ');
            part = serialized[i].split('=');
            // #278; use array instead of object storage, favoring array serializations
            result.push([decodeURIComponent(part[0]), decodeURIComponent(part[1])]);
        }
        return result;
    }

     // XMLHttpRequest Level 2 file uploads (big hat tip to francois2metz)
    function fileUploadXhr(a) {
        var formdata = new FormData();

        for (var i=0; i < a.length; i++) {
            formdata.append(a[i].name, a[i].value);
        }

        if (options.extraData) {
            var serializedData = deepSerialize(options.extraData);
            for (i=0; i < serializedData.length; i++)
                if (serializedData[i])
                    formdata.append(serializedData[i][0], serializedData[i][1]);
        }

        options.data = null;

        var s = $.extend(true, {}, $.ajaxSettings, options, {
            contentType: false,
            processData: false,
            cache: false,
            type: method || 'POST'
        });

        if (options.uploadProgress) {
            // workaround because jqXHR does not expose upload property
            s.xhr = function() {
                var xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function(event) {
                        var percent = 0;
                        var position = event.loaded || event.position; /*event.position is deprecated*/
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }
                        options.uploadProgress(event, position, total, percent);
                    }, false);
                }
                return xhr;
            };
        }

        s.data = null;
            var beforeSend = s.beforeSend;
            s.beforeSend = function(xhr, o) {
                o.data = formdata;
                if(beforeSend)
                    beforeSend.call(this, xhr, o);
        };
        return $.ajax(s);
    }

    // private function for handling file uploads (hat tip to YAHOO!)
    function fileUploadIframe(a) {
        var form = $form[0], el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
        var deferred = $.Deferred();

        if (a) {
            // ensure that every serialized input is still enabled
            for (i=0; i < elements.length; i++) {
                el = $(elements[i]);
                if ( hasProp )
                    el.prop('disabled', false);
                else
                    el.removeAttr('disabled');
            }
        }

        s = $.extend(true, {}, $.ajaxSettings, options);
        s.context = s.context || s;
        id = 'jqFormIO' + (new Date().getTime());
        if (s.iframeTarget) {
            $io = $(s.iframeTarget);
            n = $io.attr2('name');
            if (!n)
                 $io.attr2('name', id);
            else
                id = n;
        }
        else {
            $io = $('<iframe name="' + id + '" src="'+ s.iframeSrc +'" />');
            $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
        }
        io = $io[0];


        xhr = { // mock object
            aborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {},
            abort: function(status) {
                var e = (status === 'timeout' ? 'timeout' : 'aborted');
                log('aborting upload... ' + e);
                this.aborted = 1;

                try { // #214, #257
                    if (io.contentWindow.document.execCommand) {
                        io.contentWindow.document.execCommand('Stop');
                    }
                }
                catch(ignore) {}

                $io.attr('src', s.iframeSrc); // abort op in progress
                xhr.error = e;
                if (s.error)
                    s.error.call(s.context, xhr, e, status);
                if (g)
                    $.event.trigger("ajaxError", [xhr, s, e]);
                if (s.complete)
                    s.complete.call(s.context, xhr, e);
            }
        };

        g = s.global;
        // trigger ajax global events so that activity/block indicators work like normal
        if (g && 0 === $.active++) {
            $.event.trigger("ajaxStart");
        }
        if (g) {
            $.event.trigger("ajaxSend", [xhr, s]);
        }

        if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
            if (s.global) {
                $.active--;
            }
            deferred.reject();
            return deferred;
        }
        if (xhr.aborted) {
            deferred.reject();
            return deferred;
        }

        // add submitting element to data if we know it
        sub = form.clk;
        if (sub) {
            n = sub.name;
            if (n && !sub.disabled) {
                s.extraData = s.extraData || {};
                s.extraData[n] = sub.value;
                if (sub.type == "image") {
                    s.extraData[n+'.x'] = form.clk_x;
                    s.extraData[n+'.y'] = form.clk_y;
                }
            }
        }

        var CLIENT_TIMEOUT_ABORT = 1;
        var SERVER_ABORT = 2;
                
        function getDoc(frame) {
            /* it looks like contentWindow or contentDocument do not
             * carry the protocol property in ie8, when running under ssl
             * frame.document is the only valid response document, since
             * the protocol is know but not on the other two objects. strange?
             * "Same origin policy" http://en.wikipedia.org/wiki/Same_origin_policy
             */
            
            var doc = null;
            
            // IE8 cascading access check
            try {
                if (frame.contentWindow) {
                    doc = frame.contentWindow.document;
                }
            } catch(err) {
                // IE8 access denied under ssl & missing protocol
                log('cannot get iframe.contentWindow document: ' + err);
            }

            if (doc) { // successful getting content
                return doc;
            }

            try { // simply checking may throw in ie8 under ssl or mismatched protocol
                doc = frame.contentDocument ? frame.contentDocument : frame.document;
            } catch(err) {
                // last attempt
                log('cannot get iframe.contentDocument: ' + err);
                doc = frame.document;
            }
            return doc;
        }

        // Rails CSRF hack (thanks to Yvan Barthelemy)
        var csrf_token = $('meta[name=csrf-token]').attr('content');
        var csrf_param = $('meta[name=csrf-param]').attr('content');
        if (csrf_param && csrf_token) {
            s.extraData = s.extraData || {};
            s.extraData[csrf_param] = csrf_token;
        }

        // take a breath so that pending repaints get some cpu time before the upload starts
        function doSubmit() {
            // make sure form attrs are set
            var t = $form.attr2('target'), a = $form.attr2('action');

            // update form attrs in IE friendly way
            form.setAttribute('target',id);
            if (!method) {
                form.setAttribute('method', 'POST');
            }
            if (a != s.url) {
                form.setAttribute('action', s.url);
            }

            // ie borks in some cases when setting encoding
            if (! s.skipEncodingOverride && (!method || /post/i.test(method))) {
                $form.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // support timout
            if (s.timeout) {
                timeoutHandle = setTimeout(function() { timedOut = true; cb(CLIENT_TIMEOUT_ABORT); }, s.timeout);
            }

            // look for server aborts
            function checkState() {
                try {
                    var state = getDoc(io).readyState;
                    log('state = ' + state);
                    if (state && state.toLowerCase() == 'uninitialized')
                        setTimeout(checkState,50);
                }
                catch(e) {
                    log('Server abort: ' , e, ' (', e.name, ')');
                    cb(SERVER_ABORT);
                    if (timeoutHandle)
                        clearTimeout(timeoutHandle);
                    timeoutHandle = undefined;
                }
            }

            // add "extra" data to form if provided in options
            var extraInputs = [];
            try {
                if (s.extraData) {
                    for (var n in s.extraData) {
                        if (s.extraData.hasOwnProperty(n)) {
                           // if using the $.param format that allows for multiple values with the same name
                           if($.isPlainObject(s.extraData[n]) && s.extraData[n].hasOwnProperty('name') && s.extraData[n].hasOwnProperty('value')) {
                               extraInputs.push(
                               $('<input type="hidden" name="'+s.extraData[n].name+'">').val(s.extraData[n].value)
                                   .appendTo(form)[0]);
                           } else {
                               extraInputs.push(
                               $('<input type="hidden" name="'+n+'">').val(s.extraData[n])
                                   .appendTo(form)[0]);
                           }
                        }
                    }
                }

                if (!s.iframeTarget) {
                    // add iframe to doc and submit the form
                    $io.appendTo('body');
                    if (io.attachEvent)
                        io.attachEvent('onload', cb);
                    else
                        io.addEventListener('load', cb, false);
                }
                setTimeout(checkState,15);

                try {
                    form.submit();
                } catch(err) {
                    // just in case form has element with name/id of 'submit'
                    var submitFn = document.createElement('form').submit;
                    submitFn.apply(form);
                }
            }
            finally {
                // reset attrs and remove "extra" input elements
                form.setAttribute('action',a);
                if(t) {
                    form.setAttribute('target', t);
                } else {
                    $form.removeAttr('target');
                }
                $(extraInputs).remove();
            }
        }

        if (s.forceSync) {
            doSubmit();
        }
        else {
            setTimeout(doSubmit, 10); // this lets dom updates render
        }

        var data, doc, domCheckCount = 50, callbackProcessed;

        function cb(e) {
            if (xhr.aborted || callbackProcessed) {
                return;
            }
            
            doc = getDoc(io);
            if(!doc) {
                log('cannot access response document');
                e = SERVER_ABORT;
            }
            if (e === CLIENT_TIMEOUT_ABORT && xhr) {
                xhr.abort('timeout');
                deferred.reject(xhr, 'timeout');
                return;
            }
            else if (e == SERVER_ABORT && xhr) {
                xhr.abort('server abort');
                deferred.reject(xhr, 'error', 'server abort');
                return;
            }

            if (!doc || doc.location.href == s.iframeSrc) {
                // response not received yet
                if (!timedOut)
                    return;
            }
            if (io.detachEvent)
                io.detachEvent('onload', cb);
            else
                io.removeEventListener('load', cb, false);

            var status = 'success', errMsg;
            try {
                if (timedOut) {
                    throw 'timeout';
                }

                var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
                log('isXml='+isXml);
                if (!isXml && window.opera && (doc.body === null || !doc.body.innerHTML)) {
                    if (--domCheckCount) {
                        // in some browsers (Opera) the iframe DOM is not always traversable when
                        // the onload callback fires, so we loop a bit to accommodate
                        log('requeing onLoad callback, DOM not available');
                        setTimeout(cb, 250);
                        return;
                    }
                    // let this fall through because server response could be an empty document
                    //log('Could not access iframe DOM after mutiple tries.');
                    //throw 'DOMException: not available';
                }

                //log('response detected');
                var docRoot = doc.body ? doc.body : doc.documentElement;
                xhr.responseText = docRoot ? docRoot.innerHTML : null;
                xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                if (isXml)
                    s.dataType = 'xml';
                xhr.getResponseHeader = function(header){
                    var headers = {'content-type': s.dataType};
                    return headers[header];
                };
                // support for XHR 'status' & 'statusText' emulation :
                if (docRoot) {
                    xhr.status = Number( docRoot.getAttribute('status') ) || xhr.status;
                    xhr.statusText = docRoot.getAttribute('statusText') || xhr.statusText;
                }

                var dt = (s.dataType || '').toLowerCase();
                var scr = /(json|script|text)/.test(dt);
                if (scr || s.textarea) {
                    // see if user embedded response in textarea
                    var ta = doc.getElementsByTagName('textarea')[0];
                    if (ta) {
                        xhr.responseText = ta.value;
                        // support for XHR 'status' & 'statusText' emulation :
                        xhr.status = Number( ta.getAttribute('status') ) || xhr.status;
                        xhr.statusText = ta.getAttribute('statusText') || xhr.statusText;
                    }
                    else if (scr) {
                        // account for browsers injecting pre around json response
                        var pre = doc.getElementsByTagName('pre')[0];
                        var b = doc.getElementsByTagName('body')[0];
                        if (pre) {
                            xhr.responseText = pre.textContent ? pre.textContent : pre.innerText;
                        }
                        else if (b) {
                            xhr.responseText = b.textContent ? b.textContent : b.innerText;
                        }
                    }
                }
                else if (dt == 'xml' && !xhr.responseXML && xhr.responseText) {
                    xhr.responseXML = toXml(xhr.responseText);
                }

                try {
                    data = httpData(xhr, dt, s);
                }
                catch (err) {
                    status = 'parsererror';
                    xhr.error = errMsg = (err || status);
                }
            }
            catch (err) {
                log('error caught: ',err);
                status = 'error';
                xhr.error = errMsg = (err || status);
            }

            if (xhr.aborted) {
                log('upload aborted');
                status = null;
            }

            if (xhr.status) { // we've set xhr.status
                status = (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) ? 'success' : 'error';
            }

            // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
            if (status === 'success') {
                if (s.success)
                    s.success.call(s.context, data, 'success', xhr);
                deferred.resolve(xhr.responseText, 'success', xhr);
                if (g)
                    $.event.trigger("ajaxSuccess", [xhr, s]);
            }
            else if (status) {
                if (errMsg === undefined)
                    errMsg = xhr.statusText;
                if (s.error)
                    s.error.call(s.context, xhr, status, errMsg);
                deferred.reject(xhr, 'error', errMsg);
                if (g)
                    $.event.trigger("ajaxError", [xhr, s, errMsg]);
            }

            if (g)
                $.event.trigger("ajaxComplete", [xhr, s]);

            if (g && ! --$.active) {
                $.event.trigger("ajaxStop");
            }

            if (s.complete)
                s.complete.call(s.context, xhr, status);

            callbackProcessed = true;
            if (s.timeout)
                clearTimeout(timeoutHandle);

            // clean up
            setTimeout(function() {
                if (!s.iframeTarget)
                    $io.remove();
                xhr.responseXML = null;
            }, 100);
        }

        var toXml = $.parseXML || function(s, doc) { // use parseXML if available (jQuery 1.5+)
            if (window.ActiveXObject) {
                doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = 'false';
                doc.loadXML(s);
            }
            else {
                doc = (new DOMParser()).parseFromString(s, 'text/xml');
            }
            return (doc && doc.documentElement && doc.documentElement.nodeName != 'parsererror') ? doc : null;
        };
        var parseJSON = $.parseJSON || function(s) {
            /*jslint evil:true */
            return window['eval']('(' + s + ')');
        };

        var httpData = function( xhr, type, s ) { // mostly lifted from jq1.4.4

            var ct = xhr.getResponseHeader('content-type') || '',
                xml = type === 'xml' || !type && ct.indexOf('xml') >= 0,
                data = xml ? xhr.responseXML : xhr.responseText;

            if (xml && data.documentElement.nodeName === 'parsererror') {
                if ($.error)
                    $.error('parsererror');
            }
            if (s && s.dataFilter) {
                data = s.dataFilter(data, type);
            }
            if (typeof data === 'string') {
                if (type === 'json' || !type && ct.indexOf('json') >= 0) {
                    data = parseJSON(data);
                } else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                    $.globalEval(data);
                }
            }
            return data;
        };

        return deferred;
    }
};

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of ajaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *    is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *    used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.
 */
$.fn.ajaxForm = function(options) {
    options = options || {};
    options.delegation = options.delegation && $.isFunction($.fn.on);

    // in jQuery 1.3+ we can fix mistakes with the ready state
    if (!options.delegation && this.length === 0) {
        var o = { s: this.selector, c: this.context };
        if (!$.isReady && o.s) {
            log('DOM not ready, queuing ajaxForm');
            $(function() {
                $(o.s,o.c).ajaxForm(options);
            });
            return this;
        }
        // is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
        log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
        return this;
    }

    if ( options.delegation ) {
        $(document)
            .off('submit.form-plugin', this.selector, doAjaxSubmit)
            .off('click.form-plugin', this.selector, captureSubmittingElement)
            .on('submit.form-plugin', this.selector, options, doAjaxSubmit)
            .on('click.form-plugin', this.selector, options, captureSubmittingElement);
        return this;
    }

    return this.ajaxFormUnbind()
        .bind('submit.form-plugin', options, doAjaxSubmit)
        .bind('click.form-plugin', options, captureSubmittingElement);
};

// private event handlers
function doAjaxSubmit(e) {
    /*jshint validthis:true */
    var options = e.data;
    if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
        e.preventDefault();
        $(this).ajaxSubmit(options);
    }
}

function captureSubmittingElement(e) {
    /*jshint validthis:true */
    var target = e.target;
    var $el = $(target);
    if (!($el.is("[type=submit],[type=image]"))) {
        // is this a child element of the submit el?  (ex: a span within a button)
        var t = $el.closest('[type=submit]');
        if (t.length === 0) {
            return;
        }
        target = t[0];
    }
    var form = this;
    form.clk = target;
    if (target.type == 'image') {
        if (e.offsetX !== undefined) {
            form.clk_x = e.offsetX;
            form.clk_y = e.offsetY;
        } else if (typeof $.fn.offset == 'function') {
            var offset = $el.offset();
            form.clk_x = e.pageX - offset.left;
            form.clk_y = e.pageY - offset.top;
        } else {
            form.clk_x = e.pageX - target.offsetLeft;
            form.clk_y = e.pageY - target.offsetTop;
        }
    }
    // clear form vars
    setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 100);
}


// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
$.fn.ajaxFormUnbind = function() {
    return this.unbind('submit.form-plugin click.form-plugin');
};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 */
$.fn.formToArray = function(semantic, elements) {
    var a = [];
    if (this.length === 0) {
        return a;
    }

    var form = this[0];
    var els = semantic ? form.getElementsByTagName('*') : form.elements;
    if (!els) {
        return a;
    }

    var i,j,n,v,el,max,jmax;
    for(i=0, max=els.length; i < max; i++) {
        el = els[i];
        n = el.name;
        if (!n || el.disabled) {
            continue;
        }

        if (semantic && form.clk && el.type == "image") {
            // handle image inputs on the fly when semantic == true
            if(form.clk == el) {
                a.push({name: n, value: $(el).val(), type: el.type });
                a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
            }
            continue;
        }

        v = $.fieldValue(el, true);
        if (v && v.constructor == Array) {
            if (elements)
                elements.push(el);
            for(j=0, jmax=v.length; j < jmax; j++) {
                a.push({name: n, value: v[j]});
            }
        }
        else if (feature.fileapi && el.type == 'file') {
            if (elements)
                elements.push(el);
            var files = el.files;
            if (files.length) {
                for (j=0; j < files.length; j++) {
                    a.push({name: n, value: files[j], type: el.type});
                }
            }
            else {
                // #180
                a.push({ name: n, value: '', type: el.type });
            }
        }
        else if (v !== null && typeof v != 'undefined') {
            if (elements)
                elements.push(el);
            a.push({name: n, value: v, type: el.type, required: el.required});
        }
    }

    if (!semantic && form.clk) {
        // input type=='image' are not found in elements array! handle it here
        var $input = $(form.clk), input = $input[0];
        n = input.name;
        if (n && !input.disabled && input.type == 'image') {
            a.push({name: n, value: $input.val()});
            a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
        }
    }
    return a;
};

/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 */
$.fn.formSerialize = function(semantic) {
    //hand off to jQuery.param for proper encoding
    return $.param(this.formToArray(semantic));
};

/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 */
$.fn.fieldSerialize = function(successful) {
    var a = [];
    this.each(function() {
        var n = this.name;
        if (!n) {
            return;
        }
        var v = $.fieldValue(this, successful);
        if (v && v.constructor == Array) {
            for (var i=0,max=v.length; i < max; i++) {
                a.push({name: n, value: v[i]});
            }
        }
        else if (v !== null && typeof v != 'undefined') {
            a.push({name: this.name, value: v});
        }
    });
    //hand off to jQuery.param for proper encoding
    return $.param(a);
};

/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *      <input name="A" type="text" />
 *      <input name="A" type="text" />
 *      <input name="B" type="checkbox" value="B1" />
 *      <input name="B" type="checkbox" value="B2"/>
 *      <input name="C" type="radio" value="C1" />
 *      <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $('input[type=text]').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $('input[type=checkbox]').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $('input[type=radio]').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *    array will be empty, otherwise it will contain one or more values.
 */
$.fn.fieldValue = function(successful) {
    for (var val=[], i=0, max=this.length; i < max; i++) {
        var el = this[i];
        var v = $.fieldValue(el, successful);
        if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
            continue;
        }
        if (v.constructor == Array)
            $.merge(val, v);
        else
            val.push(v);
    }
    return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (successful === undefined) {
        successful = true;
    }

    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1)) {
            return null;
    }

    if (tag == 'select') {
        var index = el.selectedIndex;
        if (index < 0) {
            return null;
        }
        var a = [], ops = el.options;
        var one = (t == 'select-one');
        var max = (one ? index+1 : ops.length);
        for(var i=(one ? index : 0); i < max; i++) {
            var op = ops[i];
            if (op.selected) {
                var v = op.value;
                if (!v) { // extra pain for IE...
                    v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
                }
                if (one) {
                    return v;
                }
                a.push(v);
            }
        }
        return a;
    }
    return $(el).val();
};

/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 */
$.fn.clearForm = function(includeHidden) {
    return this.each(function() {
        $('input,select,textarea', this).clearFields(includeHidden);
    });
};

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
    var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // 'hidden' is not in this list
    return this.each(function() {
        var t = this.type, tag = this.tagName.toLowerCase();
        if (re.test(t) || tag == 'textarea') {
            this.value = '';
        }
        else if (t == 'checkbox' || t == 'radio') {
            this.checked = false;
        }
        else if (tag == 'select') {
            this.selectedIndex = -1;
        }
		else if (t == "file") {
			if (/MSIE/.test(navigator.userAgent)) {
				$(this).replaceWith($(this).clone(true));
			} else {
				$(this).val('');
			}
		}
        else if (includeHidden) {
            // includeHidden can be the value true, or it can be a selector string
            // indicating a special test; for example:
            //  $('#myForm').clearForm('.special:hidden')
            // the above would clean hidden inputs that have the class of 'special'
            if ( (includeHidden === true && /hidden/.test(t)) ||
                 (typeof includeHidden == 'string' && $(this).is(includeHidden)) )
                this.value = '';
        }
    });
};

/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 */
$.fn.resetForm = function() {
    return this.each(function() {
        // guard against an input with the name of 'reset'
        // note that IE reports the reset function as an 'object'
        if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
            this.reset();
        }
    });
};

/**
 * Enables or disables any matching elements.
 */
$.fn.enable = function(b) {
    if (b === undefined) {
        b = true;
    }
    return this.each(function() {
        this.disabled = !b;
    });
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 */
$.fn.selected = function(select) {
    if (select === undefined) {
        select = true;
    }
    return this.each(function() {
        var t = this.type;
        if (t == 'checkbox' || t == 'radio') {
            this.checked = select;
        }
        else if (this.tagName.toLowerCase() == 'option') {
            var $sel = $(this).parent('select');
            if (select && $sel[0] && $sel[0].type == 'select-one') {
                // deselect all other options
                $sel.find('option').selected(false);
            }
            this.selected = select;
        }
    });
};

// expose debug var
$.fn.ajaxSubmit.debug = false;

// helper fn for console logging
function log() {
    if (!$.fn.ajaxSubmit.debug)
        return;
    var msg = '[jquery.form] ' + Array.prototype.join.call(arguments,'');
    if (window.console && window.console.log) {
        window.console.log(msg);
    }
    else if (window.opera && window.opera.postError) {
        window.opera.postError(msg);
    }
}

})(jQuery);

/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b,c=navigator.userAgent,d=/iphone/i.test(c),e=/chrome/i.test(c),f=/android/i.test(c);a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},autoclear:!0,dataName:"rawMaskFn",placeholder:"_"},a.fn.extend({caret:function(a,b){var c;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof a?(b="number"==typeof b?b:a,this.each(function(){this.setSelectionRange?this.setSelectionRange(a,b):this.createTextRange&&(c=this.createTextRange(),c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select())})):(this[0].setSelectionRange?(a=this[0].selectionStart,b=this[0].selectionEnd):document.selection&&document.selection.createRange&&(c=document.selection.createRange(),a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length),{begin:a,end:b})},unmask:function(){return this.trigger("unmask")},mask:function(c,g){var h,i,j,k,l,m,n,o;if(!c&&this.length>0){h=a(this[0]);var p=h.data(a.mask.dataName);return p?p():void 0}return g=a.extend({autoclear:a.mask.autoclear,placeholder:a.mask.placeholder,completed:null},g),i=a.mask.definitions,j=[],k=n=c.length,l=null,a.each(c.split(""),function(a,b){"?"==b?(n--,k=a):i[b]?(j.push(new RegExp(i[b])),null===l&&(l=j.length-1),k>a&&(m=j.length-1)):j.push(null)}),this.trigger("unmask").each(function(){function h(){if(g.completed){for(var a=l;m>=a;a++)if(j[a]&&C[a]===p(a))return;g.completed.call(B)}}function p(a){return g.placeholder.charAt(a<g.placeholder.length?a:0)}function q(a){for(;++a<n&&!j[a];);return a}function r(a){for(;--a>=0&&!j[a];);return a}function s(a,b){var c,d;if(!(0>a)){for(c=a,d=q(b);n>c;c++)if(j[c]){if(!(n>d&&j[c].test(C[d])))break;C[c]=C[d],C[d]=p(d),d=q(d)}z(),B.caret(Math.max(l,a))}}function t(a){var b,c,d,e;for(b=a,c=p(a);n>b;b++)if(j[b]){if(d=q(b),e=C[b],C[b]=c,!(n>d&&j[d].test(e)))break;c=e}}function u(){var a=B.val(),b=B.caret();if(o&&o.length&&o.length>a.length){for(A(!0);b.begin>0&&!j[b.begin-1];)b.begin--;if(0===b.begin)for(;b.begin<l&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}else{for(A(!0);b.begin<n&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}h()}function v(){A(),B.val()!=E&&B.change()}function w(a){if(!B.prop("readonly")){var b,c,e,f=a.which||a.keyCode;o=B.val(),8===f||46===f||d&&127===f?(b=B.caret(),c=b.begin,e=b.end,e-c===0&&(c=46!==f?r(c):e=q(c-1),e=46===f?q(e):e),y(c,e),s(c,e-1),a.preventDefault()):13===f?v.call(this,a):27===f&&(B.val(E),B.caret(0,A()),a.preventDefault())}}function x(b){if(!B.prop("readonly")){var c,d,e,g=b.which||b.keyCode,i=B.caret();if(!(b.ctrlKey||b.altKey||b.metaKey||32>g)&&g&&13!==g){if(i.end-i.begin!==0&&(y(i.begin,i.end),s(i.begin,i.end-1)),c=q(i.begin-1),n>c&&(d=String.fromCharCode(g),j[c].test(d))){if(t(c),C[c]=d,z(),e=q(c),f){var k=function(){a.proxy(a.fn.caret,B,e)()};setTimeout(k,0)}else B.caret(e);i.begin<=m&&h()}b.preventDefault()}}}function y(a,b){var c;for(c=a;b>c&&n>c;c++)j[c]&&(C[c]=p(c))}function z(){B.val(C.join(""))}function A(a){var b,c,d,e=B.val(),f=-1;for(b=0,d=0;n>b;b++)if(j[b]){for(C[b]=p(b);d++<e.length;)if(c=e.charAt(d-1),j[b].test(c)){C[b]=c,f=b;break}if(d>e.length){y(b+1,n);break}}else C[b]===e.charAt(d)&&d++,k>b&&(f=b);return a?z():k>f+1?g.autoclear||C.join("")===D?(B.val()&&B.val(""),y(0,n)):z():(z(),B.val(B.val().substring(0,f+1))),k?b:l}var B=a(this),C=a.map(c.split(""),function(a,b){return"?"!=a?i[a]?p(b):a:void 0}),D=C.join(""),E=B.val();B.data(a.mask.dataName,function(){return a.map(C,function(a,b){return j[b]&&a!=p(b)?a:null}).join("")}),B.one("unmask",function(){B.off(".mask").removeData(a.mask.dataName)}).on("focus.mask",function(){if(!B.prop("readonly")){clearTimeout(b);var a;E=B.val(),a=A(),b=setTimeout(function(){B.get(0)===document.activeElement&&(z(),a==c.replace("?","").length?B.caret(0,a):B.caret(a))},10)}}).on("blur.mask",v).on("keydown.mask",w).on("keypress.mask",x).on("input.mask paste.mask",function(){B.prop("readonly")||setTimeout(function(){var a=A(!0);B.caret(a),h()},0)}),e&&f&&B.off("input.mask").on("input.mask",u),A()})}})});
var form = function(){
    var $selectList = $('.selectList');
    var $input = $('.form-input, .form-textarea');
    var $form = $('.form');
    var $select = $('.form-select');
    return {
        init: function(){
            $selectList.each(function(){
                var $this = $(this),
                    $radio= $this.find('input[type="radio"]');
                function changeTitle($block, $element) {
                    $block.find('.selectList-title')
                        .text( $element.closest('.selectList-item')
                            .find('.selectList-text').text())
                }
                changeTitle($this, $radio.filter('[checked="checked"]'));
                $radio.on('change', function(){
                    changeTitle($this, $(this));
                });
                
            });
            $(document).on('click', function(e){
                var $this = $(e.target);
                if (!$this.hasClass('selectList-header') ) {
                    $this = $(e.target).closest('.selectList-header');
                }
                if ( $this.length ){
                    e.preventDefault();
                    $this.closest('.selectList').toggleClass('selectList_OPEN');
                } else {
                    $('.selectList').removeClass('selectList_OPEN');
                }
            });
            
            // Валидация полей
            $input.on('blur', function(){
                var $this = $(this),
                    validate = $this.data('validate'),
                    message = '',
                    error = false;
                if (validate){
                    validate = validate.split(' ');
                    validate.forEach(function(v){
                        switch (v){
                            case 'require':
                                if (!$this.val()
                                    && !$this.prop('disabled')
                                    ) {
                                        message += 'Это поле обязательно для заполнения. ';
                                        error = true;
                                }
                                break;
                            case 'mail':
                                if ($this.val()!==''
                                    && !$this.val().match(/\w+@\w+\.\w+/)
                                    && !$this.prop('disabled')
                                    ) {
                                        message += 'Нужно ввести адрес почты в формате xxx@xxx.xx';
                                        error = true;
                                }
                                break;
                            case 'key':
                                if ($this.val()!==''
                                    && !$this.val().replace(' ', '').match(/\d{6}/)
                                    && !$this.prop('disabled')
                                    ){
                                        message += 'Код должен состоять из 6 цифр';
                                        error = true;
                                }
            
                        }
                    });
                    
                    if (error) {
                        if ($this.hasClass('form-input')){
                            $this.addClass('form-input_error');
                        }
                        if ($this.hasClass('form-textarea')){
                            $this.addClass('form-textarea_error');
                        }
                        if (!$this.next('.form-error').length){
                            $this.after('<div class="form-error">'+message+'</div>');
                        } else {
                            $this.next('.form-error').text(message);
            
                        }
                        $this.data('errorinput', true);
                    } else {
                        $this.next('.form-error').remove();
                        $this.removeClass('form-input_error');
                        $this.removeClass('form-textarea_error');
                        $this.data('errorinput', false);
                    }
                    message = '';
                }
            });
            $form.on('submit', function(e){
                var $this = $(this),
                    $validate = $this.find('[data-validate]');
                
                $validate.each(function(){
                    var $this = $(this);
                    $this.trigger('blur');
                    if ($this.data('errorinput')){
                        e.preventDefault();
                    }
                });
            });
            $select.wrap('<div class="form-selectWrap"></div>');
            $('[data-mask]').each(function(){
                var $this = $(this);
                $this.mask($this.data('mask'), {placeholder:'x'});
            });
        }
    };
};
form().init();

var menu = function(){
    var $menuMain = $('.menu_main');
    $menuMain.css('position', 'absolute');
    var menuHeight = $('.menu_main').outerHeight();
    $menuMain.css('position', 'static');
    var $body = $('body');
    function refresh(){
        if (window.innerWidth<991) {
            // $('.menuModal').each(function(){
            //     var $this = $(this);
            //     setTimeout(function(){
            //         if ($this.attr('height') > 0) {
            //             $this.css('height', 0);
            //         }
            //     }, 100);
            // });
            $('.menuModal').css('height', 0);
            $menuMain.css('position', 'absolute');
            menuHeight = $('.menu_main').outerHeight();
            $menuMain.css('position', 'static');
        } else {
            menuHeight = $('.menu_main').outerHeight();
            $('.menuModal')
                .removeClass("menuModal_OPEN")
                .css('height', '');
            $body.removeClass("Site_menuOPEN");
            $('.menuTrigger').removeClass("menuTrigger_OPEN");
        }
    }

    return {
        init: function(){
            if (window.innerWidth<991) {
            $(".menuModal").css('height', menuHeight);
            // Меню для мобильных
                $(".menuTrigger").each(function () {
                    $($(this).attr('href')).css('height', 0);
                });
            }

            $(".menuTrigger").click(function(e){
                var $this = $(this),
                    href = $this.attr("href");

                if ($this.hasClass("menuTrigger_OPEN")) {
                    $body.removeClass("Site_menuOPEN");
                    $(href)
                        .removeClass("menuModal_OPEN")
                        .css('height', 0);
                    $this.removeClass("menuTrigger_OPEN");
                }else{
                    $body.addClass("Site_menuOPEN");
                    $(href)
                        .addClass("menuModal_OPEN")
                        .css('height', menuHeight);
                    $this.addClass("menuTrigger_OPEN");
                }
                e.preventDefault();
            });
            $(window).on('resize', refresh);
        }
    };
};
menu().init();


var table = function(){
    return {
        init: function(){
        }
    };
};
table().init();

var API = function(){
    function sendData(address, type, data, cb, $this) {
        $.ajax({
            url: backendApiUrl + address,
            type: type,
            dataType: 'json',
            data: data,
            complete: function(result) {
                if (result.status===200) {
                    cb(result.responseJSON, $this, data);
                } else {
                    alert('Ошибка ' + result.status);
                }
            }
        });
    }
    
    var send = {
        startIndexing:{
            address: '/startIndexing',
            type: 'GET',
            action: function(result, $this){
                if (result.result){
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').remove();
                    }
                    if ($this.is('[data-btntype="check"]')) {
                        shiftCheck($this);
                    }
                } else {
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').text(result.error);
                    } else {
                        $this.after('<div class="API-error">' + result.error + '</div>');
                    }
                }
            }
        },
        stopIndexing: {
            address: '/stopIndexing',
            type: 'GET',
            action: function(result, $this){
                if (result.result){
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').remove();
                    }
                    if ($this.is('[data-btntype="check"]')) {
                        shiftCheck($this);
                    }
                } else {
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').text(result.error);
                    } else {
                        $this.after('<div class="API-error">' + result.error + '</div>');
                    }
                }
            }
        },
        indexPage: {
            address: '/indexPage',
            type: 'POST',
            action: function(result, $this){
                if (result.result){
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').remove();
                    }
                    if ($this.next('.API-success').length) {
                        $this.next('.API-success').text('Страница добавлена/обновлена успешно');
                    } else {
                        $this.after('<div class="API-success">Страница поставлена в очередь на обновление / добавление</div>');
                    }
                } else {
                    if ($this.next('.API-success').length) {
                        $this.next('.API-success').remove();
                    }
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').text(result.error);
                    } else {
                        $this.after('<div class="API-error">' + result.error + '</div>');
                    }
                }
            }
        },
        search: {
            address: '/search',
            type: 'get',
            action: function(result, $this, data){
                if (result.result){
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').remove();
                    }
                    var $searchResults = $('.SearchResult'),
                        $content = $searchResults.find('.SearchResult-content');
                    if (data.offset === 0) {
                        $content.empty();
                    }
                    $searchResults.find('.SearchResult-amount').text(result.count);
                    var scroll = $(window).scrollTop();
                    result.data.forEach(function(page){
                        $content.append('<div class="SearchResult-block">' +
                            '<a href="' + page.site + page.uri +'" target="_blank" class="SearchResult-siteTitle">' +
                                (!data.siteName ? page.siteName + ' - ': '') +
                                page.title +
                            '</a>' +
                            '<div class="SearchResult-description">' +
                                page.snippet +
                            '</div>' +
                        '</div>')
                    });
                    $(window).scrollTop(scroll);
                    $searchResults.addClass('SearchResult_ACTIVE');
                    if (result.count > data.offset + result.data.length) {
                        $('.SearchResult-footer').removeClass('SearchResult-footer_hide')
                        $('.SearchResult-footer button[data-send="search"]')
                            .data('sendoffset', data.offset + result.data.length)
                            .data('searchquery', data.query)
                            .data('searchsite', data.site)
                            .data('sendlimit', data.limit);
                        $('.SearchResult-remain').text('(' + (result.count - data.offset - result.data.length) + ')')
                    } else {
                        $('.SearchResult-footer').addClass('SearchResult-footer_hide')
                    }
                    
                } else {
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').text(result.error);
                    } else {
                        $this.after('<div class="API-error">' + result.error + '</div>');
                    }
                }
            }
        },
        statistics: {
            address: '/statistics',
            type: 'get',
            action: function(result, $this){
                if (result.result){
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').remove();
                    }
    
                    var $statistics = $('.Statistics');
                    $statistics.find('.HideBlock').not('.Statistics-example').remove();
                    $('#totalSites').text(result.statistics.total.sites);
                    $('#totalPages').text(result.statistics.total.pages);
                    $('#totalLemmas').text(result.statistics.total.lemmas);
                    $('select[name="site"] option').not(':first-child').remove();
                    result.statistics.detailed.forEach(function(site){
                        var $blockSiteExample = $('.Statistics-example').clone(true);
                        var statusClass = '';
                        switch (site.status) {
                            case 'INDEXED':
                                statusClass = 'Statistics-status_checked';
                                break;
                            case 'FAILED':
                                statusClass = 'Statistics-status_cancel';
                                break;
                            case 'INDEXING':
                                statusClass = 'Statistics-status_pause';
                                break;
                            
                        }
                        $('select[name="site"]').append('' +
                            '<option value="' + site.url + '">' +
                                site.url +
                            '</option>')
                        $blockSiteExample.removeClass('Statistics-example');
                        $blockSiteExample.find('.Statistics-status')
                            .addClass(statusClass)
                            .text(site.status)
                            .before(site.name + ' - ' + site.url);
                        var time = new Date(site.statusTime);
                        $blockSiteExample.find('.Statistics-description')
                            .html('<div class="Statistics-option"><strong>Status time:</strong> ' +
                                time.getDate() + '.' +
                                (time.getMonth() + 1) + '.' +
                                time.getFullYear() + ' ' +
                                time.getHours() + ':' +
                                time.getMinutes() + ':' +
                                time.getSeconds() +
                                '</div><div class="Statistics-option"><strong>Pages:</strong> ' + site.pages +
                                '</div><div class="Statistics-option"><strong>Lemmas:</strong> ' + site.lemmas +
                                '</div><div class="Statistics-option Statistics-option_error"><strong>Error:</strong> ' + site.error + '</div>'+
                                '')
    
                        
                        $statistics.append($blockSiteExample);
                        var $thisHideBlock = $statistics.find('.HideBlock').last();
                        $thisHideBlock.on('click', HideBlock().trigger);


                        $('.Tabs_column > .Tabs-wrap > .Tabs-block').each(function(){
                            var $this = $(this);
                            if ($this.is(':hidden')){
                                $this.addClass('Tabs-block_update')
                            };
                        });
                        $statistics.find('.HideBlock').each(function(){
                            var $this = $(this);
                            var height = $this.find('.Statistics-description').outerHeight();
                            $this.find('.HideBlock-content').css('height', height + 40);
                        });
                        $('.Tabs_column > .Tabs-wrap > .Tabs-block_update').each(function(){
                            var $this = $(this);
                            $this.removeClass('Tabs-block_update')
                        });
                    });
                    if (result.statistics.total.isIndexing) {
                        var $btnIndex = $('.btn[data-send="startIndexing"]'),
                            text = $btnIndex.find('.btn-content').text();
                        $btnIndex.find('.btn-content').text($btnIndex.data('alttext'));
                        $btnIndex
                            .data('check', true)
                            .data('altsend', 'startIndexing')
                            .data('send', 'stopIndexing')
                            .data('alttext', text)
                            .addClass('btn_check')
                        $('.UpdatePageBlock').hide(0)
                    }
    
                } else {
                    if ($this.next('.API-error').length) {
                        $this.next('.API-error').text(result.error);
                    } else {
                        $this.after('<div class="API-error">' + result.error + '</div>');
                    }
                }
                $('.Site-loader').hide(0);
                $('.Site-loadingIsComplete').css('visibility', 'visible').fadeIn(500);
            }
        }
    };
    function shiftCheck($element, wave){
        var text = '',
            check = $element.data('check');
        text = $element.find('.btn-content').text();
        if ($element.data('alttext')) {
            $element.find('.btn-content').text($element.data('alttext'));
            $element.data('alttext', text);
        }
        if ($element.data('send') == 'startIndexing' || $element.data('send') == 'stopIndexing'){
            if (check) {
                $('.UpdatePageBlock').show(0)
            } else {
                $('.UpdatePageBlock').hide(0)
            }
        }
        check = !check;
        $element.data('check', check);
        if ($element.data('altsend')){
            var altsend = $element.data('altsend');
            $element.data('altsend', $element.data('send'));
            $element.data('send', altsend);
        };
        if (check) {
            $element.addClass('btn_check');
        } else {
            $element.removeClass('btn_check');
        };
        if (!wave) {
            $element.trigger('changeCheck');
        }
    }
    return {
        init: function(){
            var $btnCheck = $('[data-btntype="check"]');
            $btnCheck.on('click', function(e){
                var $this = $(this);
                if (!$this.data('send')) {
                    shiftCheck($this);
                }
            });
            $btnCheck.on('changeCheck', function(){
                var $this = $(this);
                if ($this.data('btnradio')) {
                    $('[data-btnradio="' + $this.data('btnradio') + '"]').each(function(e){
                        if($(this).data('check') && !$(this).is($this)) {
                            shiftCheck($(this), true);
                        }
                    });
                }
            });
            sendData(
                send['statistics'].address,
                send['statistics'].type,
                '',
                send['statistics'].action,
                $('.Statistics')
            )
            var $send = $('[data-send]');
            $send.on('submit click', function(e){
                var $this = $(this);
                var data = '';
                if (($this.hasClass('form') && e.type==='submit')
                    || (e.type==='click' && !$this.hasClass('form'))){
                    e.preventDefault();
                    
                    switch ($this.data('send')) {
                        case 'indexPage':
                            var $page = $this.closest('.form').find('input[name="page"]');
                            data = {url: $page.val()};
                            break;
                        case 'search':
                            if ($this.data('sendtype')==='next') {
                                data = {
                                    site: $this.data('searchsite'),
                                    query: $this.data('searchquery'),
                                    offset: $this.data('sendoffset'),
                                    limit: $this.data('sendlimit')
                                };
                            } else {
                                data = {
                                    query: $this.find('[name="query"]').val(),
                                    offset: 0,
                                    limit: $this.data('sendlimit')
                                };
                                if ( $this.find('[name="site"]').val() ) {
                                    data.site = $this.find('[name="site"]').val();
                                }
                            }
                            break;
        
                    }
                    sendData(
                        send[$this.data('send')].address,
                        send[$this.data('send')].type,
                        data,
                        send[$this.data('send')].action,
                        $this
                    )
                }
            });
        }
    };
};
API().init();

var Column = function(){
    return {
        init: function(){
        }
    };
};
Column().init();

var HideBlock = function(){
    var $HideBlock = $('.HideBlock');
    var $trigger = $HideBlock.find('.HideBlock-trigger');
    $HideBlock.each(function(){
        var $this = $(this);
        var $content = $this.find('.HideBlock-content');
        $content.css('height', $content.outerHeight());
        $this.addClass('HideBlock_CLOSE');
    });
    function clickHide (e){
        e.preventDefault();
        var $this = $(this);
        var $parent = $this.closest($HideBlock);
        if ($parent.hasClass('HideBlock_CLOSE')) {
            $('.HideBlock').addClass('HideBlock_CLOSE');
            $parent.removeClass('HideBlock_CLOSE');
        } else {
            $parent.addClass('HideBlock_CLOSE');
        }
    }
    return {
        init: function(){
            $trigger.on('click', clickHide);
            // $HideBlock.eq(0).find($trigger).trigger('click');
        },
        trigger: clickHide
    };
};
HideBlock().init();

var Middle = function(){
    return {
        init: function(){
        }
    };
};
Middle().init();

var SearchResult = function(){
    return {
        init: function(){
        }
    };
};
SearchResult().init();

var Section = function(){
    return {
        init: function(){
        }
    };
};
Section().init();

var Spoiler = function(){
    var $HideBlock = $('.Spoiler');
    var $trigger = $HideBlock.find('.Spoiler-trigger');
    $HideBlock.addClass('Spoiler_CLOSE');
    return {
        init: function(){
            $trigger.on('click', function(e){
                e.preventDefault();
                var $this = $(this);
                var scroll = $(window).scrollTop();
                var $parent = $this.closest($HideBlock);
                if ($parent.hasClass('Spoiler_CLOSE')) {
                    $parent.removeClass('Spoiler_CLOSE');
                    $(window).scrollTop(scroll);
                } else {
                    $parent.addClass('Spoiler_CLOSE');
                    $(window).scrollTop(scroll);
                }
            });
        }
    };
};
Spoiler().init();

var Statistics = function(){
    return {
        init: function(){
        }
    };
};
Statistics().init();

var Tabs = function(){
    var $tabs = $('.Tabs');
    var $tabsLink = $('.Tabs-link');
    var $tabsBlock = $('.Tabs-block');
    return {
        init: function(){
            // var $steps = $('.Tabs_steps');
            // var $step = $steps.find($tabsLink).not($steps.find($tabs).find($tabsLink));
            // var $blocks = $steps.find($tabsBlock).not($steps.find($tabs).find($tabsBlock));
            // $blocks.hide(0);
            // var href = $step.eq(0).attr('href');
            // var $active = $(href);
            // var $links= $step.add($step.siblings($tabsLink));
            // $links.removeClass('Tabs-link_ACTIVE');
            // $step.eq(0).addClass('Tabs-link_ACTIVE');
            // $active.show(0);

            $tabsLink.on('click', function(e){
                var $this = $(this);
                var href = $this.attr('href');
                if (href[0]==="#"){
                    e.preventDefault();
                    var $parent = $this.closest($tabs);
                    if ($parent.hasClass('Tabs_steps')) {
                    } else {
                        var $blocks = $parent.find($tabsBlock).not($parent.find($tabs).find($tabsBlock));
                        var $links= $this.add($this.siblings($tabsLink));
                        var $active = $(href);
                        $links.removeClass('Tabs-link_ACTIVE');
                        $this.addClass('Tabs-link_ACTIVE');
                        $blocks.hide(0);
                        $active.show(0);
                    }
                }

            });
            $('.TabsLink').on('click', function(e){
                var $this = $(this);
                var href = $this.attr('href');
                var $active = $(href);
                var $parent = $active.closest($tabs);
                if ($parent.hasClass('Tabs_steps')) {
                } else {
                    var $blocks = $parent.find($tabsBlock).not($parent.find($tabs).find($tabsBlock));
                    var $link = $('.Tabs-link[href="' + href + '"]');
                    var $links= $link.add($link.siblings($tabsLink));
                    $links.removeClass('Tabs-link_ACTIVE');
                    $link.addClass('Tabs-link_ACTIVE');
                    $blocks.hide(0);
                    $active.show(0);
                }

            });
            $tabs.each(function(){
                $(this).find($tabsLink).eq(0).trigger('click');
            });
            if (~window.location.href.indexOf('#')){
                // $(window).scrollTop(0);
                var tab = window.location.href.split('#');
                tab = tab[tab.length - 1];
                $tabsLink.filter('[href="#' + tab + '"]').trigger('click');
            }
            $('.Site').on('click', 'a', function(){
                var $this = $(this),
                    tab = $this.attr('href').replace(window.location.pathname, '');
                if (~$this.attr('href').indexOf(window.location.pathname)) {
                    $tabsLink.filter('[href="' + tab + '"]').trigger('click');
                }
            });
        }
    };
};
Tabs().init();
// setTimeout(function(){
//     $('body').css('opacity', '1');
// }, 100);
});


})(jQuery);