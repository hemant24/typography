var motionText = motionText || {};

fabric.TestFabricKlass = fabric.util.createClass(fabric.Text,{
		type : 'testFabricKlass',
		initialize: function(t) {
			this.callSuper('initialize', t, {});
			this.fabricObject = null;
		},
		show : function(){
			console.log('I am custom class')
		},
		toObject : function(object){
			return fabric.util.object.extend(this.callSuper('toObject'), {
			  fabricObject: this.get('fabricObject'),
			  type : 'testFabricKlass'
			});
		},
		fromObject : function(object){
			var t =  new fabric.TestFabricKlass("clonen")
			//t.set('fabricObject' , new fabric.Text.fromObject(object.fabricObject))
			return t;
	}
  
  });
  
  fabric.TestFabricKlass.fromObject = function(object){
	var t =  new fabric.TestFabricKlass()
	t.set('fabricObject' , new fabric.Text.fromObject(object.fabricObject))
	return t;
  }
  

   