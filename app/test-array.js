var w1 = ["1","2","3","4","5","6","7"];
var w2 = ["1","2","3"];
var r = [
	{
		q:"1",
		name: "test1"
	},{
		q:"2",
		name: "test2"
	},{
		q:"3",
		name: "test3"
	},{
		q:"4",
		name: "test4"
	},{
		q:"5",
		name: "test5",		
	},{
		q:"6",
		name: "test6"
	},{
		q:"7",
		name: "test7"
	}
];

var l;
var L=[];

function checkWaittingList(){
	l = w2.slice(0,5);
	console.log(l);
	r.forEach(function(x){
		l.forEach(function(y){
			if(y == x.q){
				L.push(x);
			}
		});
	});

	console.log(L);
}

checkWaittingList();