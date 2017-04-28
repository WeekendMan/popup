All of the Popup instances are hosted in the PopupManager property of the window object. PopupManager object includes common properties for Popup instances.
PopupManager has two methods:
- constructor. This method will be started automatically after the object’s initialization. This method sets CSS classes for the common elements.
- destroy. This method destroys all the Popup instances and then removes itself.

Popup instance can show content from the:
- some string variable as the text;
- HTMLElement instance (Popup instance removes this container from the DOM after instance initialization);
- URL (all the scripts in the server's content will be parsed);

Popup instance can be one of these types:
- alert;
- confirm;
- default;

You can set the "id" property for your Popup instance or it will be set automatically (format - popup_{{index: number}}. You can make a reference to this new instance like this:
var somePopup = new Popup({ ... properties ... });
or you can just create a new instance like this:
new Popup({ ... properties ... });
and then find this object in the "objects" property of the PopupManager object:
window.PopupManager.objects[{{ instanceID }}];

You can set functions to properties "onshow" (to do something when content in popup window will be rendered) and "onhide" (to do something when popup window will be just closed). It works for any type of the Popup instance and of course individual for every instance.

Types of the Popup instance:

1. alert
The simplest way to create alert popup window - syntax like
new Popup('Hello world');
This is the only case when you can give not the "Object" type to Popup's constructor. This syntax will initialize popup window with this text and show it immediately. This Popup instance will be destroyed when you will close the popup window. Exception – instance won’t be deleted if you set the “initiators” property.
Also, you can use the standard way and set properties by yourself.

There is always button "OK" in the bottom of the popup alert window. If you want to do something when the user clicks on it, you can set your function to "onokay" property and it will be executed. Note that click on the cross in the right top button or on the layer around the popup window will close popup but won't call "onokay" method. Also, if you set "onokay" method you need to call the "hide" method manually within it to close the popup. This Popup instance will be destroyed when you will close the popup window. Exception – instance won’t be deleted if you set the “initiators” property.

2. confirm
There are always two buttons: "Confirm" and "Cancel" in the bottom of the popup alert window. You can get know which one was pressed by defining methods "onaccept" and "ondecline". Note that click on the cross in the right top button or on the layer around the popup window will close popup but won't call neither of the "onaccept" or "ondecline" methods. Also, if you set these two methods you need to call the "hide" method manually within both of it to close the popup.

3. default
You don't have to define "type" property if you want to use non-alert/confirm popup window.
This type of popup doesn't have any default buttons it all is up to you what will be inside the popup container.

Properties description:

- id (string). This property is using as a key to Popup instance (as a value) within the window.PopupManager.objects. It can be set by developer manually (new Popup({ id: 'someID' });) or it will be set automatically (in the format "popup_1", "popup_2" etc).
- properties (object || string). This property is storing the data that Popup instance got as an argument. Can be only "object" type. Exception - simple alert call, you can use the string with the notification text to immediate showing.
- effect (string). You can use two options for now: "default" and "slide". This property is also the name of the CSS class that defines animation effects. You can create your own CSS classes and use them.
- type (string). You can use the next values for this property: "default", "alert", "confirm". This property will be automatically set to "alert" if you give the string with the message as an argument to Popup instance constructor. In another case, if you didn't set it manually it will be "default".
- sourceType (string). This property can be set to "dom" or "url" or "text" value.
You have to set a reference to the DOMElement instance for the content.body if you set sourceType to the "dom" value. This container will be removed from DOM until you call the "show" method. Then it will be inserted into the popup container.
If you set the "url" value for the "sourceType" property you need to define the ajaxParams property and "url" property inside the ajaxParams (URL address to get content to show). You can see more details in the ajaxParams description.
If you set "sourceType" to "text" you have to define content.body and associate it with some string.

- autoshow (boolean). Will be set to "true" if property "type" was set to "alert". In other cases, it will be "false". When this property set to "true" method "show" will be called right after the Popup instance constructor.
- width (number). Popup container has its own width that was set by the CSS rules. You can set another container width for the specific Popup instance with this property.
- initiators (array || HTMLCollection). You can set the list of the DOMElement's instances that will call the "show" method (by onclick event) for this Popup instance. Be aware that if you set this property automatic destroy after "hide" method won't be called for the "alert" and "confirm" type of the Popup instance.
- noLayerClick (boolean). If you set this property to "true" you will be able to close the popup window only by click on the cross button in the right top corner or with the "Esc" button.
- noEscPress (boolean). If you set this property to "true" you will be able to close the popup window only by click cross button in the right top corner or with the click on the half-transparent layer around the popup window.
- containerClass (string). You can set some class name for the popup container (only for this Popup instance) beside the library classes.
- content (object). This property contains two own property: "title" (string) and "body" (string || HTMLElement). Property "title" is not required. If you set it you will see the title container within the popup window. You can set property "body" as text (string) and it will be inserted into the popup container for the main content. Also, if you set Popup instance property "sourceType" to "url" content that you will get from the server will be saved into the content.body property. You can write the reference to some HTMLElement in the "content.body". It will set property "sourceType" to "dom" automatically. In the case when you created Popup instance as a simple "alert" type (passing string with the message into the constructor as a new Popup("alert message");) constructor will write it into the "content.body" property.
- ajaxParams (object). This property contains 4 own properties: method (string, default - 'GET', can be set to 'POST'), data (object with some data to send), url (string, it is the link that you want to create request to), toJSON (boolean, default - false. If you set it as "true" property ajaxParams.data will be sent as a JSON).
- log (boolean, default - false). If you set this property to the "true" you will see debug messages from the object methods in the browser console.
- buttonsText (object, can contain values for the ok, yes, no properties). If you want to show different text on the buttons for the alert popup window ("ok" property) or confirm popup window ("yes" and "no") you can rewrite these properties of the "buttonText" property.

Methods description

The following methods can be called manually:

- show. This method shows popup window or calls getContent method first (if property "sourceType was set as "url" and content wasn't loaded before) and only then shows the popup window and its content. Also, it set all custom properties (like containerClass, width etc).
- hide. This method hides popup window, removes handlers for all elements and removes all customising (like containerClass, width etc).
- getContent. Taking one argument - callback (function). This method loads content from the URL that was set in the "ajaxParams.url" property using the method from the "ajaxParams.method" property, sending data from the "ajaxParams.data" property (in the JSON format if "ajaxParams.toJSON" property was set to the "true") and save it into the "content.body" property. After the successful request, callback argument will be executed (if this callback is the function).
- updateInitiators. This method checks that all of the elements in the "initiators" property are still exists on the current page in the DOM. If some item of the "initiators" property doesn't exist anymore it will remove it from the initiators' list.
- destroy. This method fully removes this Popup instance.
