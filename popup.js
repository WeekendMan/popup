"use strict"

window.PopupManager = {
    elements: {
        parent: undefined,
        container: document.createElement('div'),
        layer: document.createElement('div'),
        title: document.createElement('div'),
        buttons: document.createElement('div')
    },
    buttons: {
        close: document.createElement('button')
    },
    objects: {},
    scope: {},
    autocallElements: {},
    current: undefined,
    destroy: function(){
        for(this.scope.id in window.PopupManager.objects){
            window.PopupManager.objects[id].destroy();
        };

        delete window.PopupManager;
    }
};
window.PopupManager.constructor = function(){
    this.elements.layer.className = 'popupLayer';
    this.elements.container.className = 'popupContent';

    this.buttons.close.className = 'popupClose';
    this.buttons.close.innerHTML = '\u2573';
    this.buttons.close.onclick = function(){
        window.PopupManager.objects[window.PopupManager.current].hide();
    };

    this.elements.container.appendChild(document.createElement('div'));
    this.elements.container.appendChild(this.buttons.close);

    this.elements.title.className = 'title';
};

function Popup(){
    this.id = undefined;
    this.properties = arguments[0];

    if(!this.properties || !(this.properties.constructor === Object && Object.keys(this.properties).length > 0))
        throw new Error('Popup: empty properties', this.properties);

    this.effect = 'default'//default || slide
    this.type = (typeof this.properties == 'string' ? 'alert' : 'default');// default || alert || confirm
    this.sourceType = undefined;// dom || url || text
    this.autoshow = (this.type == 'alert' ? true : false);
    this.width = undefined;
    this.initiators = [];
    this.noLayerClick = false;
    this.noEscPress = false;
    this.containerClass = undefined;
    this.scope = {};

    this.content = {
        title: undefined,
        body: (this.type == 'alert' && typeof this.properties == 'string' ? this.properties : undefined)
    };

    this.ajaxParams = {
        method: undefined,
        data: undefined,
        url: undefined,
        toJSON: false
    };

    this.log = true;

    this.buttonsText = {
        ok: undefined,
        yes: undefined,
        no: undefined
    };

    if(typeof this.properties == 'object'){
        for(this.scope.key in this.properties){
            if(
                (typeof this.properties[this.scope.key] == 'object' && Object.keys(this.properties[this.scope.key]).length == 0)
                ||
                (typeof this.properties[this.scope.key] == 'string' && this.properties[this.scope.key].length == 0)
            )
                continue;

            this[this.scope.key] = this.properties[this.scope.key];
        };

        delete this.scope.key;
    };

    this.buttons = {
        close: window.PopupManager.buttons.close,
        ok: document.createElement('button'),
        yes: document.createElement('button'),
        no: document.createElement('button')
    };

    this.buttonsText.ok = this.buttonsText.ok || 'OK';
    this.buttonsText.yes = this.buttonsText.yes || 'Confirm';
    this.buttonsText.no = this.buttonsText.no || 'Cancel';

    this.buttons.ok.innerHTML = this.buttonsText.ok;
    this.buttons.yes.innerHTML = this.buttonsText.yes;
    this.buttons.no.innerHTML = this.buttonsText.no;

    this.buttons.ok.onclick = this.onokay.bind(this);
    this.buttons.yes.onclick = this.onaccept.bind(this);
    this.buttons.no.onclick = this.ondecline.bind(this);

    this.elements = window.PopupManager.elements;

    if(this.elements.parent === undefined)
        this.elements.parent = document.body;

    if(typeof this.effect == 'string'){
        this.elements.layer.className += (' ' + this.effect);
        this.elements.container.className += (' ' + this.effect);
    };

    this.elements.buttons.className = 'buttons';

    if(this.id === undefined){
        this.scope.existingId = Object.keys(window.PopupManager.objects);

        for(this.scope.i = this.scope.existingId.length; this.scope.i >= 0; this.scope.i++){
            this.scope.randomId = 'popup_' + this.scope.i;
            if(this.scope.existingId.indexOf(this.scope.randomId) == -1){
                this.id = this.scope.randomId;
                break;
            };
        };

        delete this.scope.existingId;
        delete this.scope.randomId;
        delete this.scope.i;
    };

    window.PopupManager.objects[this.id] = this;

    if(this.log)
        console.debug('Popup#' + this.id + '->constructor', this.properties);

    if(this.initiators.length > 0){
        this.initiators.forEach(function(item){
            item.onclick = this.show.bind(this);
        }.bind(this));
    };

    if(this.ajaxParams.toJSON)
        this.ajaxParams.method = 'POST';
    else if(this.ajaxParams.method != 'GET' && this.ajaxParams.method != 'POST')
        this.ajaxParams.method = 'GET';
    else if(this.ajaxParams.method)
        this.ajaxParams.method = this.ajaxParams.method.toUpperCase();

    if(this.ajaxParams.url !== undefined && this.sourceType === undefined)
        this.sourceType = 'url';

    if(this.sourceType == 'dom' || this.content.body instanceof HTMLElement){
        if(!(this.content.body instanceof HTMLElement))
            throw new Error('Popup#' + this.id + '->constructor: property "content.body" must be HTMLElement');

        this.sourceType == 'dom';
        this.content.body.parentNode.removeChild(this.content.body);        
    };

    this.loader = new XMLHttpRequest();

    this.isActive = false;
    this.isContentLoaded = false;//for url load only

    this.onready();

    if(this.autoshow)
        this.show();
};
Popup.prototype.resize = function(){
    window.PopupManager.objects[window.PopupManager.current].elements.container.style.height = window.PopupManager.objects[window.PopupManager.current].elements.container.childNodes[0].offsetHeight + 'px';
};
Popup.prototype.keyup = function(e){
    if(window.PopupManager.current !== undefined && e.keyCode == 27 && !window.PopupManager.objects[window.PopupManager.current].noEscPress)
        window.PopupManager.objects[window.PopupManager.current].hide();
};
Popup.prototype.getContent = function(callback){
    if(this.ajaxParams.url === undefined)
        throw new Error('Popup#' + this.id + '->getContent: no url');

    if(this.ajaxParams.data !== undefined && this.ajaxParams.data.constructor === Object){
        if(this.ajaxParams.toJSON){
            this.scope.prepared = JSON.stringify(this.ajaxParams.data);
        }else{
            this.scope.prepared = '';
            Object.keys(this.ajaxParams.data).forEach(function(key, i){
                this.scope.prepared += (i != 0 ? '&' : '') + key + '=' + this.ajaxParams.data[key];
            }.bind(this));
        };
    };

    if(this.ajaxParams.method == 'GET'){
        this.scope.url = this.ajaxParams.url;

        if(this.scope.prepared)
            this.scope.url = this.ajaxParams.url + (this.ajaxParams.url.indexOf('?') == -1 ? '?' + this.scope.prepared : '&' + this.scope.prepared);

        this.loader.open(this.ajaxParams.method, this.scope.url, true);
        this.loader.send();

        delete this.scope.url;
    }else if(this.ajaxParams.method == 'POST'){
        this.loader.open(this.ajaxParams.method, this.ajaxParams.url + (this.ajaxParams.url.indexOf('?') == -1 ? '?r=' + new Date().getTime() : ''), true);
        
        if(this.ajaxParams.toJSON)
            this.loader.setRequestHeader("Content-type", "application/json");
        else
            this.loader.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        this.loader.send((this.scope.prepared === undefined ? null : this.scope.prepared));
    };
    
    delete this.scope.prepared;

    this.loader.onreadystatechange = function(){
        if(this.loader.readyState != 4)
            return;

        if(this.loader.status != 200)
            throw new Error('Popup#' + this.id + '->getContent: ', this.loader.responseText);

        if(this.log)
            console.debug('Popup#' + this.id + '->getContent');

        this.content.body = this.loader.responseText;
        this.isContentLoaded = true;

        if(callback instanceof Function)
            callback.call(this);
    }.bind(this);
};
Popup.prototype.show = function(){
    this.elements.parent.className = 'locked';
    this.elements.parent.appendChild(this.elements.layer);

    if(this.sourceType == 'url' && this.isContentLoaded === false){
        this.getContent(this.show);
        return false;
    };

    if(this.log)
        console.debug('Popup#' + this.id + '->show');

    window.PopupManager.current = this.id;

    this.elements.parent.appendChild(this.elements.container);

    this.elements.layer.onclick = function(){
        if(this.noLayerClick === false)
            this.hide();
    }.bind(this);

    if(typeof this.content.body == 'string')
        this.elements.container.children[0].innerHTML = (
            this.type == 'alert' || this.type == 'confirm'
                ? '<div class="simple">' + this.content.body + '</div>'
                : this.content.body
        );
    else if(typeof this.content.body == 'object')
        this.elements.container.children[0].appendChild(this.content.body);

    this.elements.container.className += (this.containerClass !== undefined ? ' ' + this.containerClass : '');

    if(this.content.title !== undefined){
        if(this.content.title instanceof HTMLElement)
            this.elements.title.appendChild(this.content.title);
        else
            this.elements.title.innerHTML = this.content.title;

        this.elements.container.childNodes[0].insertBefore(this.elements.title, this.elements.container.childNodes[0].childNodes[0]);
    };

    if(this.type == 'alert' || this.type == 'confirm'){
        this.elements.container.childNodes[0].appendChild(this.elements.buttons);
    };

    if(this.type == 'alert'){
        this.elements.buttons.appendChild(this.buttons.ok);
    }else if(this.type == 'confirm'){
        this.elements.buttons.appendChild(this.buttons.yes);
        this.elements.buttons.appendChild(this.buttons.no);
    };

    if(this.width !== undefined)
        this.elements.container.style.width = this.width + 'px';

    if(this.sourceType == 'url')
        this.parseJS(this.elements.container);


    setTimeout(function(){
        this.elements.layer.className += ' visible';
        this.elements.container.className = this.elements.container.className + ' visible';
    }.bind(this), 0);

    window.addEventListener('resize', this.resize);
    document.addEventListener('keyup', this.keyup);

    this.isActive = true;
    this.onshow();
    this.resize();
};
Popup.prototype.hide = function(){
    if(this.log)
        console.debug('Popup#' + this.id + '->hide');

    this.elements.container.className = this.elements.container.className.replace('visible', '').trim();
    this.elements.layer.className = this.elements.layer.className.replace('visible', '').trim();;

    window.removeEventListener('resize', this.resize);
    document.removeEventListener('keyup', this.keyup);

    this.isActive = false;

    setTimeout(function(){
        this.elements.parent.removeAttribute('class');

        if(this.width !== undefined)
            this.elements.container.style.width = '';

        if(typeof this.content.body == 'string')
            this.elements.container.childNodes[0].innerHTML = '';
        else if(typeof this.content.body == 'object')
            this.elements.container.childNodes[0].removeChild(this.content.body);

        if(this.content.title !== undefined)
            this.elements.title.innerHTML = '';

        this.elements.buttons.innerHTML = '';

        this.elements.container.parentNode.removeChild(this.elements.container);
        this.elements.layer.onclick = null;
        this.elements.layer.parentNode.removeChild(this.elements.layer);

        window.PopupManager.current = undefined;

        this.onhide();

        if((this.type == 'alert' || this.type == 'confirm') && this.initiators.length == 0)
            this.destroy();
    }.bind(this), 700);
};
Popup.prototype.update = function(){
    if(this.log)
        console.debug('Popup#' + this.id + '->update');

    this.initiators.forEach(function(item){
        if(item.parentNode === null){
            item.onclick = null;
            this.initiators.splice(this.initiators.indexOf(item), 1);
        }else if(item.onclick === null){
            item.onclick = this.show.bind(this);
        };

    }.bind(this));
};
Popup.prototype.parseJS = function(){
    if(this.log)
        console.debug('Popup#' + this.id + "->parseJS");

    [].forEach.call(this.elements.container.querySelectorAll('script'), function(item){
        if(item.getAttribute('src') !== null){
            this.loader.open('POST', item.src, true);
            this.loader.send();

            this.loader.onreadystatechange = function(){
                if(this.loader.readyState != 4)
                    return;

                if(this.loader.status != 200){
                    throw new Error('Popup#' + this.id + "->parseJS: can't get script file");
                }else{
                    eval(this.loader.responseText);
                };
            };
        }else if(item.innerText){
            eval(item.innerText);
        }else if(item.innerHTML){
            eval(item.innerHTML);
        }else{
            eval(item);
        };
    }.bind(this));
};
Popup.prototype.onready = function(){/*user define*/};
Popup.prototype.onshow = function(){/*user define*/};
Popup.prototype.onhide = function(){/*user define*/};
Popup.prototype.onokay = Popup.prototype.hide;
Popup.prototype.onaccept = Popup.prototype.hide;
Popup.prototype.ondecline = Popup.prototype.hide;
Popup.prototype.destroy = function(){
    if(this.log)
        console.debug('Popup#' + this.id + '->destroy');

    Object.keys(this.buttons).forEach(function(item){
        if(item !== 'close')
            this.buttons[item].onclick = null;
    }.bind(this));

    delete this.content;
    delete window.PopupManager.objects[this.id];
};

window.PopupManager.constructor();
