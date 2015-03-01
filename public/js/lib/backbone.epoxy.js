// Backbone.Epoxy 1.3.2
// (c) 2013 Greg MacWilliam
// Freely distributed under the MIT license
// http://epoxyjs.org
(function(t,e){"undefined"!=typeof exports?module.exports=e(require("underscore"),require("backbone")):"function"==typeof define&&define.amd?define(["underscore","backbone"],e):e(t._,t.Backbone)})(this,function(t,e){function n(t,e,n){return t._super.prototype[e].apply(t,n)}function i(e,n,o,r){for(var s in n)if(n.hasOwnProperty(s)){var u=n[s];if(e.hasComputed(s)){if(r.length&&t.contains(r,s))throw"Recursive setter: "+r.join(" > ");u=e.c()[s].set(u),u&&_(u)&&(o=i(e,u,o,r.concat(s)))}else o[s]=u}return o}function o(e,n,i,o){i=i||{},i.get&&b(i.get)&&(i._get=i.get),i.set&&b(i.set)&&(i._set=i.set),delete i.get,delete i.set,t.extend(this,i),this.model=e,this.name=n,this.deps=this.deps||[],o||this.init()}function r(e){return b(e)?e():(_(e)&&(e=t.clone(e),t.each(e,function(t,n){e[n]=r(t)})),e)}function s(t){return b(t)?{set:t}:t}function u(e){return function(){var n=arguments,i=b(e)?e:e.get,o=e.set;return function(e){return w(e)?i.apply(this,t.map(n,r)):n[0]((o?o:i).call(this,e))}}}function c(e,n,i,o,r){return(e=t.result(e,o))?(x(e)?(r=r?r+"_":"",n["$"+o]=function(){return F&&F.push([e,"change"]),e},t.each(e.toJSON({computed:!0}),function(t,o){n[r+o]=function(t){return a(e,o,t,i)}})):$(e)&&(n["$"+o]=function(){return F&&F.push([e,"reset add remove sort update"]),e}),e):void 0}function a(e,n,i,o){if(F&&F.push([e,"change:"+n]),!w(i)){if(!_(i)||C(i)||t.isDate(i)){var r=i;i={},i[n]=r}return o&&o.save?e.save(i,o):e.set(i,o)}return e.get(n)}function h(t,e){if(":el"===e)return t.$el;var n=t.$(e);return t.$el.is(e)&&(n=n.add(t.$el)),n}function l(e,n,i,o,r,s){try{var u=B[i]||(B[i]=Function("$f","$c","with($f){with($c){return{"+i+"}}}")),c=u(s,o)}catch(a){throw'Error parsing bindings: "'+i+'"\n>> '+a}var h=t.map(t.union(c.events||[],["change"]),function(t){return t+".epoxy"}).join(" ");t.each(c,function(t,i){if(r.hasOwnProperty(i))e.b().push(new g(e,n,r[i],t,h,o,c));else if(!q.hasOwnProperty(i))throw'binding handler "'+i+'" is not defined.'})}function f(t,e,n){return t&&t.hasOwnProperty(e)?w(n)?r(t[e]):t[e](n):void 0}function d(t,e){var n=[];if(e&&t)for(var i=0,o=e.length;o>i;i++)n.push(e[i]in t?t[e[i]]():null);return n}function p(t){var e=[];for(var n in t){var i=t[n];_(i)&&(i="{"+p(i)+"}"),e.push(n+":"+i)}return e.join(",")}function g(e,n,i,o,s,u,c){var a=this,h=n[0].tagName.toLowerCase(),l="input"==h||"select"==h||"textarea"==h||"true"==n.prop("contenteditable"),f=[],d=function(t){a.$el&&a.set(a.$el,r(o),t)};if(a.view=e,a.$el=n,a.evt=s,t.extend(a,i),o=a.init(a.$el,r(o),u,c)||o,F=f,d(),F=null,l&&i.get&&b(o)&&a.$el.on(s,function(t){o(a.get(a.$el,r(o),t))}),f.length)for(var p=0,g=f.length;g>p;p++)a.listenTo(f[p][0],f[p][1],d)}var v,m=e.Epoxy={},y=Array.prototype,w=t.isUndefined,b=t.isFunction,_=t.isObject,C=t.isArray,x=function(t){return t instanceof e.Model},$=function(t){return t instanceof e.Collection},O=function(){},V={mixin:function(t){t=t||{};for(var e in this.prototype)"bindings"===e&&t.bindings||this.prototype.hasOwnProperty(e)&&"constructor"!==e&&(t[e]=this.prototype[e]);return t}},k=["computeds"];m.Model=e.Model.extend({_super:e.Model,constructor:function(e,i){t.extend(this,t.pick(i||{},k)),n(this,"constructor",arguments),this.initComputeds(e,i)},getCopy:function(e){return t.clone(this.get(e))},get:function(t){return v&&v.push(["change:"+t,this]),this.hasComputed(t)?this.c()[t].get():n(this,"get",arguments)},set:function(e,o,r){var s=e;s&&!_(s)?(s={},s[e]=o):r=o,r=r||{};var u=this._setting=[];r.unset||(s=i(this,s,{},[])),delete this._setting;var c=n(this,"set",[s,r]);return r.silent||(!this.hasChanged()&&u.length&&this.trigger("change",this),t.each(u,function(t){this.trigger.apply(this,t)},this)),c},toJSON:function(e){var i=n(this,"toJSON",arguments);return e&&e.computed&&t.each(this.c(),function(t,e){i[e]=t.value}),i},destroy:function(){return this.clearComputeds(),n(this,"destroy",arguments)},c:function(){return this._c||(this._c={})},initComputeds:function(e){this.clearComputeds();var n=t.result(this,"computeds")||{};n=t.extend(n,t.pick(e||{},t.keys(n))),t.each(n,function(t,e){t._init=1,this.addComputed(e,t)},this),t.invoke(this.c(),"init")},addComputed:function(t,e,n){this.removeComputed(t);var i=e,r=i._init;if(b(e)){var s=2;i={},i._get=e,b(n)&&(i._set=n,s++),i.deps=y.slice.call(arguments,s)}return this.c()[t]=new o(this,t,i,r),this},hasComputed:function(t){return this.c().hasOwnProperty(t)},removeComputed:function(t){return this.hasComputed(t)&&(this.c()[t].dispose(),delete this.c()[t]),this},clearComputeds:function(){for(var t in this.c())this.removeComputed(t);return this},modifyArray:function(t,e,n){var i=this.get(t);if(C(i)&&b(y[e])){var o=y.slice.call(arguments,2),r=y[e].apply(i,o);return n=n||{},n.silent||this.trigger("change:"+t+" change",this,y,n),r}return null},modifyObject:function(t,e,n,i){var o=this.get(t),r=!1;return _(o)?(i=i||{},w(n)&&o.hasOwnProperty(e)?(delete o[e],r=!0):o[e]!==n&&(o[e]=n,r=!0),r&&!i.silent&&this.trigger("change:"+t+" change",this,o,i),o):null}},V),t.extend(o.prototype,e.Events,{init:function(){var e={},n=v=[];this.get(!0),v=null,n.length&&(t.each(n,function(n){var i=n[0],o=n[1];e[i]?t.contains(e[i],o)||e[i].push(o):e[i]=[o]}),t.each(e,function(e,n){for(var i=0,o=e.length;o>i;i++)this.listenTo(e[i],n,t.bind(this.get,this,!0))},this))},val:function(t){return this.model.get(t)},get:function(e){if(e===!0&&this._get){var n=this._get.apply(this.model,t.map(this.deps,this.val,this));this.change(n)}return this.value},set:function(t){if(this._get){if(this._set)return this._set.apply(this.model,arguments);throw"Cannot set read-only computed attribute."}return this.change(t),null},change:function(e){if(!t.isEqual(e,this.value)){this.value=e;var n=["change:"+this.name,this.model,e];this.model._setting?this.model._setting.push(n):(n[0]+=" change",this.model.trigger.apply(this.model,n))}},dispose:function(){this.stopListening(),this.off(),this.model=this.value=null}});var P={optionText:"label",optionValue:"value"},B={},E={attr:s(function(t,e){t.attr(e)}),checked:s({get:function(e,n){var i=!!e.prop("checked"),o=e.val();if(this.isRadio(e))return o;if(C(n)){n=n.slice();var r=t.indexOf(n,o);return i&&0>r?n.push(o):!i&&r>-1&&n.splice(r,1),n}return i},set:function(e,n){var i=!!n;this.isRadio(e)?i=n==e.val():C(n)&&(i=t.contains(n,e.val())),e.prop("checked",i)},isRadio:function(t){return"radio"===t.attr("type").toLowerCase()}}),classes:s(function(e,n){t.each(n,function(t,n){e.toggleClass(n,!!t)})}),collection:s({init:function(t,e,n,i){if(this.i=i.itemView?this.view[i.itemView]:this.view.itemView,!$(e))throw'Binding "collection" requires a Collection.';if(!b(this.i))throw'Binding "collection" requires an itemView.';this.v={}},set:function(e,n,i){var o,r=this.v,s=this.i,u=n.models,c=F;if(F=null,i=i||n,x(i))if(r.hasOwnProperty(i.cid))r[i.cid].remove(),delete r[i.cid];else{r[i.cid]=o=new s({model:i,collectionView:this.view});var a=t.indexOf(u,i),h=e.children();h.length>a?h.eq(a).before(o.$el):e.append(o.$el)}else if($(i)){var l=u.length===t.size(r)&&n.every(function(t){return r.hasOwnProperty(t.cid)});e.children().detach();var f=document.createDocumentFragment();l?n.each(function(t){f.appendChild(r[t.cid].el)}):(this.clean(),n.each(function(t){r[t.cid]=o=new s({model:t,collectionView:this.view}),f.appendChild(o.el)},this)),e.append(f)}F=c},clean:function(){for(var t in this.v)this.v.hasOwnProperty(t)&&(this.v[t].remove(),delete this.v[t])}}),css:s(function(t,e){t.css(e)}),disabled:s(function(t,e){t.prop("disabled",!!e)}),enabled:s(function(t,e){t.prop("disabled",!e)}),html:s(function(t,e){t.html(e)}),options:s({init:function(t,e,n,i){this.e=i.optionsEmpty,this.d=i.optionsDefault,this.v=i.value},set:function(e,n){var i=this,o=r(i.e),s=r(i.d),u=r(i.v),c=$(n)?n.models:n,a=c.length,h=!0,l="";a||s||!o?(s&&(c=[s].concat(c)),t.each(c,function(t){l+=i.opt(t,a)})):(l+=i.opt(o,a),h=!1),e.html(l).prop("disabled",!h).val(u);var f=e.val();i.v&&!t.isEqual(u,f)&&i.v(f)},opt:function(t){var e=t,n=t,i=P.optionText,o=P.optionValue;return _(t)&&(e=x(t)?t.get(i):t[i],n=x(t)?t.get(o):t[o]),['<option value="',n,'">',e,"</option>"].join("")},clean:function(){this.d=this.e=this.v=0}}),template:s({init:function(e,n,i){var o=e.find("script,template");return this.t=t.template(o.length?o.html():e.html()),C(n)?t.pick(i,n):void 0},set:function(t,e){e=x(e)?e.toJSON({computed:!0}):e,t.html(this.t(e))},clean:function(){this.t=null}}),text:s({get:function(t){return t.text()},set:function(t,e){t.text(e)}}),toggle:s(function(t,e){t.toggle(!!e)}),value:s({get:function(t){return t.val()},set:function(t,e){try{t.val()+""!=e+""&&t.val(e)}catch(n){}}})},j={all:u(function(){for(var t=arguments,e=0,n=t.length;n>e;e++)if(!t[e])return!1;return!0}),any:u(function(){for(var t=arguments,e=0,n=t.length;n>e;e++)if(t[e])return!0;return!1}),length:u(function(t){return t.length||0}),none:u(function(){for(var t=arguments,e=0,n=t.length;n>e;e++)if(t[e])return!1;return!0}),not:u(function(t){return!t}),format:u(function(t){for(var e=arguments,n=1,i=e.length;i>n;n++)t=t.replace(RegExp("\\$"+n,"g"),e[n]);return t}),select:u(function(t,e,n){return t?e:n}),csv:u({get:function(t){return t+="",t?t.split(","):[]},set:function(t){return C(t)?t.join(","):t}}),integer:u(function(t){return t?parseInt(t,10):0}),decimal:u(function(t){return t?parseFloat(t):0})},q={events:1,itemView:1,optionsDefault:1,optionsEmpty:1};m.binding={allowedParams:q,addHandler:function(t,e){E[t]=s(e)},addFilter:function(t,e){j[t]=u(e)},config:function(e){t.extend(P,e)},emptyCache:function(){B={}}};var F,M=["viewModel","bindings","bindingFilters","bindingHandlers","bindingSources","computeds"];return m.View=e.View.extend({_super:e.View,constructor:function(e){t.extend(this,t.pick(e||{},M)),n(this,"constructor",arguments),this.applyBindings()},b:function(){return this._b||(this._b=[])},bindings:"data-bind",setterOptions:null,applyBindings:function(){this.removeBindings();var n=this,i=t.clone(t.result(n,"bindingSources")),o=n.bindings,r=n.setterOptions,a=t.clone(E),f=t.clone(j),g=n._c={};t.each(t.result(n,"bindingHandlers")||{},function(t,e){a[e]=s(t)}),t.each(t.result(n,"bindingFilters")||{},function(t,e){f[e]=u(t)}),n.model=c(n,g,r,"model"),n.viewModel=c(n,g,r,"viewModel"),n.collection=c(n,g,r,"collection"),n.collection&&n.collection.view&&(n.itemView=n.collection.view),i&&(t.each(i,function(t,e){i[e]=c(i,g,r,e,e)}),n.bindingSources=i),t.each(t.result(n,"computeds")||{},function(t,e){var i=b(t)?t:t.get,o=t.set,r=t.deps;g[e]=function(t){return!w(t)&&o?o.call(n,t):i.apply(n,d(n._c,r))}}),_(o)?t.each(o,function(t,e){var i=h(n,e);_(t)&&(t=p(t)),i.length&&l(n,i,t,g,a,f)}):h(n,"["+o+"]").each(function(){var t=e.$(this);l(n,t,t.attr(o),g,a,f)})},getBinding:function(t){return f(this._c,t)},setBinding:function(t,e){return f(this._c,t,e)},removeBindings:function(){if(this._c=null,this._b)for(;this._b.length;)this._b.pop().dispose()},remove:function(){this.removeBindings(),n(this,"remove",arguments)}},V),t.extend(g.prototype,e.Events,{init:O,get:O,set:O,clean:O,dispose:function(){this.clean(),this.stopListening(),this.$el.off(this.evt),this.$el=this.view=null}}),m});